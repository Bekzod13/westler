<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Group;
use App\Models\Hero;
use App\Models\Language;
use App\Models\Order;
use App\Models\Partner;
use App\Models\Service;
use App\Models\Translation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PublicController extends Controller
{
    private const SITE_MODEL_ID = 1;
    private const COMPANY_SINGLETON_ID = 1;

    public function banners(Request $request): JsonResponse
    {
        $lang = $request->query('lang');
        $active = Language::where('is_active', true)->orderBy('id')->get();
        if ($active->isEmpty()) return response()->json(['lang' => null, 'banners' => []]);

        $fallback = $active->firstWhere('is_default', true) ?? $active->first();
        $requested = ($lang && trim($lang) !== '') ? $active->firstWhere('code', trim($lang)) : null;
        $effective = $requested ?? $fallback;

        $heroes = Hero::orderBy('id')->get();
        $banners = [];
        foreach ($heroes as $hero) {
            $t = $this->loadFields($hero->id, 'Hero', $effective->id, ['title', 'subtitle', 'button']);
            if ($this->isTextEmpty($t) && $effective->id !== $fallback->id) {
                $t = $this->loadFields($hero->id, 'Hero', $fallback->id, ['title', 'subtitle', 'button']);
            }
            $banners[] = array_merge(['id' => $hero->id, 'image' => $hero->image, 'video' => $hero->video], $t);
        }
        return response()->json(['lang' => $effective->code, 'banners' => $banners]);
    }

    public function languages(): JsonResponse
    {
        $data = Language::where('is_active', true)->orderBy('id')
            ->get(['code', 'name', 'is_default'])
            ->map(fn ($l) => ['code' => $l->code, 'name' => $l->name, 'isDefault' => $l->is_default]);
        return response()->json($data);
    }

    public function site(): JsonResponse
    {
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        $locales = [];
        foreach ($langs as $lang) {
            $row = Translation::where('model_id', self::SITE_MODEL_ID)
                ->where('model_type', 'Site')
                ->where('field', 'payload')
                ->where('language_id', $lang->id)
                ->first();
            if ($row && $row->content) {
                try { $locales[$lang->code] = json_decode($row->content, true); } catch (\Throwable) { $locales[$lang->code] = new \stdClass(); }
            }
        }
        return response()->json(['locales' => $locales]);
    }

    public function partners(Request $request): JsonResponse
    {
        $lang = $request->query('lang');
        $active = Language::where('is_active', true)->orderBy('id')->get();
        if ($active->isEmpty()) return response()->json(['lang' => null, 'partners' => []]);

        $fallback = $active->firstWhere('is_default', true) ?? $active->first();
        $requested = ($lang && trim($lang) !== '') ? $active->firstWhere('code', trim($lang)) : null;
        $effective = $requested ?? $fallback;

        $rows = Partner::orderBy('id')->get();
        $partners = [];
        foreach ($rows as $p) {
            $t = $this->loadFields($p->id, 'Partner', $effective->id, ['title']);
            if (trim($t['title'] ?? '') === '' && $effective->id !== $fallback->id) {
                $t = $this->loadFields($p->id, 'Partner', $fallback->id, ['title']);
            }
            $partners[] = ['id' => $p->id, 'image' => $p->image, 'link' => $p->link, 'title' => $t['title'] ?? ''];
        }
        return response()->json(['lang' => $effective->code, 'partners' => $partners]);
    }

    public function companies(Request $request): JsonResponse
    {
        $lang = $request->query('lang');
        $active = Language::where('is_active', true)->orderBy('id')->get();
        if ($active->isEmpty()) return response()->json(['lang' => null, 'company' => null]);

        $fallback = $active->firstWhere('is_default', true) ?? $active->first();
        $requested = ($lang && trim($lang) !== '') ? $active->firstWhere('code', trim($lang)) : null;
        $effective = $requested ?? $fallback;

        $row = Company::find(self::COMPANY_SINGLETON_ID);
        if (!$row) return response()->json(['lang' => $effective->code, 'company' => null]);

        $t = $this->loadFields($row->id, 'Company', $effective->id, ['title', 'subtitle']);
        if (trim($t['title'] ?? '') === '' && $effective->id !== $fallback->id) {
            $t = $this->loadFields($row->id, 'Company', $fallback->id, ['title', 'subtitle']);
        }

        $elements = $row->elements;
        if (!is_array($elements) || !isset($elements['sections'])) $elements = ['sections' => []];

        $company = [
            'id' => $row->id,
            'image' => $row->image,
            'title' => $t['title'] ?? '',
            'subtitle' => $t['subtitle'] ?? '',
            'openedYear' => $row->opened_year,
            'elements' => $elements,
        ];
        return response()->json(['lang' => $effective->code, 'company' => $company]);
    }

    public function services(Request $request): JsonResponse
    {
        $lang = $request->query('lang');
        $active = Language::where('is_active', true)->orderBy('id')->get();
        if ($active->isEmpty()) return response()->json(['lang' => null, 'services' => []]);

        $fallback = $active->firstWhere('is_default', true) ?? $active->first();
        $requested = ($lang && trim($lang) !== '') ? $active->firstWhere('code', trim($lang)) : null;
        $effective = $requested ?? $fallback;

        $rows = Service::orderBy('id')->get();
        $services = [];
        foreach ($rows as $s) {
            $t = $this->loadFields($s->id, 'Service', $effective->id, ['title', 'subtitle']);
            if (trim($t['title'] ?? '') === '' && $effective->id !== $fallback->id) {
                $t = $this->loadFields($s->id, 'Service', $fallback->id, ['title', 'subtitle']);
            }
            $services[] = ['id' => $s->id, 'image' => $s->image, 'title' => $t['title'] ?? '', 'subtitle' => $t['subtitle'] ?? ''];
        }
        return response()->json(['lang' => $effective->code, 'services' => $services]);
    }

    public function groups(Request $request): JsonResponse
    {
        $lang = $request->query('lang');
        $active = Language::where('is_active', true)->orderBy('id')->get();
        if ($active->isEmpty()) return response()->json(['lang' => null, 'groups' => new \stdClass()]);

        $fallback = $active->firstWhere('is_default', true) ?? $active->first();
        $requested = ($lang && trim($lang) !== '') ? $active->firstWhere('code', trim($lang)) : null;
        $effective = $requested ?? $fallback;

        $rows = Group::with(['items' => fn ($q) => $q->orderBy('sort_order')])->orderBy('id')->get();
        $groups = [];
        foreach ($rows as $g) {
            $strings = $this->loadAllFields($g->id, 'Group', $effective->id);
            if (empty(trim(implode('', array_values($strings)))) && $effective->id !== $fallback->id) {
                $strings = $this->loadAllFields($g->id, 'Group', $fallback->id);
            }
            $items = [];
            foreach ($g->items as $it) {
                $t = $this->loadFields($it->id, 'GroupItem', $effective->id, ['title', 'subtitle']);
                if (trim($t['title'] ?? '') === '' && $effective->id !== $fallback->id) {
                    $t = $this->loadFields($it->id, 'GroupItem', $fallback->id, ['title', 'subtitle']);
                }
                $items[] = ['id' => $it->id, 'sortOrder' => $it->sort_order, 'title' => $t['title'] ?? '', 'subtitle' => $t['subtitle'] ?? ''];
            }
            $groups[$g->slug] = ['strings' => empty($strings) ? new \stdClass() : $strings, 'items' => $items];
        }
        return response()->json(['lang' => $effective->code, 'groups' => empty($groups) ? new \stdClass() : $groups]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'fullName' => 'required|string|max:200',
            'companyName' => 'nullable|string|max:200',
            'phone' => 'required|string|max:64',
            'email' => 'nullable|string|max:320',
            'message' => 'nullable|string|max:20000',
        ]);

        $order = Order::create([
            'full_name' => trim($request->fullName),
            'company_name' => trim($request->companyName ?? ''),
            'phone' => trim($request->phone),
            'email' => $request->email ? strtolower(trim($request->email)) : null,
            'message' => $request->message ? trim($request->message) : null,
        ]);

        // Async Telegram notification (fire-and-forget)
        try { $this->notifyTelegram($order); } catch (\Throwable) {}

        return response()->json(['id' => $order->id], 201);
    }

    // --- Private helpers ---

    private function loadFields(int $modelId, string $modelType, int $languageId, array $fields): array
    {
        $rows = Translation::where('model_id', $modelId)
            ->where('model_type', $modelType)
            ->where('language_id', $languageId)
            ->get();
        $map = $rows->pluck('content', 'field')->toArray();
        $result = [];
        foreach ($fields as $f) $result[$f] = $map[$f] ?? '';
        return $result;
    }

    private function loadAllFields(int $modelId, string $modelType, int $languageId): array
    {
        return Translation::where('model_id', $modelId)
            ->where('model_type', $modelType)
            ->where('language_id', $languageId)
            ->pluck('content', 'field')
            ->toArray();
    }

    private function isTextEmpty(array $t): bool
    {
        return trim(implode('', array_values($t))) === '';
    }

    private function notifyTelegram(Order $order): void
    {
        $company = Company::find(self::COMPANY_SINGLETON_ID);
        $chatId = trim($company?->chat_id ?? '');
        $botToken = trim($company?->bot_token ?? '');
        if (!$chatId || !$botToken) return;

        $text = "New order #{$order->id}\n\nName: {$order->full_name}\nCompany: " . ($order->company_name ?: '—') .
                "\nPhone: {$order->phone}\nEmail: " . ($order->email ?: '—') . "\n\nMessage:\n" . ($order->message ?: '—');
        if (strlen($text) > 4000) $text = substr($text, 0, 3997) . '...';

        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
            'disable_web_page_preview' => true,
        ]);
    }
}
