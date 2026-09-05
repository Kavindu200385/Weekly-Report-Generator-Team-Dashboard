import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReportVersion } from './report-version.entity';

export enum TaskType {
  DEVELOPMENT = 'Development',
  TESTING = 'Testing',
  MEETINGS = 'Meetings',
  DOCUMENTATION = 'Documentation',
  OTHER = 'Other',
}

@Entity()
export class ReportHoursByType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportVersion, (version) => version.hours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportVersionId' })
  reportVersion: ReportVersion;

  @Column()
  reportVersionId: number;

  @Column({ type: 'enum', enum: TaskType })
  taskType: TaskType;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  hours: string;
}
