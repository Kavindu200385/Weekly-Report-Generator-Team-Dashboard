import 'reflect-metadata';
import dataSource from './data-source';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ReportVersion } from '../reports/entities/report-version.entity';
import { ReportTask } from '../reports/entities/report-task.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { ReportAchievement } from '../reports/entities/report-achievement.entity';
import { ReportHoursByType, TaskType } from '../reports/entities/report-hours.entity';
import { ReportReview, ReportReviewAction } from '../reports/entities/report-review.entity';

// One-off: adds the PREVIOUS week's reports (Aug 31 - Sep 4) for the same 4
// real member accounts (hiru=2, yumin=3, sewwandi=4, chathumi=6), giving each
// a two-week history with a different status than their current week so both
// member report-history and manager review-queue/history show real variety.

const WEEK_START = '2026-08-31';
const WEEK_END = '2026-09-04';
const MANAGER_ID = 1;

const taskPool = [
  { name: 'API rate limiter', priority: 'high' },
  { name: 'Dashboard chart refactor', priority: 'medium' },
  { name: 'Auth integration tests', priority: 'critical' },
  { name: 'Onboarding flow redesign', priority: 'medium' },
  { name: 'Connector reliability fix', priority: 'high' },
];

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

type Plan = {
  userId: number;
  projectId: number;
  status: ReportStatus;
  taskOffset: number;
  actualPctRange: [number, number];
  hoursRange: [number, number];
  blockerText: string | null;
  reviewComment?: string;
};

const plans: Plan[] = [
  // hiru — prev week approved (clean), this week submitted
  { userId: 2, projectId: 1, status: ReportStatus.APPROVED, taskOffset: 4, actualPctRange: [90, 100], hoursRange: [30, 36], blockerText: null },
  // yumin — prev week approved (clean), this week needs_correction
  { userId: 3, projectId: 2, status: ReportStatus.APPROVED, taskOffset: 0, actualPctRange: [85, 95], hoursRange: [28, 34], blockerText: null },
  // sewwandi — prev week needs_correction (had an issue), this week approved (fixed)
  { userId: 4, projectId: 3, status: ReportStatus.NEEDS_CORRECTION, taskOffset: 2, actualPctRange: [55, 75], hoursRange: [22, 28], blockerText: 'DBA sign-off pending on schema change.', reviewComment: 'Time entries do not reconcile with planned hours — please correct and resubmit.' },
  // chathumi — prev week submitted (finished), this week draft (mid-progress on new one)
  { userId: 6, projectId: 1, status: ReportStatus.SUBMITTED, taskOffset: 3, actualPctRange: [75, 90], hoursRange: [26, 32], blockerText: null },
];

async function seed() {
  await dataSource.initialize();
  console.log('Data source initialized.');

  const reportRepo = dataSource.getRepository(Report);
  const versionRepo = dataSource.getRepository(ReportVersion);
  const taskRepo = dataSource.getRepository(ReportTask);
  const blockerRepo = dataSource.getRepository(ReportBlocker);
  const achievementRepo = dataSource.getRepository(ReportAchievement);
  const hoursRepo = dataSource.getRepository(ReportHoursByType);
  const reviewRepo = dataSource.getRepository(ReportReview);

  const existing = await reportRepo.find({ where: { weekStartDate: WEEK_START } });
  const existingUserIds = new Set(existing.map((r) => r.userId));

  let reportCount = 0;

  for (const plan of plans) {
    if (existingUserIds.has(plan.userId)) {
      console.log(`Skipping userId ${plan.userId} — report for week ${WEEK_START} already exists.`);
      continue;
    }

    const report = await reportRepo.save(
      reportRepo.create({
        userId: plan.userId,
        projectId: plan.projectId,
        weekStartDate: WEEK_START,
        weekEndDate: WEEK_END,
        status: plan.status,
        tasksPlannedNextWeek: 'Continue current workstream and address open blockers.',
        notes: plan.status === ReportStatus.DRAFT ? null : 'See task table for details.',
      }),
    );
    reportCount++;

    const makeVersion = async (versionNumber: number, submitted: boolean) => {
      const version = await versionRepo.save(
        versionRepo.create({
          reportId: report.id,
          versionNumber,
          submittedAt: submitted ? `${WEEK_END} 09:00:00` : null,
        }),
      );

      const tasksForVersion = [taskPool[plan.taskOffset % taskPool.length], taskPool[(plan.taskOffset + 1) % taskPool.length]];
      const actualPct = randInt(plan.actualPctRange[0], plan.actualPctRange[1]);
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

      if (plan.blockerText) {
        await blockerRepo.save(
          blockerRepo.create({
            reportVersionId: version.id,
            description: plan.blockerText,
            isKeyIssue: true,
          }),
        );
      }

      await achievementRepo.save(
        achievementRepo.create({
          reportVersionId: version.id,
          description: `${taskPool[plan.taskOffset % taskPool.length].name} shipped ahead of schedule.`,
          isKeyAchievement: true,
        }),
      );

      const totalHours = randInt(plan.hoursRange[0], plan.hoursRange[1]);
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

      return version;
    };

    if (plan.status === ReportStatus.DRAFT) {
      await makeVersion(1, false);
      console.log(`Created draft report for userId ${plan.userId}.`);
      continue;
    }

    const version = await makeVersion(1, true);

    if (plan.status === ReportStatus.NEEDS_CORRECTION) {
      await reviewRepo.save(
        reviewRepo.create({
          reportVersionId: version.id,
          reviewerId: MANAGER_ID,
          action: ReportReviewAction.CHANGES_REQUESTED,
          comment: plan.reviewComment ?? 'Please revise and resubmit.',
        }),
      );
    } else if (plan.status === ReportStatus.APPROVED) {
      await reviewRepo.save(
        reviewRepo.create({
          reportVersionId: version.id,
          reviewerId: MANAGER_ID,
          action: ReportReviewAction.APPROVED,
          comment: 'Looks good — approved.',
        }),
      );
    }

    // Every non-draft report always has a trailing open (unsubmitted) version.
    await makeVersion(2, false);
    console.log(`Created ${plan.status} report for userId ${plan.userId}.`);
  }

  console.log(`Seed complete: ${reportCount} new reports created for week ${WEEK_START}.`);
  await dataSource.destroy();
}

seed()
  .then(() => {
    console.log('Previous-week seeding finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Previous-week seeding failed:', err);
    process.exit(1);
  });
