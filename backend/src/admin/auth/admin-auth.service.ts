import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto } from './admin-auth.dto';

export type AdminJwtPayload = {
  sub: number;
  login: string;
};

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const payload: AdminJwtPayload = { sub: user.id, login: user.login };
    const access_token = await this.jwt.signAsync(payload);
    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
      },
    };
  }
}
