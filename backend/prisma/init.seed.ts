import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sitePayloadEn } from './seed-data/site-payload-en';
import { sitePayloadRu } from './seed-data/site-payload-ru';

async function upsertGroupField(
  groupId: number,
  languageId: number,
  field: string,
  content: string,
) {
  await prisma.translation.upsert({
    where: {
      modelId_modelType_field_languageId: {
        modelId: groupId,
        modelType: 'Group',
        field,
        languageId,
      },
    },
    create: {
      languageId,
      modelId: groupId,
      modelType: 'Group',
      field,
      content,
    },
    update: { content },
  });
}

const SITE_MODEL_ID = 1;
const COMPANY_SINGLETON_ID = 1;

function sqliteFilePath(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./dev.db';
  const relative = raw.startsWith('file:') ? raw.slice('file:'.length) : raw;
  return resolve(process.cwd(), relative);
}

const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath() });
const prisma = new PrismaClient({ adapter });

async function upsertSitePayload(languageId: number, payload: object) {
  const content = JSON.stringify(payload);
  await prisma.translation.upsert({
    where: {
      modelId_modelType_field_languageId: {
        modelId: SITE_MODEL_ID,
        modelType: 'Site',
        field: 'payload',
        languageId,
      },
    },
    create: {
      languageId,
      modelId: SITE_MODEL_ID,
      modelType: 'Site',
      field: 'payload',
      content,
    },
    update: { content },
  });
}

const HERO_SEED_UPLOAD_NAME = 'hero-seed-banner.jpg';

/** Copy frontend public asset into API-served `/uploads` so admin `mediaUrl` resolves. */
function seedHeroImagePath(): string | null {
  const uploadsDir = join(process.cwd(), 'uploads');
  const destPath = join(uploadsDir, HERO_SEED_UPLOAD_NAME);
  const srcPath = join(process.cwd(), '../frontend/public/westler/imgSection.jpg');
  mkdirSync(uploadsDir, { recursive: true });
  if (!existsSync(srcPath)) {
    console.warn(
      `Seed: hero image source missing (${srcPath}); Hero #1 image not copied to uploads.`,
    );
    return null;
  }
  copyFileSync(srcPath, destPath);
  return `/uploads/${HERO_SEED_UPLOAD_NAME}`;
}

async function upsertHeroField(
  heroId: number,
  languageId: number,
  field: string,
  content: string,
) {
  await prisma.translation.upsert({
    where: {
      modelId_modelType_field_languageId: {
        modelId: heroId,
        modelType: 'Hero',
        field,
        languageId,
      },
    },
    create: {
      languageId,
      modelId: heroId,
      modelType: 'Hero',
      field,
      content,
    },
    update: { content },
  });
}

async function upsertCompanyField(
  companyId: number,
  languageId: number,
  field: string,
  content: string,
) {
  await prisma.translation.upsert({
    where: {
      modelId_modelType_field_languageId: {
        modelId: companyId,
        modelType: 'Company',
        field,
        languageId,
      },
    },
    create: {
      languageId,
      modelId: companyId,
      modelType: 'Company',
      field,
      content,
    },
    update: { content },
  });
}

