import { HttpException, HttpStatus, Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';
import { Report } from '../reports/entities/report.entity';
import { Project } from '../projects/entities/project.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { Invite, InviteStatus } from '../users/entities/invite.entity';
import {
  AiUnavailableError,
  GroqLike,
  SYSTEM_PROMPT_ASK,
  SYSTEM_PROMPT_SUMMARY,
  buildAdminContextString,
  buildContextString,
  callGroq,
  detectEntities,
  detectTimeframe,
  mondayOf,
} from './ai-chat.logic';

interface ContextFilters {
  projectId?: number;
  userId?: number;
  weekStart?: string;
  weekEnd?: string;
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private readonly groq: GroqLike;
  private readonly model: string;

  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Invite) private readonly inviteRepo: Repository<Invite>,
    private readonly config: ConfigService,
    @Optional() groqClient?: GroqLike,
  ) {
    this.groq = groqClient ?? (new Groq({ apiKey: this.config.get<string>('GROQ_API_KEY') }) as unknown as GroqLike);
    this.model = this.config.get<string>('GROQ_MODEL', 'llama-3.3-70b-versatile');
  }

  private async buildContext(filters: ContextFilters, scopeDescription: string) {
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.versions', 'version')
      .leftJoinAndSelect('version.tasks', 'task')
      .leftJoinAndSelect('version.blockers', 'blocker')
      .leftJoinAndSelect('version.achievements', 'achievement');

    if (filters.projectId) qb.andWhere('report.projectId = :projectId', { projectId: filters.projectId });
    if (filters.userId) qb.andWhere('report.userId = :userId', { userId: filters.userId });
    if (filters.weekStart && filters.weekEnd) {
      qb.andWhere('report.weekStartDate BETWEEN :ws AND :we', { ws: filters.weekStart, we: filters.weekEnd });
    } else if (filters.weekStart) {
      qb.andWhere('report.weekStartDate = :ws', { ws: filters.weekStart });
    }

    const reports = await qb.getMany();
    return {
      contextString: buildContextString(reports as any),
      reportCount: reports.length,
      description: `${reports.length} report${reports.length !== 1 ? 's' : ''} ${scopeDescription}`,
    };
  }

  private async buildAdminContext(): Promise<string> {
    const [pendingRegistrations, pendingInvites, activeUsers] = await Promise.all([
      this.userRepo.find({ where: { status: UserStatus.PENDING }, order: { createdAt: 'ASC' } }),
      this.inviteRepo.find({ where: { status: InviteStatus.PENDING }, order: { createdAt: 'DESC' } }),
      this.userRepo.find({ where: { status: UserStatus.ACTIVE, isActive: true } }),
    ]);

    const rosterByRole: Record<string, number> = {};
    for (const u of activeUsers) {
      rosterByRole[u.role] = (rosterByRole[u.role] ?? 0) + 1;
    }

    return buildAdminContextString({ pendingRegistrations, pendingInvites, rosterByRole });
  }

  private async callModel(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      return await callGroq(this.groq, this.model, systemPrompt, userPrompt);
    } catch (err) {
      if (err instanceof AiUnavailableError) {
        this.logger.error('Groq API call failed', err.cause instanceof Error ? err.cause.stack : err.cause);
        throw new HttpException('AI assistant is temporarily unavailable', HttpStatus.BAD_GATEWAY);
      }
      throw err;
    }
  }

  async ask(question: string): Promise<{ answer: string; contextUsed: string }> {
    const projects = await this.projectRepo.find();
    const users = await this.userRepo.find();
    const matchedProject = detectEntities(question, projects);
    const matchedUser = detectEntities(question, users);
    const timeframe = detectTimeframe(question);

    let weekStart: string | undefined;
    let weekEnd: string | undefined;
    let timeframeLabel: string;
    if (timeframe === 'last-week') {
      weekStart = mondayOf(1);
      timeframeLabel = 'from last week';
    } else if (timeframe === 'this-week') {
      weekStart = mondayOf(0);
      timeframeLabel = 'from this week';
    } else {
      weekStart = mondayOf(1);
      weekEnd = mondayOf(0);
      timeframeLabel = 'from the last 2 weeks';
    }

    const scopeParts = [timeframeLabel];
    scopeParts.push(matchedProject ? `for project ${matchedProject.name}` : 'across all projects');
    if (matchedUser) scopeParts.push(`(${matchedUser.name} only)`);

    const [{ contextString, description }, adminContextString] = await Promise.all([
      this.buildContext(
        { projectId: matchedProject?.id, userId: matchedUser?.id, weekStart, weekEnd },
        scopeParts.join(' '),
      ),
      this.buildAdminContext(),
    ]);

    const fullContext = `=== Reports ===\n${contextString}\n\n=== Team & Admin State ===\n${adminContextString}`;
    const answer = await this.callModel(SYSTEM_PROMPT_ASK, `Context:\n${fullContext}\n\nQuestion: ${question}`);

    return { answer, contextUsed: description };
  }

  async teamSummary(week: string): Promise<{ summary: string; reportsAnalyzed: number }> {
    const { contextString, reportCount } = await this.buildContext(
      { weekStart: week },
      `for the week of ${week}`,
    );

    const summary = await this.callModel(
      SYSTEM_PROMPT_SUMMARY,
      `Team reports for week of ${week}:\n${contextString}`,
    );

    return { summary, reportsAnalyzed: reportCount };
  }
}
