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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

  // --- Reports: last 5 weeks x 5 members, per-member performance profiles ---
  type Profile = {
    // weighted status distribution for weeks where a report exists
    statusWeights: [ReportStatus, number][];
    // probability the member skips the week entirely (no report row)
    skipChance: number;
    actualPctRange: [number, number];
    hoursRange: [number, number]; // total hours/week, split across 3 types
    blockerChance: number;
    blockerText: string;
  };

  const profiles: Record<string, Profile> = {
    'Maya Chen': {
      statusWeights: [
        [ReportStatus.APPROVED, 0.8],
        [ReportStatus.SUBMITTED, 0.15],
        [ReportStatus.NEEDS_CORRECTION, 0.05],
      ],
      skipChance: 0,
      actualPctRange: [90, 100],
      hoursRange: [30, 36],
      blockerChance: 0.2,
      blockerText: 'Minor delay waiting on design review sign-off.',
    },
    'James Park': {
      statusWeights: [
        [ReportStatus.APPROVED, 0.6],
        [ReportStatus.SUBMITTED, 0.2],
        [ReportStatus.NEEDS_CORRECTION, 0.2],
      ],
      skipChance: 0,
      actualPctRange: [70, 90],
      hoursRange: [28, 32],
      blockerChance: 0.4,
      blockerText: 'DBA sign-off pending on schema change.',
    },
    'Aria Reeves': {
      statusWeights: [
        [ReportStatus.APPROVED, 0.4],
        [ReportStatus.SUBMITTED, 0.3],
        [ReportStatus.NEEDS_CORRECTION, 0.2],
        [ReportStatus.DRAFT, 0.1],
      ],
      skipChance: 0,
      actualPctRange: [60, 85],
      hoursRange: [24, 30],
      blockerChance: 0.5,
      blockerText: 'Waiting on third-party API documentation.',
    },
    'Diego Torres': {
      statusWeights: [
        [ReportStatus.NEEDS_CORRECTION, 0.4],
        [ReportStatus.SUBMITTED, 0.3],
        [ReportStatus.APPROVED, 0.2],
        [ReportStatus.DRAFT, 0.1],
      ],
      skipChance: 0.1,
      actualPctRange: [40, 65],
      hoursRange: [18, 42],
      blockerChance: 0.8,
      blockerText: 'Vendor API rate limits being hit daily.',
    },
    'Priya Singh': {
      statusWeights: [
        [ReportStatus.APPROVED, 0.3],
        [ReportStatus.SUBMITTED, 0.2],
        [ReportStatus.DRAFT, 0.2],
      ],
      skipChance: 0.3,
      actualPctRange: [30, 70],
      hoursRange: [10, 26],
      blockerChance: 0.5,
      blockerText: 'Out part of the week; picking work back up now.',
    },
  };

  function weightedStatus(profile: Profile): ReportStatus {
    const total = profile.statusWeights.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [status, w] of profile.statusWeights) {
      if (r < w) return status;
      r -= w;
    }
    return profile.statusWeights[0][0];
  }

  function randInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

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

  const WEEKS = 9;

  for (let weekIdx = 0; weekIdx < WEEKS; weekIdx++) {
    const weekStart = mondayOf(WEEKS - 1 - weekIdx); // oldest first
    const weekEnd = addDays(weekStart, 4); // Mon-Fri

    for (let m = 0; m < members.length; m++) {
      const member = members[m];
      const profile = profiles[member.name];
      const project = projects[(m + weekIdx) % projects.length];

      if (Math.random() < profile.skipChance) {
        continue; // no report row this week — team-status shows "not_started"
      }

      const status = weightedStatus(profile);

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
        const actualPct = randInt(profile.actualPctRange[0], profile.actualPctRange[1]);
        await taskRepo.save(
          tasksForVersion.map((t, i) =>
            taskRepo.create({
              reportVersionId: version.id,
              taskName: t.name,
              priority: t.priority,
              plannedPct: 100,
              actualPct: i === 0 ? Math.min(100, actualPct + 15) : actualPct,
              status: actualPct >= 95 ? 'done' : 'in-progress',
              timePlannedHrs: '8.00',
              timeSpentHrs: (7 + i).toFixed(2),
              outputDeliverable: i === 0 && actualPct >= 95 ? 'Merged to main' : null,
            }),
          ),
        );
        taskCount += tasksForVersion.length;

        if (Math.random() < profile.blockerChance) {
          await blockerRepo.save(
            blockerRepo.create({
              reportVersionId: version.id,
              description: profile.blockerText,
              isKeyIssue: true,
            }),
          );
          blockerCount++;
        }

        await achievementRepo.save(
          achievementRepo.create({
            reportVersionId: version.id,
            description: `${taskPool[m % taskPool.length].name} shipped ahead of schedule.`,
            isKeyAchievement: true,
          }),
        );
        achievementCount++;

        const totalHours = randInt(profile.hoursRange[0], profile.hoursRange[1]);
        const devHours = Math.round(totalHours * 0.65);
        const testHours = Math.round(totalHours * 0.2);
        const meetingHours = Math.max(1, totalHours - devHours - testHours);
        await hoursRepo.save(
          [
            { taskType: TaskType.DEVELOPMENT, hours: devHours.toFixed(2) },
            { taskType: TaskType.TESTING, hours: testHours.toFixed(2) },
            { taskType: TaskType.MEETINGS, hours: meetingHours.toFixed(2) },
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
        // Real reports always have exactly one open (unsubmitted) version —
        // create() makes it immediately, so a draft with zero versions is a
        // state the real app can never produce and the editor can't open.
        await makeVersion(1, false);
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
        // submit() always spins up the next open version right away — mirror
        // that here so this report has one to edit/resubmit, same as v1 did.
        await makeVersion(3, false);
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

      // submit() unconditionally creates the next open version at submit
      // time, before any review happens — every non-draft report needs one.
      await makeVersion(2, false);
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