async function main() {
  await prisma.language.updateMany({ data: { isDefault: false } });

  const en = await prisma.language.upsert({
    where: { code: 'en' },
    create: {
      name: 'English',
      code: 'en',
      isDefault: true,
      isActive: true,
    },
    update: { name: 'English', isActive: true, isDefault: true },
  });

  const ru = await prisma.language.upsert({
    where: { code: 'ru' },
    create: {
      name: 'Русский',
      code: 'ru',
      isDefault: false,
      isActive: true,
    },
    update: { name: 'Русский', isActive: true },
  });

  await prisma.language.updateMany({
    where: { code: { notIn: ['en', 'ru'] } },
    data: { isActive: false },
  });

  await upsertSitePayload(en.id, sitePayloadEn as unknown as object);
  await upsertSitePayload(ru.id, sitePayloadRu as unknown as object);

  const seoGroup = await prisma.group.upsert({
    where: { slug: 'seo' },
    create: {
      name: 'SEO',
      slug: 'seo',
      description: 'SEO metadata (title, description)',
    },
    update: {
      name: 'SEO',
      description: 'SEO metadata (title, description)',
    },
  });

  for (const [langId, payload] of [
    [en.id, sitePayloadEn],
    [ru.id, sitePayloadRu],
  ] as const) {
    await upsertGroupField(seoGroup.id, langId, 'title', payload.meta.title);
    await upsertGroupField(seoGroup.id, langId, 'description', payload.meta.description);
  }

  const headerGroup = await prisma.group.upsert({
    where: { slug: 'header' },
    create: {
      name: 'Header',
      slug: 'header',
      description: 'Site header navigation and chrome',
    },
    update: {
      name: 'Header',
      description: 'Site header navigation and chrome',
    },
  });

  const footerGroup = await prisma.group.upsert({
    where: { slug: 'footer' },
    create: {
      name: 'Footer',
      slug: 'footer',
      description: 'Site footer copy',
    },
    update: {
      name: 'Footer',
      description: 'Site footer copy',
    },
  });

  const headerByLang = {
    en: sitePayloadEn.header,
    ru: sitePayloadRu.header,
  } as const;

  for (const lang of [en, ru]) {
    const h = headerByLang[lang.code as keyof typeof headerByLang];
    await upsertGroupField(headerGroup.id, lang.id, 'nav.about', h.nav.about);
    await upsertGroupField(
      headerGroup.id,
      lang.id,
      'nav.capabilities',
      h.nav.capabilities,
    );
    await upsertGroupField(
      headerGroup.id,
      lang.id,
      'nav.engineering',
      h.nav.engineering,
    );
    await upsertGroupField(
      headerGroup.id,
      lang.id,
      'nav.contact',
      h.nav.contact,
    );
    await upsertGroupField(headerGroup.id, lang.id, 'discuss', h.discuss);
    await upsertGroupField(
      headerGroup.id,
      lang.id,
      'languageAria',
      h.languageAria,
    );
    await upsertGroupField(headerGroup.id, lang.id, 'menuOpen', h.menuOpen);
    await upsertGroupField(headerGroup.id, lang.id, 'menuClose', h.menuClose);
  }

  await upsertGroupField(
    footerGroup.id,
    en.id,
    'copyright',
    sitePayloadEn.footer.copyright,
  );
  await upsertGroupField(
    footerGroup.id,
    ru.id,
    'copyright',
    sitePayloadRu.footer.copyright,
  );
  await upsertGroupField(
    footerGroup.id,
    en.id,
    'columnsJson',
    JSON.stringify(sitePayloadEn.footer.columns),
  );
  await upsertGroupField(
    footerGroup.id,
    ru.id,
    'columnsJson',
    JSON.stringify(sitePayloadRu.footer.columns),
  );
  await upsertGroupField(
    footerGroup.id,
    en.id,
    'closingCtaJson',
    JSON.stringify(sitePayloadEn.closingCta),
  );
  await upsertGroupField(
    footerGroup.id,
    ru.id,
    'closingCtaJson',
    JSON.stringify(sitePayloadRu.closingCta),
  );

  const globalPresenceGroup = await prisma.group.upsert({
    where: { slug: 'global-presence' },
    create: {
      name: 'Global presence',
      slug: 'global-presence',
      description: 'Global presence section (title, body, map image alt)',
    },
    update: {
      name: 'Global presence',
      description: 'Global presence section (title, body, map image alt)',
    },
  });

  for (const [langId, gp] of [
    [en.id, sitePayloadEn.globalPresence],
    [ru.id, sitePayloadRu.globalPresence],
  ] as const) {
    await upsertGroupField(globalPresenceGroup.id, langId, 'title', gp.title);
    await upsertGroupField(globalPresenceGroup.id, langId, 'body', gp.body);
    await upsertGroupField(globalPresenceGroup.id, langId, 'mapAlt', gp.mapAlt);
  }

  const whyUsGroup = await prisma.group.upsert({
    where: { slug: 'why-us' },
    create: {
      name: 'Why choose us',
      slug: 'why-us',
      description: 'Why us section heading and cards (title, body, icon)',
    },
    update: {
      name: 'Why choose us',
      description: 'Why us section heading and cards (title, body, icon)',
    },
  });

  await upsertGroupField(
    whyUsGroup.id,
    en.id,
    'sectionTitle',
    sitePayloadEn.whyUsSectionTitle,
  );
  await upsertGroupField(
    whyUsGroup.id,
    ru.id,
    'sectionTitle',
    sitePayloadRu.whyUsSectionTitle,
  );
  await upsertGroupField(
    whyUsGroup.id,
    en.id,
    'cardsJson',
    JSON.stringify(sitePayloadEn.whyUs),
  );
  await upsertGroupField(
    whyUsGroup.id,
    ru.id,
    'cardsJson',
    JSON.stringify(sitePayloadRu.whyUs),
  );

  const sectorsGroup = await prisma.group.upsert({
    where: { slug: 'sectors' },
    create: {
      name: 'Industry sectors',
      slug: 'sectors',
      description: 'Industry sectors section heading and cards (title, body, icon)',
    },
    update: {
      name: 'Industry sectors',
      description: 'Industry sectors section heading and cards (title, body, icon)',
    },
  });

  await upsertGroupField(
    sectorsGroup.id,
    en.id,
    'sectionTitle',
    sitePayloadEn.sectorsSectionTitle,
  );
  await upsertGroupField(
    sectorsGroup.id,
    ru.id,
    'sectionTitle',
    sitePayloadRu.sectorsSectionTitle,
  );
  await upsertGroupField(
    sectorsGroup.id,
    en.id,
    'cardsJson',
    JSON.stringify(sitePayloadEn.sectors),
  );
  await upsertGroupField(
    sectorsGroup.id,
    ru.id,
    'cardsJson',
    JSON.stringify(sitePayloadRu.sectors),
  );

  const engineeringGroup = await prisma.group.upsert({
    where: { slug: 'engineering' },
    create: {
      name: 'Engineering',
      slug: 'engineering',
      description: 'Engineering section (heading, points, CTA, image alt)',
    },
    update: {
      name: 'Engineering',
      description: 'Engineering section (heading, points, CTA, image alt)',
    },
  });

  for (const [langId, eng] of [
    [en.id, sitePayloadEn.engineering],
    [ru.id, sitePayloadRu.engineering],
  ] as const) {
    await upsertGroupField(engineeringGroup.id, langId, 'headingLine1', eng.headingLine1);
    await upsertGroupField(engineeringGroup.id, langId, 'headingLine2', eng.headingLine2);
    await upsertGroupField(engineeringGroup.id, langId, 'cta', eng.cta);
    await upsertGroupField(engineeringGroup.id, langId, 'imageAlt', eng.imageAlt);
    await upsertGroupField(
      engineeringGroup.id,
      langId,
      'pointsJson',
      JSON.stringify(eng.points),
    );
  }

  const heroSeedImage = seedHeroImagePath();
  await prisma.hero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      image: heroSeedImage,
      video: null,
    },
    update: {
      ...(heroSeedImage !== null && { image: heroSeedImage }),
      video: null,
    },
  });

  const heroEn = {
    title: 'Engineering Scale.\nDelivering Power.\nGlobally.',
    subtitle:
      '<p>Integrated equipment supply, heavy logistics, and engineering solutions for complex industrial projects.</p>',
    button: 'Start Your Project',
  };
  const heroRu = {
    title: 'Инжиниринг масштаба.\nРеализация силы.\nПо всему миру.',
    subtitle:
      '<p>Комплексные поставки оборудования, тяжёлая логистика и инженерные решения для сложных промышленных проектов.</p>',
    button: 'Начать проект',
  };

  await upsertHeroField(1, en.id, 'title', heroEn.title);
  await upsertHeroField(1, en.id, 'subtitle', heroEn.subtitle);
  await upsertHeroField(1, en.id, 'button', heroEn.button);
  await upsertHeroField(1, ru.id, 'title', heroRu.title);
  await upsertHeroField(1, ru.id, 'subtitle', heroRu.subtitle);
  await upsertHeroField(1, ru.id, 'button', heroRu.button);

  await prisma.company.upsert({
    where: { id: COMPANY_SINGLETON_ID },
    create: {
      id: COMPANY_SINGLETON_ID,
      image: '/westler/imgIndustrialMachineryInspection.jpg',
      openedYear: null,
    },
    update: {},
  });

  await upsertCompanyField(COMPANY_SINGLETON_ID, en.id, 'title', 'Westler');
  await upsertCompanyField(
    COMPANY_SINGLETON_ID,
    en.id,
    'subtitle',
    'Industrial equipment and engineering services.',
  );
  await upsertCompanyField(COMPANY_SINGLETON_ID, ru.id, 'title', 'Westler');
  await upsertCompanyField(
    COMPANY_SINGLETON_ID,
    ru.id,
    'subtitle',
    'Промышленное оборудование и инженерные услуги.',
  );

  const login = process.env.SEED_ADMIN_LOGIN ?? 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters');
  }
  const hash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { login } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Administrator',
        login,
        password: hash,
      },
    });
    console.log(
      `Created admin user login="${login}" (password: SEED_ADMIN_PASSWORD or default admin12345).`,
    );
  } else {
    console.log(`User "${login}" already exists — skipping create.`);
  }

  console.log(
    'Seed complete: languages (en, ru), Site payload, CMS groups (seo, header, footer, global-presence, why-us, sectors, engineering), Hero #1, Company #1, admin user.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
