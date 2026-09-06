// One-off script: replaces user ids 2-6's report history with a fresh,
// varied month of data (Aug 1 -> today). Does NOT touch users/projects/
// passwords — only deletes and regenerates `report` rows (and everything
// that cascades from them) for those 5 accounts, whatever their current
// real names/emails are. Run once via: npx ts-node src/database/reseed-member-history.ts
import 'reflect-metadata';
import { In } from 'typeorm';
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

const MEMBER_IDS = [2, 3, 4, 5, 6];

// Weeks covering Aug 1 -> today (2026-09-06): 5 complete Mon-Fri reporting weeks.
const WEEK_STARTS = ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31'];

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

type Profile = {
  statusWeights: [ReportStatus, number][];
  skipChance: number;
  actualPctRange: [number, number];
  hoursRange: [number, number];
  blockerChance: number;
  blockerTexts: string[];
  achievementTexts: string[];
};

// One profile per member, assigned by position (index into the fetched
// member list) rather than by name, since real names vary per deployment.
const PROFILES: Profile[] = [
  {
    statusWeights: [
      [ReportStatus.APPROVED, 0.75],
      [ReportStatus.SUBMITTED, 0.15],
      [ReportStatus.NEEDS_CORRECTION, 0.1],
    ],
    skipChance: 0,
    actualPctRange: [88, 100],
    hoursRange: [30, 38],
    blockerChance: 0.15,
    blockerTexts: ['Waiting on design sign-off before final polish.'],
    achievementTexts: ['Shipped ahead of schedule with no regressions.'],
  },
  {
    statusWeights: [
      [ReportStatus.APPROVED, 0.5],
      [ReportStatus.SUBMITTED, 0.25],
      [ReportStatus.NEEDS_CORRECTION, 0.25],
    ],
    skipChance: 0,
    actualPctRange: [65, 92],
    hoursRange: [26, 34],
    blockerChance: 0.4,
    blockerTexts: ['DBA sign-off pending on the schema change.', 'Waiting on staging environment access.'],
    achievementTexts: ['Closed out a long-standing flaky test.'],
  },
  {
    statusWeights: [
      [ReportStatus.APPROVED, 0.35],
      [ReportStatus.SUBMITTED, 0.3],
      [ReportStatus.NEEDS_CORRECTION, 0.25],
      [ReportStatus.DRAFT, 0.1],
    ],
    skipChance: 0,
    actualPctRange: [55, 85],
    hoursRange: [22, 30],
    blockerChance: 0.5,
    blockerTexts: ['Waiting on third-party API documentation.', 'Blocked on a dependency upgrade.'],
    achievementTexts: ['Reduced page load time noticeably.'],
  },
  {
    statusWeights: [
      [ReportStatus.NEEDS_CORRECTION, 0.35],
      [ReportStatus.SUBMITTED, 0.3],
      [ReportStatus.APPROVED, 0.25],
      [ReportStatus.DRAFT, 0.1],
    ],
    skipChance: 0.1,
    actualPctRange: [40, 70],
    hoursRange: [18, 40],
    blockerChance: 0.65,
    blockerTexts: ['Vendor API rate limits being hit daily.', 'Waiting on infra team to provision resources.'],
    achievementTexts: ['Found and fixed a memory leak in the worker process.'],
  },
  {
    statusWeights: [
      [ReportStatus.APPROVED, 0.3],
      [ReportStatus.SUBMITTED, 0.25],
      [ReportStatus.DRAFT, 0.25],
      [ReportStatus.NEEDS_CORRECTION, 0.2],
    ],
    skipChance: 0.15,
    actualPctRange: [30, 75],
    hoursRange: [12, 28],
    blockerChance: 0.5,
    blockerTexts: ['Out part of the week; picking work back up now.', 'Waiting on requirements clarification.'],
    achievementTexts: ['Wrote up documentation the whole team can reuse.'],
  },
];

const TASK_POOL = [
  { name: 'API rate limiter', priority: 'high' },
  { name: 'Dashboard chart refactor', priority: 'medium' },
  { name: 'Auth integration tests', priority: 'critical' },
  { name: 'Onboarding flow redesign', priority: 'medium' },
  { name: 'Connector reliability fix', priority: 'high' },
  { name: 'Report export feature', priority: 'medium' },
  { name: 'Mobile layout fixes', priority: 'low' },
  { name: 'Search performance tuning', priority: 'high' },
];

function weightedStatus(profile: Profile): ReportStatus {
  const total = profile.statusWeights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [status, w] of profile.statusWeights) {
    if (r < w) return status;
    r -= w;
  }
  return profile.statusWeights[0][0];
}

