import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportVersion } from './report-version.entity';
import { User } from '../../users/entities/user.entity';

export enum ReportReviewAction {
  APPROVED = 'approved',
  CHANGES_REQUESTED = 'changes_requested',
}

@Entity()
export class ReportReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportVersion, (version) => version.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportVersionId' })
  reportVersion: ReportVersion;

  @Column()
  reportVersionId: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: number;

  @Column({ type: 'enum', enum: ReportReviewAction })
  action: ReportReviewAction;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
