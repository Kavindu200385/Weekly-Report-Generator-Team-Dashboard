import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { ReportVersion } from './report-version.entity';

export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  NEEDS_CORRECTION = 'needs_correction',
  APPROVED = 'approved',
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Project, (project) => project.reports)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: number;

  @Column({ type: 'date' })
  weekStartDate: string;

  @Column({ type: 'date' })
  weekEndDate: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.DRAFT })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  tasksPlannedNextWeek: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ReportVersion, (version) => version.report)
  versions: ReportVersion[];
}
