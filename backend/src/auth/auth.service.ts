import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { InvitesService } from '../users/invites.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RecaptchaService } from './recaptcha/recaptcha.service';

const SALT_ROUNDS = 10;
const FAILED_ATTEMPTS_THRESHOLD = 3;

export interface AuthResult {
  user: { id: number; name: string; email: string; role: UserRole };
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly recaptchaService: RecaptchaService,
    private readonly invitesService: InvitesService,
  ) {}

  private toSafeUser(user: User) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  private signToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '1d') as any },
    );
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const humanVerified = await this.recaptchaService.verifyToken(dto.recaptchaToken);
    if (!humanVerified) {
      throw new BadRequestException('Human verification failed, please try again.');
    }

    // An invite pins both the email and the role — the request body's email
    // is ignored in favor of the invite's, so an invite can't be redeemed
    // under a different address than the manager actually invited.
    const invite = dto.inviteToken ? await this.invitesService.findValidByToken(dto.inviteToken) : null;
    const email = invite ? invite.email : dto.email;
    const role = invite ? invite.role : UserRole.MEMBER;

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userRepo.save(
      this.userRepo.create({
        name: dto.name,
        email,
        passwordHash,
        role,
      }),
    );

    if (invite) {
      await this.invitesService.markAccepted(invite);
    }

    return { user: this.toSafeUser(user), token: this.signToken(user) };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // reCAPTCHA is only demanded once this account has racked up repeated
    // failed attempts — a normal login never touches it.
    if (user.failedLoginAttempts >= FAILED_ATTEMPTS_THRESHOLD) {
      if (!dto.recaptchaToken) {
        throw new BadRequestException('Human verification required after repeated failed attempts.');
      }
      const humanVerified = await this.recaptchaService.verifyToken(dto.recaptchaToken);
      if (!humanVerified) {
        throw new BadRequestException('Human verification failed, please try again.');
      }
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      user.failedLoginAttempts += 1;
      await this.userRepo.save(user);
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      await this.userRepo.save(user);
    }

    return { user: this.toSafeUser(user), token: this.signToken(user) };
  }

  async isRecaptchaRequired(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user ? user.failedLoginAttempts >= FAILED_ATTEMPTS_THRESHOLD : false;
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toSafeUser(user);
  }
}
