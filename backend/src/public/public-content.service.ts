import { Injectable } from '@nestjs/common';
import { absolutizeUploadPath } from '../common/upload-url';
import { COMPANY_SINGLETON_ID, ModelType } from '../admin/admin.constants';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
const SITE_MODEL_ID = 1;

export type PublicBannerItem = {
  id: number;
  image: string | null;
  video: string | null;
  title: string;
  subtitle: string;
  button: string;
};

export type PublicPartnerItem = {
  id: number;
  image: string | null;
  link: string;
  title: string;
};

export type PublicServiceItem = {
  id: number;
  image: string | null;
  title: string;
  subtitle: string;
};

export type PublicCompanyItem = {
  id: number;
  image: string | null;
  title: string;
  subtitle: string;
  openedYear: number | null;
  /** Same shape as admin `Company.elements` JSON — `label` = stat figure, `value` = caption. */
  elements: { sections: Array<{ label: string; value: string }> };
};

/** CMS string groups (header, footer, …) — `strings` keyed by field; `items` for ordered rows. */
export type PublicGroupPayload = {
  strings: Record<string, string>;
  items: Array<{
    id: number;
    sortOrder: number;
    title: string;
    subtitle: string;
  }>;
};

function parseCompanyElementsJson(
  raw: Prisma.JsonValue | null,
): { sections: Array<{ label: string; value: string }> } {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { sections: [] };
  }
  const sectionsRaw = (raw as Record<string, unknown>).sections;
  if (!Array.isArray(sectionsRaw)) {
    return { sections: [] };
  }
  const sections: Array<{ label: string; value: string }> = [];
  for (const item of sectionsRaw) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      sections.push({
        label: typeof o.label === 'string' ? o.label : '',
        value: typeof o.value === 'string' ? o.value : '',
      });
    }
  }
  return { sections };
}

@Injectable()
export class PublicContentService {
  constructor(private readonly prisma: PrismaService) {}

