import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PasswordResetStatus {
  PENDING = 'pending',
  USED = 'used',
  REVOKED = 'revoked',
}

@Entity()
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'enum', enum: PasswordResetStatus, default: PasswordResetStatus.PENDING })
  status: PasswordResetStatus;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
