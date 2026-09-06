import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';

const SUBMITTED_OR_LATER = [ReportStatus.SUBMITTED, ReportStatus.NEEDS_CORRECTION, ReportStatus.APPROVED];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(ReportBlocker) private readonly blockerRepo: Repository<ReportBlocker>,
  ) {}

  async findAll(role?: UserRole, includeInactive = false) {
    return this.userRepo.find({
      where: {
        ...(role ? { role } : {}),
        ...(includeInactive ? {} : { isActive: true }),
        status: UserStatus.ACTIVE,
      },
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
      order: { name: 'ASC' },
    });
  }

  async findPendingRegistrations() {
    return this.userRepo.find({
      where: { status: UserStatus.PENDING },
      select: ['id', 'name', 'email', 'createdAt'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveRegistration(id: number, dto: ApproveRegistrationDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException('This account is not awaiting approval.');
    }
    user.role = dto.role;
    user.status = UserStatus.ACTIVE;
    return this.userRepo.save(user);
  }

  async updateRole(id: number, dto: UpdateUserRoleDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === UserRole.MANAGER && dto.role !== UserRole.MANAGER) {
      const activeManagerCount = await this.userRepo.count({
        where: { role: UserRole.MANAGER, isActive: true },
      });
      if (activeManagerCount <= 1) {
        throw new BadRequestException('Cannot change this user\'s role — at least one manager must remain.');
      }
    }

    user.role = dto.role;
    return this.userRepo.save(user);
  }

  async updateDetails(id: number, dto: UpdateUserDetailsDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('An account with this email already exists.');
      }
      user.email = dto.email;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    return this.userRepo.save(user);
  }

  async softDelete(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.role === UserRole.MANAGER) {
      const activeManagerCount = await this.userRepo.count({
        where: { role: UserRole.MANAGER, isActive: true },
      });
      if (activeManagerCount <= 1) {
        throw new BadRequestException('Cannot deactivate this user — at least one manager must remain.');
      }
    }
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async getProfile(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const totalReportsSubmitted = await this.reportRepo.count({
      where: { userId: id, status: In(SUBMITTED_OR_LATER) },
    });
    const approvedCount = await this.reportRepo.count({
      where: { userId: id, status: ReportStatus.APPROVED },
    });
    const currentApprovalRate = totalReportsSubmitted > 0
      ? Math.round((approvedCount / totalReportsSubmitted) * 100)
      : 0;

    // "Open" blockers: attached to any report of this user that's actively
    // in flight (submitted or sent back for correction) — a draft's
    // blockers aren't yet real, and an approved report's are resolved.
    const openBlockersCount = await this.blockerRepo
      .createQueryBuilder('blocker')
      .innerJoin('blocker.reportVersion', 'version')
      .innerJoin('version.report', 'report')
      .where('report.userId = :id', { id })
      .andWhere('report.status IN (:...statuses)', {
        statuses: [ReportStatus.SUBMITTED, ReportStatus.NEEDS_CORRECTION],
      })
      .getCount();

    const recentReports = await this.reportRepo.find({
      where: { userId: id },
      order: { weekStartDate: 'DESC' },
      take: 10,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      stats: { totalReportsSubmitted, currentApprovalRate, openBlockersCount },
      recentReports: recentReports.map((r) => ({
        id: r.id,
        week: r.weekStartDate,
        status: r.status,
      })),
    };
  }
}
