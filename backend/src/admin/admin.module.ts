import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminAuthService } from './auth/admin-auth.service';
import { AdminCompaniesController } from './companies/admin-companies.controller';
import { AdminCompaniesService } from './companies/admin-companies.service';
import { AdminGroupItemsController } from './groups/admin-group-items.controller';
import { AdminGroupItemsService } from './groups/admin-group-items.service';
import { AdminGroupsController } from './groups/admin-groups.controller';
import { AdminGroupsService } from './groups/admin-groups.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { AdminHeroesController } from './heroes/admin-heroes.controller';
import { AdminHeroesService } from './heroes/admin-heroes.service';
import { AdminLanguagesController } from './languages/admin-languages.controller';
import { AdminLanguagesService } from './languages/admin-languages.service';
import { AdminMediaController } from './media/admin-media.controller';
import { AdminMediaService } from './media/admin-media.service';
import { AdminOrdersController } from './orders/admin-orders.controller';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminPartnersController } from './partners/admin-partners.controller';
import { AdminPartnersService } from './partners/admin-partners.service';
import { AdminServicesController } from './services/admin-services.controller';
import { AdminServicesService } from './services/admin-services.service';
import { TranslationService } from './translation/translation.service';
import { AdminTranslationsController } from './translations/admin-translations.controller';
import { AdminTranslationsService } from './translations/admin-translations.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error(
            'JWT_SECRET is required. Set it in .env (e.g. openssl rand -hex 32).',
          );
        }
        const sevenDaysSec = 60 * 60 * 24 * 7;
        const expiresRaw = process.env.JWT_EXPIRES_SEC;
        const expiresIn = expiresRaw
          ? Number.parseInt(expiresRaw, 10) || sevenDaysSec
          : sevenDaysSec;
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminUsersController,
    AdminLanguagesController,
    AdminGroupsController,
    AdminGroupItemsController,
    AdminHeroesController,
    AdminCompaniesController,
    AdminServicesController,
    AdminPartnersController,
    AdminTranslationsController,
    AdminMediaController,
    AdminOrdersController,
  ],
  providers: [
    AdminJwtGuard,
    AdminAuthService,
    TranslationService,
    AdminUsersService,
    AdminLanguagesService,
    AdminGroupsService,
    AdminGroupItemsService,
    AdminHeroesService,
    AdminCompaniesService,
    AdminServicesService,
    AdminPartnersService,
    AdminTranslationsService,
    AdminMediaService,
    AdminOrdersService,
  ],
})
export class AdminModule {}
