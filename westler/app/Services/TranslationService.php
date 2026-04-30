<?php

namespace App\Services;

use App\Models\Language;
use App\Models\Translation;
use Illuminate\Support\Facades\DB;

class TranslationService
{
    /** Model type constants matching NestJS admin.constants. */
    public const MODEL_TYPES = [
        'Hero' => 'Hero',
        'Company' => 'Company',
        'Service' => 'Service',
        'Partner' => 'Partner',
        'Group' => 'Group',
        'GroupItem' => 'GroupItem',
        'Site' => 'Site',
    ];

    /** Required translation fields per model type. */
    public const TRANSLATION_FIELDS = [
        'Hero' => ['title', 'subtitle', 'button'],
        'Company' => ['title', 'subtitle'],
        'Service' => ['title', 'subtitle'],
        'Partner' => ['title'],
        'Group' => [],        // validated dynamically
        'GroupItem' => ['title', 'subtitle'],
        'Site' => ['payload'],
    ];

    /**
     * Validate translations payload from the client.
     *
     * @param string $modelType
     * @param array<string, array<string, string>> $translationsByCode  {langCode: {field: value}}
     * @param \Illuminate\Support\Collection $activeLanguages  Collection of Language models with id,code
     * @throws \Illuminate\Validation\ValidationException
     */
    public function validateTranslationsPayload(
        string $modelType,
        array $translationsByCode,
        $activeLanguages,
    ): void {
        if ($modelType === 'Group') {
            $this->validateGroupTranslationsPayload($translationsByCode, $activeLanguages);
            return;
        }

        $requiredFields = self::TRANSLATION_FIELDS[$modelType] ?? [];
        $codes = $activeLanguages->pluck('code')->toArray();

        foreach ($codes as $code) {
            $row = $translationsByCode[$code] ?? null;
            if (!is_array($row)) {
                abort(422, "Missing translations for language code \"{$code}\"");
            }
            foreach ($requiredFields as $f) {
                $v = $row[$f] ?? null;
                if (!is_string($v) || trim($v) === '') {
                    abort(422, "Field \"{$f}\" is required for language \"{$code}\"");
                }
            }
            foreach (array_keys($row) as $k) {
                if (!in_array($k, $requiredFields, true)) {
                    abort(422, "Unknown translation field \"{$k}\" for {$modelType}");
                }
            }
        }

        foreach (array_keys($translationsByCode) as $code) {
            if (!in_array($code, $codes, true)) {
                abort(422, "Unknown or inactive language code \"{$code}\"");
            }
        }
    }

    private function validateGroupTranslationsPayload(array $translationsByCode, $activeLanguages): void
    {
        $codes = $activeLanguages->pluck('code')->toArray();

        foreach ($codes as $code) {
            $row = $translationsByCode[$code] ?? null;
            if (!is_array($row)) {
                abort(422, "Missing translations for language code \"{$code}\"");
            }
        }

        foreach (array_keys($translationsByCode) as $code) {
            if (!in_array($code, $codes, true)) {
                abort(422, "Unknown or inactive language code \"{$code}\"");
            }
        }

        $firstCode = $codes[0] ?? null;
        if (!$firstCode) {
            abort(422, 'No active languages configured');
        }

        $keySet = array_keys($translationsByCode[$firstCode]);
        foreach ($codes as $code) {
            $row = $translationsByCode[$code];
            $keys = array_keys($row);
            if (count($keys) !== count($keySet) || array_diff($keys, $keySet)) {
                abort(422, "Group translation keys must match every language; mismatch for \"{$code}\"");
            }
            foreach ($keys as $k) {
                if (!preg_match('/^[a-zA-Z0-9_.\-]{1,128}$/', $k)) {
                    abort(422, "Invalid group field key \"{$k}\"");
                }
                if (!is_string($row[$k])) {
                    abort(422, "Field \"{$k}\" must be a string for language \"{$code}\"");
                }
            }
        }
    }

    /**
     * Upsert translations for a model.
     */
    public function upsertTranslations(
        string $modelType,
        int $modelId,
        array $translationsByCode,
        $activeLanguages,
    ): void {
        if ($modelType === 'Group') {
            $this->upsertGroupTranslations($modelId, $translationsByCode, $activeLanguages);
            return;
        }

        $codeToId = $activeLanguages->pluck('id', 'code')->toArray();
        $requiredFields = self::TRANSLATION_FIELDS[$modelType] ?? [];

        foreach ($translationsByCode as $code => $fields) {
            $languageId = $codeToId[$code] ?? null;
            if ($languageId === null) continue;

            foreach ($requiredFields as $field) {
                $content = $fields[$field] ?? '';
                Translation::updateOrCreate(
                    [
                        'model_id' => $modelId,
                        'model_type' => $modelType,
                        'field' => $field,
                        'language_id' => $languageId,
                    ],
                    ['content' => $content],
                );
            }
        }
    }

    private function upsertGroupTranslations(
        int $modelId,
        array $translationsByCode,
        $activeLanguages,
    ): void {
        $codeToId = $activeLanguages->pluck('id', 'code')->toArray();
        $firstCode = $activeLanguages->first()?->code;
        if (!$firstCode) return;

        $keys = array_keys($translationsByCode[$firstCode] ?? []);

        // Delete stale fields
        if (count($keys) > 0) {
            Translation::where('model_id', $modelId)
                ->where('model_type', 'Group')
                ->whereNotIn('field', $keys)
                ->delete();
        }

        foreach ($translationsByCode as $code => $fields) {
            $languageId = $codeToId[$code] ?? null;
            if ($languageId === null) continue;

            foreach ($keys as $field) {
                $content = $fields[$field] ?? '';
                Translation::updateOrCreate(
                    [
                        'model_id' => $modelId,
                        'model_type' => 'Group',
                        'field' => $field,
                        'language_id' => $languageId,
                    ],
                    ['content' => $content],
                );
            }
        }
    }

    /**
     * Delete all translations for a model.
     */
    public function deleteForModel(string $modelType, int $modelId): void
    {
        Translation::where('model_id', $modelId)
            ->where('model_type', $modelType)
            ->delete();
    }

    /**
     * Load translations grouped by language code: {langCode: {field: value}}.
     */
    public function loadGroupedByModel(string $modelType, int $modelId): array
    {
        $rows = Translation::where('model_id', $modelId)
            ->where('model_type', $modelType)
            ->join('languages', 'languages.id', '=', 'translations.language_id')
            ->select('translations.*', 'languages.code as lang_code')
            ->get();

        $out = [];
        foreach ($rows as $r) {
            $code = $r->lang_code;
            if (!isset($out[$code])) $out[$code] = [];
            $out[$code][$r->field] = $r->content;
        }
        return $out;
    }

    /**
     * Get model IDs whose translations contain a search term.
     */
    public function modelIdsMatchingContent(string $modelType, string $q): array
    {
        $term = trim($q);
        if ($term === '') return [];

        return Translation::where('model_type', $modelType)
            ->where('content', 'like', "%{$term}%")
            ->distinct()
            ->pluck('model_id')
            ->toArray();
    }
}
