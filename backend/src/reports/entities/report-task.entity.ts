import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReportVersion } from './report-version.entity';

@Entity()
export class ReportTask {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportVersion, (version) => version.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportVersionId' })
  reportVersion: ReportVersion;

  @Column()
  reportVersionId: number;

  @Column({ type: 'varchar' })
  taskName: string;

  @Column({ type: 'varchar' })
  priority: string;

  @Column({ type: 'int' })
  plannedPct: number;

  @Column({ type: 'int' })
  actualPct: number;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  timePlannedHrs: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  timeSpentHrs: string;

  @Column({ type: 'text', nullable: true })
  outputDeliverable: string | null;
}