async function run() {
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

  const members = await userRepo.find({ where: { id: In(MEMBER_IDS) } });
  if (members.length !== MEMBER_IDS.length) {
    throw new Error(`Expected users ${MEMBER_IDS.join(',')} to all exist, found ${members.map((m) => m.id).join(',')}.`);
  }
  members.sort((a, b) => a.id - b.id);

  const manager = await userRepo.findOne({ where: { role: UserRole.MANAGER } });
  if (!manager) throw new Error('No manager account found.');

  const projects = await projectRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
  if (projects.length === 0) throw new Error('No active projects found.');

  const deleted = await reportRepo.delete({ userId: In(MEMBER_IDS) });
  console.log(`Deleted ${deleted.affected ?? 0} existing report(s) for users ${MEMBER_IDS.join(', ')}.`);

  let reportCount = 0, versionCount = 0, taskCount = 0, blockerCount = 0, achievementCount = 0, hoursCount = 0, reviewCount = 0;

  for (let w = 0; w < WEEK_STARTS.length; w++) {
    const weekStart = WEEK_STARTS[w];
    const weekEnd = addDays(weekStart, 4);

    for (let m = 0; m < members.length; m++) {
      const member = members[m];
      const profile = PROFILES[m % PROFILES.length];
      const project = projects[(m + w) % projects.length];

      if (Math.random() < profile.skipChance) continue;

      const status = weightedStatus(profile);

      const report = await reportRepo.save(
        reportRepo.create({
          userId: member.id,
          projectId: project.id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
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
            submittedAt: submitted ? `${addDays(weekEnd, 1)}T18:30:00.000Z` as any : null,
          }),
        );
        versionCount++;

        const taskCountForVersion = randInt(1, 3);
        const usedTasks = new Set<number>();
        for (let i = 0; i < taskCountForVersion; i++) {
          let idx = randInt(0, TASK_POOL.length - 1);
          while (usedTasks.has(idx) && usedTasks.size < TASK_POOL.length) idx = randInt(0, TASK_POOL.length - 1);
          usedTasks.add(idx);
          const t = TASK_POOL[idx];
          const plannedPct = randInt(80, 100);
          const actualPct = Math.min(100, Math.max(0, randInt(profile.actualPctRange[0], profile.actualPctRange[1]) + randInt(-10, 10)));
          const timePlanned = randInt(4, 12);
          const timeSpent = Math.max(1, timePlanned + randInt(-3, 4));
          await taskRepo.save(
            taskRepo.create({
              reportVersionId: version.id,
              taskName: t.name,
              priority: t.priority,
              plannedPct,
              actualPct,
              status: actualPct >= 95 ? 'done' : actualPct >= 40 ? 'in_progress' : 'blocked',
              timePlannedHrs: timePlanned.toFixed(2),
              timeSpentHrs: timeSpent.toFixed(2),
              outputDeliverable: actualPct >= 95 ? 'Merged to main' : null,
            }),
          );
          taskCount++;
        }

        if (Math.random() < profile.blockerChance) {
          await blockerRepo.save(
            blockerRepo.create({
              reportVersionId: version.id,
              description: pick(profile.blockerTexts),
              isKeyIssue: true,
            }),
          );
          blockerCount++;
        }

        if (Math.random() < 0.7) {
          await achievementRepo.save(
            achievementRepo.create({
              reportVersionId: version.id,
              description: pick(profile.achievementTexts),
              isKeyAchievement: true,
            }),
          );
          achievementCount++;
        }

        const totalHours = randInt(profile.hoursRange[0], profile.hoursRange[1]);
        const weights = [0.55, 0.15, 0.15, 0.1, 0.05];
        const types = [TaskType.DEVELOPMENT, TaskType.TESTING, TaskType.MEETINGS, TaskType.DOCUMENTATION, TaskType.OTHER];
        let remaining = totalHours;
        const hoursEntries: { taskType: TaskType; hours: string }[] = [];
        for (let i = 0; i < types.length; i++) {
          if (Math.random() < 0.15 && i > 0) continue; // occasionally skip a type for variety
          const isLast = i === types.length - 1 || hoursEntries.length >= 3;
          const hrs = isLast ? remaining : Math.max(1, Math.round(totalHours * weights[i]));
          if (hrs <= 0) continue;
          hoursEntries.push({ taskType: types[i], hours: hrs.toFixed(2) });
          remaining -= hrs;
          if (hoursEntries.length >= 4) break;
        }
        await hoursRepo.save(hoursEntries.map((h) => hoursRepo.create({ reportVersionId: version.id, ...h })));
        hoursCount += hoursEntries.length;

        return version;
      };

      if (status === ReportStatus.DRAFT) {
        await makeVersion(1, false);
        continue;
      }

      // ~25% of non-draft reports get a full correction/resubmit cycle for variety.
      if (Math.random() < 0.25) {
        const v1 = await makeVersion(1, true);
        await reviewRepo.save(
          reviewRepo.create({
            reportVersionId: v1.id,
            reviewerId: manager.id,
            action: ReportReviewAction.CHANGES_REQUESTED,
            comment: pick([
              'Time entries do not reconcile with planned hours — please correct and resubmit.',
              'Please add more detail on the blocker before resubmitting.',
              'Numbers look off for one of the tasks — double check and resubmit.',
            ]),
          }),
        );
        reviewCount++;

        const v2 = await makeVersion(2, true);
        if (status === ReportStatus.APPROVED) {
          await reviewRepo.save(
            reviewRepo.create({
              reportVersionId: v2.id,
              reviewerId: manager.id,
              action: ReportReviewAction.APPROVED,
              comment: 'Thanks for the update — approved.',
            }),
          );
          reviewCount++;
        }
        await makeVersion(3, false);
        continue;
      }

      const version = await makeVersion(1, true);

      if (status === ReportStatus.NEEDS_CORRECTION) {
        await reviewRepo.save(
          reviewRepo.create({
            reportVersionId: version.id,
            reviewerId: manager.id,
            action: ReportReviewAction.CHANGES_REQUESTED,
            comment: pick([
              'Please add test coverage numbers before resubmitting.',
              'Missing detail on the achievement — please expand.',
            ]),
          }),
        );
        reviewCount++;
      } else if (status === ReportStatus.APPROVED) {
        await reviewRepo.save(
          reviewRepo.create({
            reportVersionId: version.id,
            reviewerId: manager.id,
            action: ReportReviewAction.APPROVED,
            comment: pick(['Looks good — approved.', 'Nice progress this week, approved.']),
          }),
        );
        reviewCount++;
      }

      await makeVersion(2, false);
    }
  }

  console.log('Reseed complete:');
  console.log({
    members: members.map((m) => `${m.name} <${m.email}>`),
    weeks: WEEK_STARTS,
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

run()
  .then(() => {
    console.log('Reseed finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Reseed failed:', err);
    process.exit(1);
  });
