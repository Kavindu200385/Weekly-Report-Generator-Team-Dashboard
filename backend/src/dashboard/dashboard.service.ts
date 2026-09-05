import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ReportVersion } from '../reports/entities/report-version.entity';
import { ReportTask } from '../reports/entities/report-task.entity';
import { ReportHoursByType } from '../reports/entities/report-hours.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { ReportAchievement } from '../reports/entities/report-achievement.entity';
import { ReportReview } from '../reports/entities/report-review.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(ReportVersion) private readonly versionRepo: Repository<ReportVersion>,
    @InjectRepository(ReportTask) private readonly taskRepo: Repository<ReportTask>,
    @InjectRepository(ReportHoursByType) private readonly hoursRepo: Repository<ReportHoursByType>,
    @InjectRepository(ReportBlocker) private readonly blockerRepo: Repository<ReportBlocker>,
    @InjectRepository(ReportAchievement) private readonly achievementRepo: Repository<ReportAchievement>,
    @InjectRepository(ReportReview) private readonly reviewRepo: Repository<ReportReview>,
  ) {}

  // Every submit() call snapshots a new ReportVersion and carries the just-
  // submitted content forward into a fresh open version for further editing
  // (see ReportsService.submit) — so a report that's been revised and
  // resubmitted ends up with multiple ReportVersion rows carrying duplicate
  // task/blocker/achievement/hours content. Aggregation queries must only
  // look at each report's latest version, or they double-count.
  private restrictToLatestVersion(qb: import('typeorm').SelectQueryBuilder<any>, versionAlias: string) {
    return qb.andWhere(
      `${versionAlias}.versionNumber = (SELECT MAX(v2.versionNumber) FROM report_version v2 WHERE v2.reportId = ${versionAlias}.reportId)`,
    );
  }

  async getSummary(week: string) {
    // "Submitted" means the report has been through submission at least
    // once this week — draft (never submitted) must not count, but
    // needs_correction/approved were submitted and stay counted.
    const totalSubmitted = await this.reportRepo.count({
      where: { weekStartDate: week, status: Not(ReportStatus.DRAFT) },
    });

    const activeMemberCount = await this.userRepo.count({
      where: { role: UserRole.MEMBER, isActive: true },
    });
    const complianceRate = activeMemberCount > 0
      ? Math.round((totalSubmitted / activeMemberCount) * 100)
      : 0;

    // Members who haven't submitted are "pending" while the week's window
    // is still open, and "late" once it has closed (Mon-Fri reporting week).
    const weekEnd = new Date(`${week}T00:00:00`);
    weekEnd.setDate(weekEnd.getDate() + 4);
    const weekHasEnded = new Date() > weekEnd;
    const notSubmittedCount = Math.max(0, activeMemberCount - totalSubmitted);
    const pendingCount = weekHasEnded ? 0 : notSubmittedCount;
    const lateCount = weekHasEnded ? notSubmittedCount : 0;

    const needsCorrectionCount = await this.reportRepo.count({
      where: { weekStartDate: week, status: ReportStatus.NEEDS_CORRECTION },
    });

    // "Open" blockers means still-outstanding — once a report is approved
    // its blockers are resolved for dashboard purposes, so they're excluded.
    const openBlockersCount = await this.restrictToLatestVersion(
      this.blockerRepo
        .createQueryBuilder('blocker')
        .innerJoin('blocker.reportVersion', 'version')
        .innerJoin('version.report', 'report')
        .where('report.weekStartDate = :week', { week })
        .andWhere('report.status != :approved', { approved: ReportStatus.APPROVED }),
      'version',
    ).getCount();

    return { totalSubmitted, complianceRate, pendingCount, lateCount, needsCorrectionCount, openBlockersCount };
  }

  async getTeamStatus(week: string) {
    // Base table is active members, not reports — this is what makes
    // "not_started" representable at all, unlike a query that starts from
    // the reports table and can only ever describe members who submitted.
    const rows = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin(Report, 'report', 'report.userId = user.id AND report.weekStartDate = :week', { week })
      .where('user.role = :role', { role: UserRole.MEMBER })
      .andWhere('user.isActive = true')
      .select(['user.id AS userId', 'user.name AS name', 'report.status AS status'])
      .getRawMany();

    return rows.map((r) => ({
      userId: r.userId,
      name: r.name,
      status: r.status ?? 'not_started',
    }));
  }

  async getTasksTrend(weeks: number) {
    const rows = await this.restrictToLatestVersion(
      this.taskRepo
        .createQueryBuilder('task')
        .innerJoin('task.reportVersion', 'version')
        .innerJoin('version.report', 'report')
        .where("task.status = 'done'"),
      'version',
    )
      .select('report.weekStartDate', 'week')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.weekStartDate')
      .orderBy('report.weekStartDate', 'DESC')
      .limit(weeks)
      .getRawMany();

    return rows.reverse().map((r) => ({ week: r.week, count: Number(r.count) }));
  }

  async getWorkloadByProject(week: string) {
    const rows = await this.restrictToLatestVersion(
      this.taskRepo
        .createQueryBuilder('task')
        .innerJoin('task.reportVersion', 'version')
        .innerJoin('version.report', 'report')
        .innerJoin('report.project', 'project')
        .where('report.weekStartDate = :week', { week }),
      'version',
    )
      .select('project.id', 'projectId')
      .addSelect('project.name', 'projectName')
      .addSelect('COUNT(task.id)', 'taskCount')
      .addSelect('SUM(task.timeSpentHrs)', 'totalHours')
      .groupBy('project.id')
      .addGroupBy('project.name')
      .getRawMany();

    return rows.map((r) => ({
      projectId: r.projectId,
      projectName: r.projectName,
      taskCount: Number(r.taskCount),
      totalHours: Number(r.totalHours ?? 0),
    }));
  }

  async getTimeByType(week: string) {
    const rows = await this.restrictToLatestVersion(
      this.hoursRepo
        .createQueryBuilder('hours')
        .innerJoin('hours.reportVersion', 'version')
        .innerJoin('version.report', 'report')
        .where('report.weekStartDate = :week', { week }),
      'version',
    )
      .select('hours.taskType', 'taskType')
      .addSelect('SUM(hours.hours)', 'totalHours')
      .groupBy('hours.taskType')
      .getRawMany();

    return rows.map((r) => ({ taskType: r.taskType, totalHours: Number(r.totalHours) }));
  }

  async getActivityFeed(limit: number) {
    const submissions = await this.versionRepo
      .createQueryBuilder('version')
      .innerJoin('version.report', 'report')
      .innerJoin('report.user', 'user')
      .where('version.submittedAt IS NOT NULL')
      .select('version.submittedAt', 'timestamp')
      .addSelect('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect("'submission'", 'type')
      .orderBy('version.submittedAt', 'DESC')
      .limit(limit)
      .getRawMany();

    const reviews = await this.reviewRepo
      .createQueryBuilder('review')
      .innerJoin('review.reportVersion', 'version')
      .innerJoin('version.report', 'report')
      .innerJoin('report.user', 'user')
      .select('review.createdAt', 'timestamp')
      .addSelect('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect("'review'", 'type')
      .addSelect('review.action', 'action')
      .orderBy('review.createdAt', 'DESC')
      .limit(limit)
      .getRawMany();

    return [...submissions, ...reviews]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getSectionView(week: string, section: 'blockers' | 'achievements') {
    const members = await this.userRepo.find({
      where: { role: UserRole.MEMBER, isActive: true },
      order: { name: 'ASC' },
    });

    if (section === 'blockers') {
      const rows = await this.restrictToLatestVersion(
        this.blockerRepo
          .createQueryBuilder('blocker')
          .innerJoin('blocker.reportVersion', 'version')
          .innerJoin('version.report', 'report')
          .where('report.weekStartDate = :week', { week }),
        'version',
      )
        .select('report.userId', 'userId')
        .addSelect('blocker.description', 'description')
        .addSelect('blocker.isKeyIssue', 'isKeyIssue')
        .getRawMany();

      return members.map((m) => ({
        userId: m.id,
        name: m.name,
        entries: rows
          .filter((r) => r.userId === m.id)
          .map((r) => ({ description: r.description, isKeyIssue: Boolean(r.isKeyIssue) })),
      }));
    }

    const rows = await this.restrictToLatestVersion(
      this.achievementRepo
        .createQueryBuilder('achievement')
        .innerJoin('achievement.reportVersion', 'version')
        .innerJoin('version.report', 'report')
        .where('report.weekStartDate = :week', { week }),
      'version',
    )
      .select('report.userId', 'userId')
      .addSelect('achievement.description', 'description')
      .addSelect('achievement.isKeyAchievement', 'isKeyAchievement')
      .getRawMany();

    return members.map((m) => ({
      userId: m.id,
      name: m.name,
      entries: rows
        .filter((r) => r.userId === m.id)
        .map((r) => ({ description: r.description, isKeyAchievement: Boolean(r.isKeyAchievement) })),
    }));
  }
}
