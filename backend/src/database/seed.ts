import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { User, UserRole } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ReportVersion } from '../reports/entities/report-version.entity';
import { ReportTask } from '../reports/entities/report-task.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { ReportAchievement } from '../reports/entities/report-achievement.entity';
import { ReportHoursByType, TaskType } from '../reports/entities/report-hours.entity';
import { ReportReview, ReportReviewAction } from '../reports/entities/report-review.entity';

const PASSWORD = 'Password123!';

function mondayOf(weeksAgo: number): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  const diffToMonday = (day + 6) % 7;
  const thisMonday = new Date(now);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(now.getDate() - diffToMonday);
  thisMonday.setDate(thisMonday.getDate() - weeksAgo * 7);
  return thisMonday;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

async function seed() {
  await dataSource.initialize();
  console.log('Data source initialized.');

  const userRepo = dataSource.getRepository(User);
  const projectRepo = dataSource.getRepository(Project);
  const reportRepo = dataSource.getRepository(Report);
  const versionRepo = dataSource.getRepository(ReportVersion);
  const taskRepo = dataSource.getRepository(ReportTask);
  const blockerRepo = dataSource.getRepository(ReportBlocker);
  const achievementRepo = dataSource.getRepository(ReportAchievement);
  const hoursRepo = dataSource.getRepository(ReportHoursByType);
  const reviewRepo = dataSource.getRepository(ReportReview);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // --- Users ---
  const manager = await userRepo.save(
    userRepo.create({
      name: 'Sam Okafor',
      email: 'manager@sitrep.test',
      passwordHash,
      role: UserRole.MANAGER,
    }),
  );

  const memberNames = ['Maya Chen', 'James Park', 'Aria Reeves', 'Diego Torres', 'Priya Singh'];
  const members = await userRepo.save(
    memberNames.map((name, i) =>
      userRepo.create({
        name,
        email: `member${i + 1}@sitrep.test`,
        passwordHash,
        role: UserRole.MEMBER,
      }),
    ),
  );
  console.log(`Created ${members.length + 1} users.`);

  // --- Projects ---
  const projects = await projectRepo.save(
    ['Client A', 'Internal Tooling', 'R&D'].map((name, i) =>
      projectRepo.create({
        name,
        description: `${name} project workstream.`,
        isActive: true,
      }),
    ),
  );
  console.log(`Created ${projects.length} projects.`);

  // --- Reports: last 4 weeks x 5 members, deliberate status mix ---
  const statusCycle: ReportStatus[] = [
    ReportStatus.APPROVED,
    ReportStatus.SUBMITTED,
    ReportStatus.NEEDS_CORRECTION,
    ReportStatus.DRAFT,
    ReportStatus.APPROVED,
  ];

  const taskPool = [
    { name: 'API rate limiter', priority: 'high' },
    { name: 'Dashboard chart refactor', priority: 'medium' },
    { name: 'Auth integration tests', priority: 'critical' },
    { name: 'Onboarding flow redesign', priority: 'medium' },
    { name: 'Connector reliability fix', priority: 'high' },
  ];

  let reportCount = 0;
  let versionCount = 0;
  let taskCount = 0;
  let blockerCount = 0;
  let achievementCount = 0;
  let hoursCount = 0;
  let reviewCount = 0;

  // Track one report to give a two-version correction/resubmit cycle.
  let twoVersionAssigned = false;

  for (let weekIdx = 0; weekIdx < 4; weekIdx++) {
    const weekStart = mondayOf(3 - weekIdx); // oldest first
    const weekEnd = addDays(weekStart, 4); // Mon-Fri

    for (let m = 0; m < members.length; m++) {
      const member = members[m];
      const project = projects[(m + weekIdx) % projects.length];
      const status = statusCycle[(m + weekIdx) % statusCycle.length];

      const report = await reportRepo.save(
        reportRepo.create({
          userId: member.id,
          projectId: project.id,
          weekStartDate: toDateStr(weekStart),
          weekEndDate: toDateStr(weekEnd),
          status,
          tasksPlannedNextWeek: 'Continue current workstream and address open blockers.',
          notes: status === ReportStatus.DRAFT ? null : 'See task table for details.',
        }),
      );
      reportCount++;

      const makeVersion = async (versionNumber: number, submitted: boolean) => {
        const version = await versionRepo.save(
          versionRepo.create({
            reportId: report.id,
            versionNumber,
            submittedAt: submitted ? addDays(weekEnd, 1) : null,
          }),
        );
        versionCount++;

        const tasksForVersion = [taskPool[m % taskPool.length], taskPool[(m + 1) % taskPool.length]];
        await taskRepo.save(
          tasksForVersion.map((t, i) =>
            taskRepo.create({
              reportVersionId: version.id,
              taskName: t.name,
              priority: t.priority,
              plannedPct: 100,
              actualPct: i === 0 ? 100 : 60 + m * 5,
              status: i === 0 ? 'done' : 'in-progress',
              timePlannedHrs: '8.00',
              timeSpentHrs: (7 + i).toFixed(2),
              outputDeliverable: i === 0 ? 'Merged to main' : null,
            }),
          ),
        );
        taskCount += tasksForVersion.length;

        await blockerRepo.save(
          blockerRepo.create({
            reportVersionId: version.id,
            description:
              status === ReportStatus.NEEDS_CORRECTION
                ? 'Vendor API rate limits being hit daily.'
                : 'DBA sign-off pending on schema change.',
            isKeyIssue: true,
          }),
        );
        blockerCount++;

        await achievementRepo.save(
          achievementRepo.create({
            reportVersionId: version.id,
            description: `${taskPool[m % taskPool.length].name} shipped ahead of schedule.`,
            isKeyAchievement: true,
          }),
        );
        achievementCount++;

        await hoursRepo.save(
          [
            { taskType: TaskType.DEVELOPMENT, hours: '24.00' },
            { taskType: TaskType.TESTING, hours: '6.00' },
            { taskType: TaskType.MEETINGS, hours: '4.00' },
          ].map((h) =>
            hoursRepo.create({
              reportVersionId: version.id,
              taskType: h.taskType,
              hours: h.hours,
            }),
          ),
        );
        hoursCount += 3;

        return version;
      };

      if (status === ReportStatus.DRAFT) {
        // No version yet — matches the frontend's "empty shell" draft behavior.
        continue;
      }

      // Give the very first eligible report a two-version correction/resubmit cycle.
      if (!twoVersionAssigned && status === ReportStatus.NEEDS_CORRECTION) {
        const v1 = await makeVersion(1, true);
        await reviewRepo.save(
          reviewRepo.create({
            reportVersionId: v1.id,
            reviewerId: manager.id,
            action: ReportReviewAction.CHANGES_REQUESTED,
            comment: 'Time entries do not reconcile with planned hours — please correct and resubmit.',
          }),
        );
        reviewCount++;

        await makeVersion(2, true);
        twoVersionAssigned = true;
        continue;
      }

      const version = await makeVersion(1, true);

      if (status === ReportStatus.NEEDS_CORRECTION) {
        await reviewRepo.save(
          reviewRepo.create({
            reportVersionId: version.id,
            reviewerId: manager.id,
            action: ReportReviewAction.CHANGES_REQUESTED,
            comment: 'Please add test coverage numbers before resubmitting.',
          }),
        );
        reviewCount++;
      } else if (status === ReportStatus.APPROVED) {
        await reviewRepo.save(
          reviewRepo.create({
            reportVersionId: version.id,
            reviewerId: manager.id,
            action: ReportReviewAction.APPROVED,
            comment: 'Looks good — approved.',
          }),
        );
        reviewCount++;
      }
    }
  }

  console.log('Seed complete:');
  console.log({
    users: members.length + 1,
    projects: projects.length,
    reports: reportCount,
    reportVersions: versionCount,
    reportTasks: taskCount,
    reportBlockers: blockerCount,
    reportAchievements: achievementCount,
    reportHours: hoursCount,
    reportReviews: reviewCount,
  });

  await dataSource.destroy();
}

seed()
  .then(() => {
    console.log('Seeding finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
