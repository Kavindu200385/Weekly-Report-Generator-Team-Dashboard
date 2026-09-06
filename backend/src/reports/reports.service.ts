import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { ReportVersion } from './entities/report-version.entity';
import { ReportTask } from './entities/report-task.entity';
import { ReportBlocker } from './entities/report-blocker.entity';
import { ReportAchievement } from './entities/report-achievement.entity';
import { ReportHoursByType } from './entities/report-hours.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportsDto } from './dto/filter-reports.dto';

const EDITABLE_STATUSES = [ReportStatus.DRAFT, ReportStatus.NEEDS_CORRECTION];

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(ReportVersion) private readonly versionRepo: Repository<ReportVersion>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateReportDto): Promise<Report> {
    return this.dataSource.transaction(async (manager) => {
      const report = await manager.save(
        manager.create(Report, {
          userId,
          projectId: dto.projectId,
          weekStartDate: dto.weekStartDate,
          weekEndDate: dto.weekEndDate,
          status: ReportStatus.DRAFT,
          tasksPlannedNextWeek: dto.tasksPlannedNextWeek ?? null,
          notes: dto.notes ?? null,
        }),
      );

      await manager.save(
        manager.create(ReportVersion, {
          reportId: report.id,
          versionNumber: 1,
          submittedAt: null,
        }),
      );

      return report;
    });
  }

  /** The version currently open for editing — exactly one exists per report at a time. */
  private async getCurrentVersion(reportId: number, manager = this.dataSource.manager) {
    const version = await manager.findOne(ReportVersion, {
      where: { reportId, submittedAt: IsNull() },
      order: { versionNumber: 'DESC' },
    });
    if (!version) {
      throw new NotFoundException('No open version found for this report.');
    }
    return version;
  }

  private assertOwner(report: Report, userId: number) {
    if (report.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this report.');
    }
  }

  private assertOwnerOrManager(report: Report, userId: number, role: string) {
    if (report.userId !== userId && role !== 'manager') {
      throw new ForbiddenException('You do not have permission to view this report.');
    }
  }

  /**
   * TypeORM's `relations`/`leftJoinAndSelect` pull every column of a joined
   * User (including passwordHash) unless explicitly restricted. Rather than
   * juggle per-query `select` shapes across several methods, every response
   * that embeds a user is passed through this to strip it before it can
   * ever reach the network.
   */
  private omitPasswordHash<T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private assertNoDuplicateKey(dto: UpdateReportDto) {
    if (dto.blockers && dto.blockers.filter((b) => b.isKeyIssue).length > 1) {
      throw new BadRequestException('Only one blocker can be marked as the key issue.');
    }
    if (dto.achievements && dto.achievements.filter((a) => a.isKeyAchievement).length > 1) {
      throw new BadRequestException('Only one achievement can be marked as the key achievement.');
    }
  }

  async update(id: number, userId: number, dto: UpdateReportDto): Promise<Report> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    this.assertOwner(report, userId);
    if (!EDITABLE_STATUSES.includes(report.status)) {
      throw new ForbiddenException('This report can no longer be edited.');
    }
    this.assertNoDuplicateKey(dto);

    return this.dataSource.transaction(async (manager) => {
      const version = await this.getCurrentVersion(report.id, manager);

      if (dto.projectId !== undefined) report.projectId = dto.projectId;
      if (dto.weekStartDate !== undefined) report.weekStartDate = dto.weekStartDate;
      if (dto.weekEndDate !== undefined) report.weekEndDate = dto.weekEndDate;
      if (dto.tasksPlannedNextWeek !== undefined) report.tasksPlannedNextWeek = dto.tasksPlannedNextWeek;
      if (dto.notes !== undefined) report.notes = dto.notes;
      await manager.save(report);

      if (dto.tasks !== undefined) {
        await manager.delete(ReportTask, { reportVersionId: version.id });
        await manager.save(
          dto.tasks.map((t) =>
            manager.create(ReportTask, {
              ...t,
              timePlannedHrs: String(t.timePlannedHrs),
              timeSpentHrs: String(t.timeSpentHrs),
              reportVersionId: version.id,
            }),
          ),
        );
      }
      if (dto.blockers !== undefined) {
        await manager.delete(ReportBlocker, { reportVersionId: version.id });
        await manager.save(
          dto.blockers.map((b) =>
            manager.create(ReportBlocker, { ...b, reportVersionId: version.id }),
          ),
        );
      }
      if (dto.achievements !== undefined) {
        await manager.delete(ReportAchievement, { reportVersionId: version.id });
        await manager.save(
          dto.achievements.map((a) =>
            manager.create(ReportAchievement, { ...a, reportVersionId: version.id }),
          ),
        );
      }
      if (dto.hoursByType !== undefined) {
        await manager.delete(ReportHoursByType, { reportVersionId: version.id });
        await manager.save(
          dto.hoursByType.map((h) =>
            manager.create(ReportHoursByType, {
              taskType: h.taskType,
              hours: String(h.hours),
              reportVersionId: version.id,
            }),
          ),
        );
      }

      return report;
    });
  }

  async findMine(userId: number, filter: FilterReportsDto) {
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoin('report.versions', 'version', 'version.submittedAt IS NOT NULL')
      .addSelect(['version.id', 'version.versionNumber', 'version.submittedAt'])
      .where('report.userId = :userId', { userId })
      .orderBy('report.weekStartDate', 'DESC');

    if (filter.status) qb.andWhere('report.status = :status', { status: filter.status });
    if (filter.projectId) qb.andWhere('report.projectId = :projectId', { projectId: filter.projectId });
    // Both bounds compare against weekStartDate — each report belongs to a
    // single Monday-anchored week, so a "week range" filter means "reports
    // whose week starts within [weekStart, weekEnd]", not a mix of
    // weekStartDate/weekEndDate (that previously excluded a single-week
    // selection entirely, since weekEndDate is always 4 days after weekStart).
    if (filter.weekStart) qb.andWhere('report.weekStartDate >= :weekStart', { weekStart: filter.weekStart });
    if (filter.weekEnd) qb.andWhere('report.weekStartDate <= :weekEnd', { weekEnd: filter.weekEnd });

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findTeam(filter: FilterReportsDto) {
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoinAndSelect('report.user', 'user')
      .orderBy('report.weekStartDate', 'DESC');

    if (filter.status) qb.andWhere('report.status = :status', { status: filter.status });
    if (filter.projectId) qb.andWhere('report.projectId = :projectId', { projectId: filter.projectId });
    if (filter.userId) qb.andWhere('report.userId = :userId', { userId: filter.userId });
    // Both bounds compare against weekStartDate — each report belongs to a
    // single Monday-anchored week, so a "week range" filter means "reports
    // whose week starts within [weekStart, weekEnd]", not a mix of
    // weekStartDate/weekEndDate (that previously excluded a single-week
    // selection entirely, since weekEndDate is always 4 days after weekStart).
    if (filter.weekStart) qb.andWhere('report.weekStartDate >= :weekStart', { weekStart: filter.weekStart });
    if (filter.weekEnd) qb.andWhere('report.weekStartDate <= :weekEnd', { weekEnd: filter.weekEnd });

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: data.map((r) => ({ ...r, user: r.user ? (this.omitPasswordHash(r.user) as typeof r.user) : r.user })),
      total,
      page,
      limit,
    };
  }

  async findOneDetailed(id: number, userId: number, role: string): Promise<Report> {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: {
        project: true,
        user: true,
        versions: {
          tasks: true,
          blockers: true,
          achievements: true,
          hours: true,
          reviews: { reviewer: true },
        },
      },
      order: { versions: { versionNumber: 'ASC' } },
    });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    this.assertOwnerOrManager(report, userId, role);

    if (report.user) {
      report.user = this.omitPasswordHash(report.user) as typeof report.user;
    }
    for (const version of report.versions ?? []) {
      for (const review of version.reviews ?? []) {
        if (review.reviewer) {
          review.reviewer = this.omitPasswordHash(review.reviewer) as typeof review.reviewer;
        }
      }
    }

    return report;
  }

  findMostRecentReview(report: Report) {
    const allReviews = report.versions.flatMap((v) => v.reviews.map((r) => ({ ...r, versionNumber: v.versionNumber })));
    allReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allReviews[0] ?? null;
  }

  async submit(id: number, userId: number): Promise<Report> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    this.assertOwner(report, userId);
    if (!EDITABLE_STATUSES.includes(report.status)) {
      throw new ForbiddenException('This report cannot be submitted in its current state.');
    }

    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(ReportVersion, {
        where: { reportId: id, submittedAt: IsNull() },
        relations: { tasks: true, blockers: true, achievements: true, hours: true },
        order: { versionNumber: 'DESC' },
      });
      if (!current) {
        throw new NotFoundException('No open version found for this report.');
      }

      current.submittedAt = new Date();
      await manager.save(current);

      report.status = ReportStatus.SUBMITTED;
      await manager.save(report);

      const next = await manager.save(
        manager.create(ReportVersion, {
          reportId: id,
          versionNumber: current.versionNumber + 1,
          submittedAt: null,
        }),
      );

      if (current.tasks.length) {
        await manager.save(
          current.tasks.map((t) =>
            manager.create(ReportTask, { ...t, id: undefined, reportVersionId: next.id }),
          ),
        );
      }
      if (current.blockers.length) {
        await manager.save(
          current.blockers.map((b) =>
            manager.create(ReportBlocker, { ...b, id: undefined, reportVersionId: next.id }),
          ),
        );
      }
      if (current.achievements.length) {
        await manager.save(
          current.achievements.map((a) =>
            manager.create(ReportAchievement, { ...a, id: undefined, reportVersionId: next.id }),
          ),
        );
      }
      if (current.hours.length) {
        await manager.save(
          current.hours.map((h) =>
            manager.create(ReportHoursByType, { ...h, id: undefined, reportVersionId: next.id }),
          ),
        );
      }

      return report;
    });
  }

  async getVersions(reportId: number, userId: number, role: string) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    this.assertOwnerOrManager(report, userId, role);

    const versions = await this.versionRepo.find({
      where: { reportId },
      relations: { reviews: true },
      order: { versionNumber: 'ASC' },
    });
    // Only submitted (historical) versions — the current open version is excluded.
    return versions
      .filter((v) => v.submittedAt !== null)
      .map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        submittedAt: v.submittedAt,
        reviews: v.reviews.map((r) => ({ action: r.action, comment: r.comment, createdAt: r.createdAt })),
      }));
  }

  async getVersion(reportId: number, versionId: number, userId: number, role: string) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    this.assertOwnerOrManager(report, userId, role);

    const version = await this.versionRepo.findOne({
      where: { id: versionId, reportId },
      relations: { tasks: true, blockers: true, achievements: true, hours: true, reviews: { reviewer: true } },
    });
    if (!version) {
      throw new NotFoundException('Version not found.');
    }

    for (const review of version.reviews ?? []) {
      if (review.reviewer) {
        review.reviewer = this.omitPasswordHash(review.reviewer) as typeof review.reviewer;
      }
    }

    return version;
  }
}
