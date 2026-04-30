import { Injectable, Logger } from '@nestjs/common';
import { COMPANY_SINGLETON_ID } from '../admin/admin.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

const TELEGRAM_API = 'https://api.telegram.org';
/** Plain-text body max length (Telegram limit is 4096; keep margin). */
const TG_TEXT_MAX = 4000;

@Injectable()
export class PublicOrdersService {
  private readonly logger = new Logger(PublicOrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePublicOrderDto) {
    const companyName = (dto.companyName ?? '').trim();
    const email = dto.email?.trim().toLowerCase() || null;
    const message = dto.message?.trim() || null;
    const order = await this.prisma.order.create({
      data: {
        fullName: dto.fullName.trim(),
        companyName,
        phone: dto.phone.trim(),
        email,
        message,
      },
      select: { id: true },
    });

    void this.notifyAdminsViaTelegram(order.id, dto).catch((err: unknown) => {
      this.logger.warn(
        `Telegram notify failed for order #${order.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    });

    return { id: order.id };
  }

  private formatOrderTelegramText(orderId: number, dto: CreatePublicOrderDto): string {
    const lines = [
      `New order #${orderId}`,
      '',
      `Name: ${dto.fullName.trim()}`,
      `Company: ${(dto.companyName ?? '').trim() || '—'}`,
      `Phone: ${dto.phone.trim()}`,
      `Email: ${dto.email?.trim().toLowerCase() || '—'}`,
      '',
      'Message:',
      dto.message?.trim() || '—',
    ];
    let text = lines.join('\n');
    if (text.length > TG_TEXT_MAX) {
      text = `${text.slice(0, TG_TEXT_MAX - 3)}...`;
    }
    return text;
  }

  /** Sends order summary to Telegram when Company has `chatId` + `botToken` configured. */
  private async notifyAdminsViaTelegram(
    orderId: number,
    dto: CreatePublicOrderDto,
  ): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: COMPANY_SINGLETON_ID },
      select: { chatId: true, botToken: true },
    });
    const chatId = company?.chatId?.trim();
    const botToken = company?.botToken?.trim();
    if (!chatId || !botToken) {
      return;
    }

    const text = this.formatOrderTelegramText(orderId, dto);
    const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 500)}`);
    }
  }
}
