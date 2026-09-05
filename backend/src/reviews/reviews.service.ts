import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ReportVersion } from '../reports/entities/report-version.entity';
import { ReportReview, ReportReviewAction } from '../reports/entities/report-review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(ReportVersion) private readonly versionRepo: Repository<ReportVersion>,
    @InjectRepository(ReportReview) private readonly reviewRepo: Repository<ReportReview>,
  ) {}

  private assertOwnerOrManager(report: Report, userId: number, role: string) {
    if (report.userId !== userId && role !== 'manager') {
      throw new ForbiddenException('You do not have permission to view this report.');
    }
  }

  async createReview(reportId: number, reviewerId: number, dto: CreateReviewDto): Promise<Report> {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    if (report.status !== ReportStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted reports can be reviewed.');
    }
    if (dto.action === ReportReviewAction.CHANGES_REQUESTED && !dto.comment?.trim()) {
      throw new BadRequestException('A comment is required when requesting changes.');
    }

    // "current" version for a submitted report is the most recently submitted
    // one (the highest versionNumber with a non-null submittedAt) — a
    // submitted report also has one further, still-open version (created by
    // submit()), which must be skipped here.
    const allVersions = await this.versionRepo.find({
      where: { reportId },
      order: { versionNumber: 'DESC' },
    });
    const version = allVersions.find((v) => v.submittedAt !== null);
    if (!version) {
      throw new NotFoundException('No submitted version found for this report.');
    }

    await this.reviewRepo.save(
      this.reviewRepo.create({
        reportVersionId: version.id,
        reviewerId,
        action: dto.action,
        comment: dto.comment ?? null,
      }),
    );

    report.status =
      dto.action === ReportReviewAction.APPROVED ? ReportStatus.APPROVED : ReportStatus.NEEDS_CORRECTION;
    return this.reportRepo.save(report);
  }

  async getReviewHistory(reportId: number, userId: number, role: string) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    this.assertOwnerOrManager(report, userId, role);

    const reviews = await this.reviewRepo.find({
      where: { reportVersion: { reportId } },
      relations: { reportVersion: true, reviewer: true },
      order: { createdAt: 'ASC' },
    });

    return reviews.map((r) => ({
      versionNumber: r.reportVersion.versionNumber,
      reviewer: { id: r.reviewer.id, name: r.reviewer.name },
      action: r.action,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
  }
}
