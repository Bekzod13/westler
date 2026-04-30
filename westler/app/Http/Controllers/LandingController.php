<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Group;
use App\Models\Hero;
use App\Models\Language;
use App\Models\Partner;
use App\Models\Service;
use App\Models\Translation;
use Illuminate\Http\Request;

class LandingController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $active = Language::where('is_active', true)->orderBy('id')->get();
        $fallback = $active->firstWhere('is_default', true) ?? $active->first();
        $effective = $active->firstWhere('code', $lang) ?? $fallback;
        if (!$effective) $effective = $active->first();
        $langId = $effective?->id ?? 0;
        $fbId = $fallback?->id ?? $langId;

        // Site payload
        $siteRow = Translation::where('model_id', 1)->where('model_type', 'Site')
            ->where('field', 'payload')->where('language_id', $langId)->first();
        $site = $siteRow ? json_decode($siteRow->content, true) : [];

        // Banners
        $heroes = Hero::orderBy('id')->get();
        $banners = $heroes->map(function ($h) use ($langId, $fbId) {
            $t = $this->fields($h->id, 'Hero', $langId, ['title', 'subtitle', 'button']);
            if ($this->isEmpty($t) && $langId !== $fbId) $t = $this->fields($h->id, 'Hero', $fbId, ['title', 'subtitle', 'button']);
            return array_merge(['id' => $h->id, 'image' => $h->image, 'video' => $h->video], $t);
        });

        // Company
        $companyRow = Company::find(1);
        $company = null;
        if ($companyRow) {
            $t = $this->fields($companyRow->id, 'Company', $langId, ['title', 'subtitle']);
            if (trim($t['title'] ?? '') === '' && $langId !== $fbId) $t = $this->fields($companyRow->id, 'Company', $fbId, ['title', 'subtitle']);
            $company = array_merge($companyRow->toArray(), $t);
        }

        // Services
        $services = Service::orderBy('id')->get()->map(function ($s) use ($langId, $fbId) {
            $t = $this->fields($s->id, 'Service', $langId, ['title', 'subtitle']);
            if (trim($t['title'] ?? '') === '' && $langId !== $fbId) $t = $this->fields($s->id, 'Service', $fbId, ['title', 'subtitle']);
            return array_merge($s->toArray(), $t);
        });

        // Partners
        $partners = Partner::orderBy('id')->get()->map(function ($p) use ($langId, $fbId) {
            $t = $this->fields($p->id, 'Partner', $langId, ['title']);
            if (trim($t['title'] ?? '') === '' && $langId !== $fbId) $t = $this->fields($p->id, 'Partner', $fbId, ['title']);
            return array_merge($p->toArray(), $t);
        });

        // Groups
        $groups = [];
        foreach (Group::with('items')->orderBy('id')->get() as $g) {
            $strings = $this->allFields($g->id, 'Group', $langId);
            if (empty(trim(implode('', $strings))) && $langId !== $fbId) $strings = $this->allFields($g->id, 'Group', $fbId);
            $items = $g->items->map(function ($it) use ($langId, $fbId) {
                $t = $this->fields($it->id, 'GroupItem', $langId, ['title', 'subtitle']);
                if (trim($t['title'] ?? '') === '' && $langId !== $fbId) $t = $this->fields($it->id, 'GroupItem', $fbId, ['title', 'subtitle']);
                return array_merge($it->toArray(), $t);
            });
            $groups[$g->slug] = ['strings' => $strings, 'items' => $items];
        }

        $languages = $active->map(fn ($l) => ['code' => $l->code, 'name' => $l->name, 'isDefault' => $l->is_default]);

        return view('public.landing', compact('site', 'banners', 'company', 'services', 'partners', 'groups', 'languages', 'lang'));
    }

    private function fields(int $modelId, string $type, int $langId, array $keys): array
    {
        $rows = Translation::where('model_id', $modelId)->where('model_type', $type)->where('language_id', $langId)->pluck('content', 'field');
        $r = [];
        foreach ($keys as $k) $r[$k] = $rows[$k] ?? '';
        return $r;
    }

    private function allFields(int $modelId, string $type, int $langId): array
    {
        return Translation::where('model_id', $modelId)->where('model_type', $type)->where('language_id', $langId)->pluck('content', 'field')->toArray();
    }

    private function isEmpty(array $t): bool
    {
        return trim(implode('', array_values($t))) === '';
    }
}
