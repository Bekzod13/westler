<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Hero;
use App\Models\Language;
use App\Models\Translation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    private function upsertGroupField(int $groupId, int $languageId, string $field, string $content): void
    {
        Translation::updateOrCreate(
            ['model_id' => $groupId, 'model_type' => 'Group', 'field' => $field, 'language_id' => $languageId],
            ['content' => $content],
        );
    }

    private function upsertSitePayload(int $languageId, array $payload): void
    {
        Translation::updateOrCreate(
            ['model_id' => 1, 'model_type' => 'Site', 'field' => 'payload', 'language_id' => $languageId],
            ['content' => json_encode($payload, JSON_UNESCAPED_UNICODE)],
        );
    }

    private function upsertHeroField(int $heroId, int $languageId, string $field, string $content): void
    {
        Translation::updateOrCreate(
            ['model_id' => $heroId, 'model_type' => 'Hero', 'field' => $field, 'language_id' => $languageId],
            ['content' => $content],
        );
    }

    private function upsertCompanyField(int $companyId, int $languageId, string $field, string $content): void
    {
        Translation::updateOrCreate(
            ['model_id' => $companyId, 'model_type' => 'Company', 'field' => $field, 'language_id' => $languageId],
            ['content' => $content],
        );
    }

    public function run(): void
    {
        // Languages
        Language::query()->update(['is_default' => false]);

        $en = Language::updateOrCreate(['code' => 'en'], ['name' => 'English', 'is_default' => true, 'is_active' => true]);
        $ru = Language::updateOrCreate(['code' => 'ru'], ['name' => 'Русский', 'is_default' => false, 'is_active' => true]);

        Language::whereNotIn('code', ['en', 'ru'])->update(['is_active' => false]);

        // Site payloads
        $siteEn = $this->sitePayloadEn();
        $siteRu = $this->sitePayloadRu();
        $this->upsertSitePayload($en->id, $siteEn);
        $this->upsertSitePayload($ru->id, $siteRu);

        // CMS Groups
        $groups = [
            'seo' => ['name' => 'SEO', 'description' => 'SEO metadata (title, description)'],
            'header' => ['name' => 'Header', 'description' => 'Site header navigation and chrome'],
            'footer' => ['name' => 'Footer', 'description' => 'Site footer copy'],
            'global-presence' => ['name' => 'Global presence', 'description' => 'Global presence section'],
            'why-us' => ['name' => 'Why choose us', 'description' => 'Why us section heading and cards'],
            'sectors' => ['name' => 'Industry sectors', 'description' => 'Industry sectors section'],
            'engineering' => ['name' => 'Engineering', 'description' => 'Engineering section'],
        ];

        $groupModels = [];
        foreach ($groups as $slug => $data) {
            $groupModels[$slug] = \App\Models\Group::updateOrCreate(['slug' => $slug], $data);
        }

        // SEO group
        foreach ([[$en->id, $siteEn], [$ru->id, $siteRu]] as [$langId, $payload]) {
            $this->upsertGroupField($groupModels['seo']->id, $langId, 'title', $payload['meta']['title']);
            $this->upsertGroupField($groupModels['seo']->id, $langId, 'description', $payload['meta']['description']);
        }

        // Header group
        foreach ([[$en, $siteEn], [$ru, $siteRu]] as [$lang, $payload]) {
            $h = $payload['header'];
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'nav.about', $h['nav']['about']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'nav.capabilities', $h['nav']['capabilities']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'nav.engineering', $h['nav']['engineering']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'nav.contact', $h['nav']['contact']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'discuss', $h['discuss']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'languageAria', $h['languageAria']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'menuOpen', $h['menuOpen']);
            $this->upsertGroupField($groupModels['header']->id, $lang->id, 'menuClose', $h['menuClose']);
        }

        // Footer group
        foreach ([[$en, $siteEn], [$ru, $siteRu]] as [$lang, $payload]) {
            $this->upsertGroupField($groupModels['footer']->id, $lang->id, 'copyright', $payload['footer']['copyright']);
            $this->upsertGroupField($groupModels['footer']->id, $lang->id, 'columnsJson', json_encode($payload['footer']['columns'], JSON_UNESCAPED_UNICODE));
            $this->upsertGroupField($groupModels['footer']->id, $lang->id, 'closingCtaJson', json_encode($payload['closingCta'], JSON_UNESCAPED_UNICODE));
        }

        // Global presence
        foreach ([[$en->id, $siteEn], [$ru->id, $siteRu]] as [$langId, $payload]) {
            $gp = $payload['globalPresence'];
            $this->upsertGroupField($groupModels['global-presence']->id, $langId, 'title', $gp['title']);
            $this->upsertGroupField($groupModels['global-presence']->id, $langId, 'body', $gp['body']);
            $this->upsertGroupField($groupModels['global-presence']->id, $langId, 'mapAlt', $gp['mapAlt']);
        }

        // Why us
        foreach ([[$en, $siteEn], [$ru, $siteRu]] as [$lang, $payload]) {
            $this->upsertGroupField($groupModels['why-us']->id, $lang->id, 'sectionTitle', $payload['whyUsSectionTitle']);
            $this->upsertGroupField($groupModels['why-us']->id, $lang->id, 'cardsJson', json_encode($payload['whyUs'], JSON_UNESCAPED_UNICODE));
        }

        // Sectors
        foreach ([[$en, $siteEn], [$ru, $siteRu]] as [$lang, $payload]) {
            $this->upsertGroupField($groupModels['sectors']->id, $lang->id, 'sectionTitle', $payload['sectorsSectionTitle']);
            $this->upsertGroupField($groupModels['sectors']->id, $lang->id, 'cardsJson', json_encode($payload['sectors'], JSON_UNESCAPED_UNICODE));
        }

        // Engineering
        foreach ([[$en, $siteEn], [$ru, $siteRu]] as [$lang, $payload]) {
            $eng = $payload['engineering'];
            $this->upsertGroupField($groupModels['engineering']->id, $lang->id, 'headingLine1', $eng['headingLine1']);
            $this->upsertGroupField($groupModels['engineering']->id, $lang->id, 'headingLine2', $eng['headingLine2']);
            $this->upsertGroupField($groupModels['engineering']->id, $lang->id, 'cta', $eng['cta']);
            $this->upsertGroupField($groupModels['engineering']->id, $lang->id, 'imageAlt', $eng['imageAlt']);
            $this->upsertGroupField($groupModels['engineering']->id, $lang->id, 'pointsJson', json_encode($eng['points'], JSON_UNESCAPED_UNICODE));
        }

        // Hero
        $hero = Hero::updateOrCreate(['id' => 1], ['image' => '/westler/imgSection.jpg', 'video' => null]);

        $this->upsertHeroField(1, $en->id, 'title', "Engineering Scale.\nDelivering Power.\nGlobally.");
        $this->upsertHeroField(1, $en->id, 'subtitle', '<p>Integrated equipment supply, heavy logistics, and engineering solutions for complex industrial projects.</p>');
        $this->upsertHeroField(1, $en->id, 'button', 'Start Your Project');
        $this->upsertHeroField(1, $ru->id, 'title', "Инжиниринг масштаба.\nРеализация силы.\nПо всему миру.");
        $this->upsertHeroField(1, $ru->id, 'subtitle', '<p>Комплексные поставки оборудования, тяжёлая логистика и инженерные решения для сложных промышленных проектов.</p>');
        $this->upsertHeroField(1, $ru->id, 'button', 'Начать проект');

        // Company
        Company::updateOrCreate(['id' => 1], ['image' => '/westler/imgIndustrialMachineryInspection.jpg', 'opened_year' => null]);

        $this->upsertCompanyField(1, $en->id, 'title', 'Westler');
        $this->upsertCompanyField(1, $en->id, 'subtitle', 'Industrial equipment and engineering services.');
        $this->upsertCompanyField(1, $ru->id, 'title', 'Westler');
        $this->upsertCompanyField(1, $ru->id, 'subtitle', 'Промышленное оборудование и инженерные услуги.');

        // Admin user
        $login = env('SEED_ADMIN_LOGIN', 'admin');
        $password = env('SEED_ADMIN_PASSWORD', 'admin12345');

        if (!User::where('login', $login)->exists()) {
            User::create(['name' => 'Administrator', 'login' => $login, 'password' => $password]);
            $this->command->info("Created admin user login=\"{$login}\"");
        } else {
            $this->command->info("User \"{$login}\" already exists — skipping.");
        }

        $this->command->info('Seed complete: languages, Site payload, CMS groups, Hero #1, Company #1, admin user.');
    }

    private function sitePayloadEn(): array
    {
        return [
            'meta' => ['title' => 'WESTLER — Industrial Solutions', 'description' => 'Integrated equipment supply, heavy logistics, and engineering solutions for complex industrial projects.'],
            'brand' => 'WESTLER ENGINEERING',
            'header' => ['nav' => ['about' => 'About', 'capabilities' => 'Capabilities', 'engineering' => 'Engineering', 'contact' => 'Contact'], 'discuss' => 'Discuss Your Project', 'languageAria' => 'Language', 'menuOpen' => 'Open menu', 'menuClose' => 'Close menu'],
            'heroSlider' => ['loading' => 'Loading…', 'prevAria' => 'Previous slide', 'nextAria' => 'Next slide', 'slideAria' => 'Slide', 'emptyCta' => 'Start Your Project'],
            'about' => ['headingLine1' => 'Industrial Solutions', 'headingLine2' => 'Without Limits', 'p1' => 'We deliver integrated industrial solutions where precision, scale, and accountability define every stage of execution.', 'p2' => 'Operating across international markets with a strong focus on Central Asia.', 'imageAlt' => 'Industrial machinery inspection'],
            'stats' => [['value' => '15+', 'label' => 'Years Experience'], ['value' => '10+', 'label' => 'Countries Served'], ['value' => '40+', 'label' => 'Completed Projects'], ['value' => '10+', 'label' => 'Strategic Partners']],
            'capabilitiesSectionTitle' => 'Our Capabilities',
            'capabilities' => [
                ['title' => 'Equipment Supply', 'body' => 'Precision sourcing aligned with technical specifications. Certified suppliers. Global delivery.', 'image' => '/westler/imgEquipmentSupply.jpg'],
                ['title' => 'Global Logistics', 'body' => 'Heavy lift. Oversized cargo. Complex routes. End-to-end coordination worldwide.', 'image' => '/westler/imgGlobalLogistics.jpg'],
                ['title' => 'Project Execution', 'body' => 'Strategic planning. Budget control. On-site supervision. Full lifecycle management.', 'image' => '/westler/imgProjectExecution.jpg'],
                ['title' => 'Engineering', 'body' => 'Design review. System integration. Technical consulting. Performance optimization.', 'image' => '/westler/imgEngineering.jpg'],
            ],
            'sectorsSectionTitle' => 'Industry Sectors We Serve',
            'sectors' => [['title' => 'CNC Metal Processing', 'body' => 'Precision machining and custom metal components.', 'iconVariant' => '2'], ['title' => 'Construction & Heavy Equipment', 'body' => 'Engineering solutions for infrastructure.', 'iconVariant' => '4'], ['title' => 'Injection Molding', 'body' => 'Technical equipment for plastic injection.', 'iconVariant' => '6'], ['title' => 'Oil & Gas', 'body' => 'Industrial-grade equipment for operations.', 'iconVariant' => '8'], ['title' => 'Chemical & Process Industry', 'body' => 'Specialized supply for processing facilities.', 'iconVariant' => '10'], ['title' => 'Laboratory & Testing Solutions', 'body' => 'Supply of laboratory equipment and testing systems.', 'iconVariant' => '12']],
            'engineering' => ['headingLine1' => 'Where Engineering', 'headingLine2' => 'Meets Execution', 'points' => [['label' => 'Technical audits', 'variant' => '15'], ['label' => 'CAD-based review', 'variant' => '16'], ['label' => 'Risk analysis', 'variant' => '17'], ['label' => 'Compliance verification', 'variant' => '18'], ['label' => 'Optimization strategies', 'variant' => '19']], 'cta' => 'Request Technical Consultation', 'imageAlt' => 'Engineering CAD review'],
            'whyUsSectionTitle' => 'Why Choose Us',
            'whyUs' => [['title' => 'Strategic Coordination', 'body' => 'Clear coordination of processes.', 'iconVariant' => '21'], ['title' => 'International Standards', 'body' => 'Compliance with international standards.', 'iconVariant' => '22'], ['title' => 'Reliable Global Network', 'body' => 'Verified suppliers across 20+ countries.', 'iconVariant' => '23'], ['title' => 'Precision & Accountability', 'body' => 'Accuracy and responsibility in every detail.', 'iconVariant' => '24'], ['title' => 'Scalable Solutions', 'body' => 'Flexible and scalable solutions.', 'iconVariant' => '25'], ['title' => 'Transparent Communication', 'body' => 'Open communication at every stage.', 'iconVariant' => '26']],
            'partnersSectionTitle' => 'Our Strategic Partners',
            'globalPresence' => ['title' => 'Global Presence', 'body' => 'Delivering industrial excellence across global markets with a strong presence in Central Asia.', 'mapAlt' => 'World map showing WESTLER global presence'],
            'closingCta' => ['headingLine1' => "Let's turn complexity into", 'headingLine2' => 'performance.', 'buttonLabel' => 'Our specialists are ready to review your technical requirements and provide structured guidance.'],
            'footer' => ['columns' => [['title' => 'About', 'links' => [['label' => 'Our Story', 'href' => '#'], ['label' => 'Leadership', 'href' => '#'], ['label' => 'Careers', 'href' => '#'], ['label' => 'News', 'href' => '#']]], ['title' => 'Capabilities', 'links' => [['label' => 'Equipment Supply', 'href' => '#capabilities'], ['label' => 'Global Logistics', 'href' => '#capabilities'], ['label' => 'Project Execution', 'href' => '#capabilities'], ['label' => 'Engineering', 'href' => '#capabilities']]], ['title' => 'Engineering', 'links' => [['label' => 'Technical Audits', 'href' => '#engineering'], ['label' => 'CAD Review', 'href' => '#engineering'], ['label' => 'Risk Analysis', 'href' => '#engineering'], ['label' => 'Compliance', 'href' => '#engineering']]], ['title' => 'Contact', 'links' => [['label' => 'info@westler.com', 'href' => 'mailto:info@westler.com'], ['label' => '+44 20 7946 0958', 'href' => 'tel:+442079460958'], ['label' => 'London, UK', 'href' => '#contact']]]], 'copyright' => 'WESTLER ENGINEERING LIMITED'],
            'contactModal' => ['title' => 'Discuss Your Project', 'closeDialogAria' => 'Close dialog', 'closeButtonAria' => 'Close', 'fullName' => 'Full Name', 'companyName' => 'Company Name', 'phone' => 'Phone Number', 'phonePlaceholder' => 'Phone number', 'phoneError' => 'Enter a valid phone number.', 'email' => 'Email', 'message' => 'Message', 'submit' => 'Send Message'],
        ];
    }

    private function sitePayloadRu(): array
    {
        return [
            'meta' => ['title' => 'WESTLER — Промышленные решения', 'description' => 'Комплексные поставки оборудования, тяжёлая логистика и инженерные решения для сложных промышленных проектов.'],
            'brand' => 'WESTLER ENGINEERING',
            'header' => ['nav' => ['about' => 'О компании', 'capabilities' => 'Возможности', 'engineering' => 'Инжиниринг', 'contact' => 'Контакты'], 'discuss' => 'Обсудить проект', 'languageAria' => 'Язык', 'menuOpen' => 'Открыть меню', 'menuClose' => 'Закрыть меню'],
            'heroSlider' => ['loading' => 'Загрузка…', 'prevAria' => 'Предыдущий слайд', 'nextAria' => 'Следующий слайд', 'slideAria' => 'Слайд', 'emptyCta' => 'Начать проект'],
            'about' => ['headingLine1' => 'Промышленные решения', 'headingLine2' => 'без ограничений', 'p1' => 'Мы поставляем комплексные промышленные решения, где точность, масштаб и ответственность определяют каждый этап реализации.', 'p2' => 'Работаем на международных рынках с акцентом на Центральную Азию.', 'imageAlt' => 'Осмотр промышленного оборудования'],
            'stats' => [['value' => '15+', 'label' => 'Лет опыта'], ['value' => '10+', 'label' => 'Стран'], ['value' => '40+', 'label' => 'Проектов'], ['value' => '10+', 'label' => 'Партнёров']],
            'capabilitiesSectionTitle' => 'Наши возможности',
            'capabilities' => [
                ['title' => 'Поставка оборудования', 'body' => 'Точный подбор по техническим спецификациям. Сертифицированные поставщики.', 'image' => '/westler/imgEquipmentSupply.jpg'],
                ['title' => 'Глобальная логистика', 'body' => 'Тяжёлые грузы. Негабаритные перевозки. Координация по всему миру.', 'image' => '/westler/imgGlobalLogistics.jpg'],
                ['title' => 'Реализация проектов', 'body' => 'Стратегическое планирование. Контроль бюджета. Управление жизненным циклом.', 'image' => '/westler/imgProjectExecution.jpg'],
                ['title' => 'Инжиниринг', 'body' => 'Обзор проектов. Системная интеграция. Оптимизация производительности.', 'image' => '/westler/imgEngineering.jpg'],
            ],
            'sectorsSectionTitle' => 'Отрасли промышленности',
            'sectors' => [['title' => 'Обработка металла ЧПУ', 'body' => 'Точная механообработка.', 'iconVariant' => '2'], ['title' => 'Строительство', 'body' => 'Инженерные решения для инфраструктуры.', 'iconVariant' => '4'], ['title' => 'Литьё под давлением', 'body' => 'Оборудование для пластмассового литья.', 'iconVariant' => '6'], ['title' => 'Нефть и газ', 'body' => 'Промышленное оборудование для операций.', 'iconVariant' => '8'], ['title' => 'Химия и переработка', 'body' => 'Специализированные поставки.', 'iconVariant' => '10'], ['title' => 'Лаборатории', 'body' => 'Лабораторное оборудование и системы.', 'iconVariant' => '12']],
            'engineering' => ['headingLine1' => 'Инжиниринг', 'headingLine2' => 'и реализация', 'points' => [['label' => 'Технические аудиты', 'variant' => '15'], ['label' => 'CAD-обзор', 'variant' => '16'], ['label' => 'Анализ рисков', 'variant' => '17'], ['label' => 'Проверка соответствия', 'variant' => '18'], ['label' => 'Оптимизация', 'variant' => '19']], 'cta' => 'Запросить консультацию', 'imageAlt' => 'CAD-обзор'],
            'whyUsSectionTitle' => 'Почему мы',
            'whyUs' => [['title' => 'Стратегическая координация', 'body' => 'Чёткая координация процессов.', 'iconVariant' => '21'], ['title' => 'Международные стандарты', 'body' => 'Соответствие международным стандартам.', 'iconVariant' => '22'], ['title' => 'Надёжная глобальная сеть', 'body' => 'Проверенные поставщики в 20+ странах.', 'iconVariant' => '23'], ['title' => 'Точность и ответственность', 'body' => 'Внимание к каждой детали.', 'iconVariant' => '24'], ['title' => 'Масштабируемые решения', 'body' => 'Гибкие и масштабируемые.', 'iconVariant' => '25'], ['title' => 'Прозрачная коммуникация', 'body' => 'Открытая коммуникация на каждом этапе.', 'iconVariant' => '26']],
            'partnersSectionTitle' => 'Стратегические партнёры',
            'globalPresence' => ['title' => 'Глобальное присутствие', 'body' => 'Промышленное превосходство на мировых рынках.', 'mapAlt' => 'Карта мира с присутствием WESTLER'],
            'closingCta' => ['headingLine1' => 'Превратим сложность', 'headingLine2' => 'в результат.', 'buttonLabel' => 'Наши специалисты готовы изучить ваши технические требования.'],
            'footer' => ['columns' => [['title' => 'О компании', 'links' => [['label' => 'Наша история', 'href' => '#'], ['label' => 'Руководство', 'href' => '#'], ['label' => 'Карьера', 'href' => '#'], ['label' => 'Новости', 'href' => '#']]], ['title' => 'Возможности', 'links' => [['label' => 'Поставка оборудования', 'href' => '#capabilities'], ['label' => 'Глобальная логистика', 'href' => '#capabilities'], ['label' => 'Реализация проектов', 'href' => '#capabilities'], ['label' => 'Инжиниринг', 'href' => '#capabilities']]], ['title' => 'Инжиниринг', 'links' => [['label' => 'Технические аудиты', 'href' => '#engineering'], ['label' => 'CAD-обзор', 'href' => '#engineering'], ['label' => 'Анализ рисков', 'href' => '#engineering'], ['label' => 'Соответствие нормам', 'href' => '#engineering']]], ['title' => 'Контакты', 'links' => [['label' => 'info@westler.com', 'href' => 'mailto:info@westler.com'], ['label' => '+44 20 7946 0958', 'href' => 'tel:+442079460958'], ['label' => 'Лондон', 'href' => '#contact']]]], 'copyright' => 'WESTLER ENGINEERING LIMITED'],
            'contactModal' => ['title' => 'Обсудить проект', 'closeDialogAria' => 'Закрыть окно', 'closeButtonAria' => 'Закрыть', 'fullName' => 'ФИО', 'companyName' => 'Компания', 'phone' => 'Телефон', 'phonePlaceholder' => 'Номер телефона', 'phoneError' => 'Введите корректный номер.', 'email' => 'Email', 'message' => 'Сообщение', 'submit' => 'Отправить'],
        ];
    }
}
