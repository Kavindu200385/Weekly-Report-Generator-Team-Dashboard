import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { ReportReview } from '../../reports/entities/report-review.entity';

export enum UserRole {
  MEMBER = 'member',
  MANAGER = 'manager',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  // Tracks consecutive failed login attempts — used to require reCAPTCHA
  // only after repeated failures, rather than on every login. Reset to 0
  // on a successful login.
  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  // Set when the member clicks "Forgot password?" — flags the account for
  // a manager to see on the Team Members page. Cleared once a manager
  // issues a reset link (see PasswordResetsService.createResetToken).
  @Column({ type: 'datetime', nullable: true, default: null })
  passwordResetRequestedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => ReportReview, (review) => review.reviewer)
  reviews: ReportReview[];
}
