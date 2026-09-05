import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReportVersion } from './report-version.entity';

@Entity()
export class ReportBlocker {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportVersion, (version) => version.blockers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportVersionId' })
  reportVersion: ReportVersion;

  @Column()
  reportVersionId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  isKeyIssue: boolean;
}
