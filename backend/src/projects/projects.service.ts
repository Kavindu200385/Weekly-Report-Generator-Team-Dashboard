import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
  ) {}

  async findAll(includeInactive: boolean): Promise<Project[]> {
    return this.projectRepo.find({
      where: includeInactive ? {} : { isActive: true },
      order: { name: 'ASC' },
    });
  }

  private async assertNameAvailable(name: string, excludeId?: number): Promise<void> {
    const qb = this.projectRepo
      .createQueryBuilder('project')
      .where('LOWER(project.name) = LOWER(:name)', { name });
    if (excludeId !== undefined) {
      qb.andWhere('project.id != :excludeId', { excludeId });
    }
    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException('A project with this name already exists.');
    }
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    await this.assertNameAvailable(dto.name);
    return this.projectRepo.save(
      this.projectRepo.create({
        name: dto.name,
        description: dto.description ?? null,
      }),
    );
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (dto.name !== undefined && dto.name.toLowerCase() !== project.name.toLowerCase()) {
      await this.assertNameAvailable(dto.name, id);
    }

    Object.assign(project, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return this.projectRepo.save(project);
  }

  async softDelete(id: number): Promise<{ project: Project; activeReportsAffected: number }> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const activeReportsAffected = await this.reportRepo.count({
      where: {
        projectId: id,
        status: In([ReportStatus.DRAFT, ReportStatus.SUBMITTED]),
      },
    });

    project.isActive = false;
    const saved = await this.projectRepo.save(project);

    return { project: saved, activeReportsAffected };
  }
}
