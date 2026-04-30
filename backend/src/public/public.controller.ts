import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { PublicContentService } from './public-content.service';
import { PublicOrdersService } from './public-orders.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

@Controller('public')
export class PublicController {
  constructor(
    private readonly content: PublicContentService,
    private readonly orders: PublicOrdersService,
  ) {}

  /** Banners (heroes) with copy for the requested UI language (falls back to default site language). */
  @Get('banners')
  getBanners(@Query('lang') lang?: string) {
    return this.content.getBanners(lang);
  }

  /** Active languages for the site (e.g. language selector). */
  @Get('languages')
  getLanguages() {
    return this.content.getActiveLanguages();
  }

  /** Landing page copy (header, footer, sections) per locale — JSON from Translation Site. */
  @Get('site')
  getSite() {
    return this.content.getSitePayloads();
  }

  /** Partners (logos, links, translated titles) for the requested UI language. */
  @Get('partners')
  getPartners(@Query('lang') lang?: string) {
    return this.content.getPartners(lang);
  }

  /** Single company (singleton id=1), copy for `lang` (falls back to default site language). */
  @Get('companies')
  getCompany(@Query('lang') lang?: string) {
    return this.content.getCompany(lang);
  }

  /** Services (capabilities cards) with copy for `lang` (falls back to default site language). */
  @Get('services')
  getServices(@Query('lang') lang?: string) {
    return this.content.getServices(lang);
  }

  /** CMS string groups (header, footer, …) keyed by group `slug` — `strings` + ordered `items`. */
  @Get('groups')
  getGroups(@Query('lang') lang?: string) {
    return this.content.getGroups(lang);
  }

  /** Accept contact / project inquiry from the marketing site (unauthenticated). */
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  createOrder(@Body() dto: CreatePublicOrderDto) {
    return this.orders.create(dto);
  }
}
