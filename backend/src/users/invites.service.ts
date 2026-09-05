import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invite, InviteStatus } from './entities/invite.entity';
import { User } from './entities/user.entity';
import { CreateInviteDto } from './dto/create-invite.dto';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite) private readonly inviteRepo: Repository<Invite>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(invitedById: number, dto: CreateInviteDto): Promise<Invite> {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const existingInvite = await this.inviteRepo.findOne({
      where: { email: dto.email, status: InviteStatus.PENDING },
    });
    if (existingInvite) {
      throw new ConflictException('An invite is already pending for this email.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

    return this.inviteRepo.save(
      this.inviteRepo.create({
        email: dto.email,
        role: dto.role,
        token: crypto.randomBytes(24).toString('hex'),
        invitedById,
        status: InviteStatus.PENDING,
        expiresAt,
      }),
    );
  }

  async findPending(): Promise<Invite[]> {
    return this.inviteRepo.find({
      where: { status: InviteStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: number): Promise<Invite> {
    const invite = await this.inviteRepo.findOne({ where: { id } });
    if (!invite) {
      throw new NotFoundException('Invite not found.');
    }
    invite.status = InviteStatus.REVOKED;
    return this.inviteRepo.save(invite);
  }

  /** Looks up a pending, unexpired invite by token — used by both the
   *  public validation endpoint and register() itself. */
  async findValidByToken(token: string): Promise<Invite> {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (!invite || invite.status !== InviteStatus.PENDING || invite.expiresAt < new Date()) {
      throw new BadRequestException('This invite link is invalid or has expired.');
    }
    return invite;
  }

  async markAccepted(invite: Invite): Promise<void> {
    invite.status = InviteStatus.ACCEPTED;
    await this.inviteRepo.save(invite);
  }
}
