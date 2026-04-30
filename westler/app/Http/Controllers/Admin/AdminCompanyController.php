<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Language;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminCompanyController extends Controller
{
    private const SINGLETON_ID = 1;

    public function __construct(private TranslationService $translations) {}

    public function show(): JsonResponse
    {
        $company = Company::findOrFail(self::SINGLETON_ID);
        return response()->json($this->withTranslations($company));
    }

    public function update(Request $request): JsonResponse
    {
        $company = Company::findOrFail(self::SINGLETON_ID);

        $request->validate([
            'image' => 'sometimes|string',
            'openedYear' => 'sometimes|nullable|integer',
            'elements' => 'sometimes|nullable|array',
            'chatId' => 'sometimes|nullable|string|max:512',
            'botToken' => 'sometimes|nullable|string|max:512',
            'translations' => 'sometimes|array',
        ]);

        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        abort_if($langs->isEmpty(), 404, 'No active languages configured; add languages first');

        if ($request->has('translations')) {
            $this->translations->validateTranslationsPayload('Company', $request->translations, $langs);
        }

        DB::transaction(function () use ($request, $company, $langs) {
            $data = [];
            if ($request->has('image')) $data['image'] = $request->image;
            if ($request->has('openedYear')) $data['opened_year'] = $request->openedYear;
            if ($request->has('elements')) $data['elements'] = $request->elements;
            if ($request->has('chatId')) $data['chat_id'] = $this->nullIfEmpty($request->chatId);
            if ($request->has('botToken')) $data['bot_token'] = $this->nullIfEmpty($request->botToken);

            if (count($data) > 0) $company->update($data);

            if ($request->has('translations')) {
                $this->translations->upsertTranslations('Company', self::SINGLETON_ID, $request->translations, $langs);
            }
        });

        return response()->json($this->withTranslations($company->fresh()));
    }

    private function nullIfEmpty(?string $v): ?string
    {
        if ($v === null) return null;
        $t = trim($v);
        return $t === '' ? null : $t;
    }

    private function withTranslations(Company $company): array
    {
        return array_merge($company->toArray(), [
            'translations' => $this->translations->loadGroupedByModel('Company', $company->id),
        ]);
    }
}
