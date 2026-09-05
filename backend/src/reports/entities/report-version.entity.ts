import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { ReportTask } from './report-task.entity';
import { ReportBlocker } from './report-blocker.entity';
import { ReportAchievement } from './report-achievement.entity';
import { ReportHoursByType } from './report-hours.entity';
import { ReportReview } from './report-review.entity';

@Entity()
export class ReportVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, (report) => report.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column()
  reportId: number;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @OneToMany(() => ReportTask, (task) => task.reportVersion)
  tasks: ReportTask[];

  @OneToMany(() => ReportBlocker, (blocker) => blocker.reportVersion)
  blockers: ReportBlocker[];

  @OneToMany(() => ReportAchievement, (achievement) => achievement.reportVersion)
  achievements: ReportAchievement[];

  @OneToMany(() => ReportHoursByType, (hours) => hours.reportVersion)
  hours: ReportHoursByType[];

  @OneToMany(() => ReportReview, (review) => review.reportVersion)
  reviews: ReportReview[];
}
