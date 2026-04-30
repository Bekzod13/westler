<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hero;
use App\Models\Language;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminHeroController extends Controller
{
    public function __construct(private TranslationService $translations) {}

    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');

        $query = Hero::query();

        if ($q && trim($q) !== '') {
            $search = trim($q);
            $ids = $this->translations->modelIdsMatchingContent('Hero', $search);
            $query->where(function ($qb) use ($ids, $search) {
                if (count($ids) > 0) $qb->whereIn('id', $ids);
                if (is_numeric($search)) $qb->orWhere('id', (int) $search);
                if (count($ids) === 0 && !is_numeric($search)) $qb->whereIn('id', []);
            });
        }

        $total = $query->count();
        $heroes = $query->orderBy('id')->skip(($page - 1) * $perPage)->take($perPage)->get();
        $data = $heroes->map(fn ($h) => $this->withTranslations($h));

        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function show(int $id): JsonResponse
    {
        $hero = Hero::findOrFail($id);
        return response()->json($this->withTranslations($hero));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'video' => 'nullable|string',
            'image' => 'nullable|string',
            'translations' => 'required|array',
        ]);

        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        abort_if($langs->isEmpty(), 404, 'No active languages configured; add languages first');

        $this->translations->validateTranslationsPayload('Hero', $request->translations, $langs);

        $hero = DB::transaction(function () use ($request, $langs) {
            $hero = Hero::create([
                'video' => $request->video,
                'image' => $request->image,
            ]);
            $this->translations->upsertTranslations('Hero', $hero->id, $request->translations, $langs);
            return $hero;
        });

        return response()->json($this->withTranslations($hero->fresh()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hero = Hero::findOrFail($id);

        $request->validate([
            'video' => 'nullable|string',
            'image' => 'nullable|string',
            'translations' => 'sometimes|array',
        ]);

        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);

        if ($request->has('translations')) {
            $this->translations->validateTranslationsPayload('Hero', $request->translations, $langs);
        }

        DB::transaction(function () use ($request, $hero, $langs) {
            $data = [];
            if ($request->has('video')) $data['video'] = $request->video;
            if ($request->has('image')) $data['image'] = $request->image;
            if (count($data) > 0) $hero->update($data);

            if ($request->has('translations')) {
                $this->translations->upsertTranslations('Hero', $hero->id, $request->translations, $langs);
            }
        });

        return response()->json($this->withTranslations($hero->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        $hero = Hero::findOrFail($id);
        DB::transaction(function () use ($hero) {
            $this->translations->deleteForModel('Hero', $hero->id);
            $hero->delete();
        });
        return response()->json(null, 204);
    }

    private function withTranslations(Hero $hero): array
    {
        return array_merge($hero->toArray(), [
            'translations' => $this->translations->loadGroupedByModel('Hero', $hero->id),
        ]);
    }
}
