import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PasswordReset, PasswordResetStatus } from './entities/password-reset.entity';
import { User } from './entities/user.entity';

const RESET_TTL_HOURS = 24;
const SALT_ROUNDS = 10;

@Injectable()
export class PasswordResetsService {
  constructor(
    @InjectRepository(PasswordReset) private readonly resetRepo: Repository<PasswordReset>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // Always resolves the same way regardless of whether the email matched a
  // real account — the controller returns one generic message either way,
  // so this never reveals which emails have accounts.
  async requestReset(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return;
    user.passwordResetRequestedAt = new Date();
    await this.userRepo.save(user);
  }

  async findRequested(): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.passwordResetRequestedAt IS NOT NULL')
      .orderBy('user.passwordResetRequestedAt', 'ASC')
      .select(['user.id', 'user.name', 'user.email', 'user.passwordResetRequestedAt'])
      .getMany();
  }

  async createResetToken(userId: number): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TTL_HOURS);

    const reset = await this.resetRepo.save(
      this.resetRepo.create({
        userId,
        token: crypto.randomBytes(24).toString('hex'),
        status: PasswordResetStatus.PENDING,
        expiresAt,
      }),
    );

    user.passwordResetRequestedAt = null;
    await this.userRepo.save(user);

    return reset.token;
  }

  async findValidByToken(token: string): Promise<PasswordReset> {
    const reset = await this.resetRepo.findOne({ where: { token } });
    if (!reset || reset.status !== PasswordResetStatus.PENDING || reset.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired.');
    }
    return reset;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.findValidByToken(token);
    const user = await this.userRepo.findOne({ where: { id: reset.userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.save(user);

    reset.status = PasswordResetStatus.USED;
    await this.resetRepo.save(reset);
  }
}
