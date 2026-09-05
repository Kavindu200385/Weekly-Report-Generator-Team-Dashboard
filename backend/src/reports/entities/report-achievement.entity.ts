import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReportVersion } from './report-version.entity';

@Entity()
export class ReportAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportVersion, (version) => version.achievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportVersionId' })
  reportVersion: ReportVersion;

  @Column()
  reportVersionId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  isKeyAchievement: boolean;
}