  getActiveLanguages() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { code: true, name: true, isDefault: true },
    });
  }

  /**
   * Full landing copy per language (JSON `payload` on Translation modelType Site).
   */
  async getSitePayloads() {
    const langs = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true, code: true },
    });
    const locales: Record<string, unknown> = {};
    for (const lang of langs) {
      const row = await this.prisma.translation.findUnique({
        where: {
          modelId_modelType_field_languageId: {
            modelId: SITE_MODEL_ID,
            modelType: ModelType.Site,
            field: 'payload',
            languageId: lang.id,
          },
        },
      });
      if (row?.content) {
        try {
          locales[lang.code] = JSON.parse(row.content) as unknown;
        } catch {
          locales[lang.code] = {};
        }
      }
    }
    return { locales };
  }

  async getBanners(lang?: string) {
    const active = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    if (active.length === 0) {
      return { lang: null as string | null, banners: [] as PublicBannerItem[] };
    }

    const fallback = active.find((l) => l.isDefault) ?? active[0]!;
    const requested =
      lang && lang.trim() !== ''
        ? active.find((l) => l.code === lang.trim())
        : undefined;
    const effective = requested ?? fallback;

    const heroes = await this.prisma.hero.findMany({
      orderBy: { id: 'asc' },
    });

    const banners: PublicBannerItem[] = [];
    for (const hero of heroes) {
      let t = await this.loadHeroFields(hero.id, effective.id);
      if (this.isTextEmpty(t) && effective.id !== fallback.id) {
        t = await this.loadHeroFields(hero.id, fallback.id);
      }
      banners.push({
        id: hero.id,
        image: absolutizeUploadPath(hero.image),
        video: absolutizeUploadPath(hero.video),
        title: t.title,
        subtitle: t.subtitle,
        button: t.button,
      });
    }

    return { lang: effective.code, banners };
  }

  /** Partners (logos + link) with title for the requested UI language (falls back to default). */
  async getPartners(lang?: string) {
    const active = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    if (active.length === 0) {
      return {
        lang: null as string | null,
        partners: [] as PublicPartnerItem[],
      };
    }

    const fallback = active.find((l) => l.isDefault) ?? active[0]!;
    const requested =
      lang && lang.trim() !== ''
        ? active.find((l) => l.code === lang.trim())
        : undefined;
    const effective = requested ?? fallback;

    const rows = await this.prisma.partner.findMany({
      orderBy: { id: 'asc' },
    });

    const partners: PublicPartnerItem[] = [];
    for (const p of rows) {
      let t = await this.loadPartnerFields(p.id, effective.id);
      if (t.title.trim() === '' && effective.id !== fallback.id) {
        t = await this.loadPartnerFields(p.id, fallback.id);
      }
      partners.push({
        id: p.id,
        image: absolutizeUploadPath(p.image),
        link: p.link,
        title: t.title,
      });
    }

    return { lang: effective.code, partners };
  }

  /** Services (image + title/subtitle per language) for the requested UI language. */
  async getServices(lang?: string) {
    const active = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    if (active.length === 0) {
      return {
        lang: null as string | null,
        services: [] as PublicServiceItem[],
      };
    }

    const fallback = active.find((l) => l.isDefault) ?? active[0]!;
    const requested =
      lang && lang.trim() !== ''
        ? active.find((l) => l.code === lang.trim())
        : undefined;
    const effective = requested ?? fallback;

    const rows = await this.prisma.service.findMany({
      orderBy: { id: 'asc' },
    });

    const services: PublicServiceItem[] = [];
    for (const s of rows) {
      let t = await this.loadServiceFields(s.id, effective.id);
      if (t.title.trim() === '' && effective.id !== fallback.id) {
        t = await this.loadServiceFields(s.id, fallback.id);
      }
      services.push({
        id: s.id,
        image: absolutizeUploadPath(s.image),
        title: t.title,
        subtitle: t.subtitle,
      });
    }

    return { lang: effective.code, services };
  }

  private isTextEmpty(t: { title: string; subtitle: string; button: string }) {
    const blob = `${t.title}${t.subtitle}${t.button}`.trim();
    return blob.length === 0;
  }

  private async loadPartnerFields(partnerId: number, languageId: number) {
    const rows = await this.prisma.translation.findMany({
      where: {
        modelId: partnerId,
        modelType: ModelType.Partner,
        languageId,
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.field, r.content]));
    return {
      title: (map['title'] as string | undefined) ?? '',
    };
  }

  private async loadHeroFields(heroId: number, languageId: number) {
    const rows = await this.prisma.translation.findMany({
      where: {
        modelId: heroId,
        modelType: ModelType.Hero,
        languageId,
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.field, r.content]));
    return {
      title: (map['title'] as string | undefined) ?? '',
      subtitle: (map['subtitle'] as string | undefined) ?? '',
      button: (map['button'] as string | undefined) ?? '',
    };
  }

  private async loadServiceFields(serviceId: number, languageId: number) {
    const rows = await this.prisma.translation.findMany({
      where: {
        modelId: serviceId,
        modelType: ModelType.Service,
        languageId,
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.field, r.content]));
    return {
      title: (map['title'] as string | undefined) ?? '',
      subtitle: (map['subtitle'] as string | undefined) ?? '',
    };
  }

  private async loadGroupFields(groupId: number, languageId: number) {
    const rows = await this.prisma.translation.findMany({
      where: {
        modelId: groupId,
        modelType: ModelType.Group,
        languageId,
      },
    });
    return Object.fromEntries(rows.map((r) => [r.field, r.content])) as Record<
      string,
      string
    >;
  }

  private async loadGroupItemFields(itemId: number, languageId: number) {
    const rows = await this.prisma.translation.findMany({
      where: {
        modelId: itemId,
        modelType: ModelType.GroupItem,
        languageId,
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.field, r.content]));
    return {
      title: (map['title'] as string | undefined) ?? '',
      subtitle: (map['subtitle'] as string | undefined) ?? '',
    };
  }

  private async loadCompanyFields(companyId: number, languageId: number) {
    const rows = await this.prisma.translation.findMany({
      where: {
        modelId: companyId,
        modelType: ModelType.Company,
        languageId,
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.field, r.content]));
    return {
      title: (map['title'] as string | undefined) ?? '',
      subtitle: (map['subtitle'] as string | undefined) ?? '',
    };
  }

  /** Single company (`modelType=Company`, `modelId=1`) with copy for the requested UI language. */
  async getCompany(lang?: string) {
    const active = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    if (active.length === 0) {
      return {
        lang: null as string | null,
        company: null as PublicCompanyItem | null,
      };
    }
    const fallback = active.find((l) => l.isDefault) ?? active[0]!;
    const requested =
      lang && lang.trim() !== ''
        ? active.find((l) => l.code === lang.trim())
        : undefined;
    const effective = requested ?? fallback;

    const row = await this.prisma.company.findUnique({
      where: { id: COMPANY_SINGLETON_ID },
    });
    if (!row) {
      return { lang: effective.code, company: null };
    }

    let t = await this.loadCompanyFields(row.id, effective.id);
    if (t.title.trim() === '' && effective.id !== fallback.id) {
      t = await this.loadCompanyFields(row.id, fallback.id);
    }

    const company: PublicCompanyItem = {
      id: row.id,
      image: absolutizeUploadPath(row.image),
      title: t.title,
      subtitle: t.subtitle,
      openedYear: row.openedYear,
      elements: parseCompanyElementsJson(row.elements),
    };
    return { lang: effective.code, company };
  }

  /**
   * All CMS groups (slug → flat string map + ordered items) for the requested UI language.
   */
  async getGroups(lang?: string) {
    const active = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    if (active.length === 0) {
      return {
        lang: null as string | null,
        groups: {} as Record<string, PublicGroupPayload>,
      };
    }

    const fallback = active.find((l) => l.isDefault) ?? active[0]!;
    const requested =
      lang && lang.trim() !== ''
        ? active.find((l) => l.code === lang.trim())
        : undefined;
    const effective = requested ?? fallback;

    const rows = await this.prisma.group.findMany({
      orderBy: { id: 'asc' },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    const groups: Record<string, PublicGroupPayload> = {};
    for (const g of rows) {
      let strings = await this.loadGroupFields(g.id, effective.id);
      const blob = Object.values(strings).join('').trim();
      if (blob === '' && effective.id !== fallback.id) {
        strings = await this.loadGroupFields(g.id, fallback.id);
      }

      const items: PublicGroupPayload['items'] = [];
      for (const it of g.items) {
        let t = await this.loadGroupItemFields(it.id, effective.id);
        if (t.title.trim() === '' && effective.id !== fallback.id) {
          t = await this.loadGroupItemFields(it.id, fallback.id);
        }
        items.push({
          id: it.id,
          sortOrder: it.sortOrder,
          title: t.title,
          subtitle: t.subtitle,
        });
      }

      groups[g.slug] = { strings, items };
    }

    return { lang: effective.code, groups };
  }
}
