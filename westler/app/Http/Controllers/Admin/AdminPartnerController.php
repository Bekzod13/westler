<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Partner;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPartnerController extends Controller
{
    public function __construct(private TranslationService $translations) {}

    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');
        $query = Partner::query();
        if ($q && trim($q) !== '') {
            $search = trim($q);
            $ids = $this->translations->modelIdsMatchingContent('Partner', $search);
            $query->where(function ($qb) use ($ids, $search) {
                $qb->where('link', 'like', "%{$search}%");
                if (count($ids) > 0) $qb->orWhereIn('id', $ids);
                if (is_numeric($search)) $qb->orWhere('id', (int) $search);
            });
        }
        $total = $query->count();
        $rows = $query->orderBy('id')->skip(($page - 1) * $perPage)->take($perPage)->get();
        $data = $rows->map(fn ($p) => $this->withTranslations($p));
        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->withTranslations(Partner::findOrFail($id)));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|string', 'link' => 'required|string', 'translations' => 'required|array']);
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        abort_if($langs->isEmpty(), 404, 'No active languages');
        $this->translations->validateTranslationsPayload('Partner', $request->translations, $langs);
        $partner = DB::transaction(function () use ($request, $langs) {
            $p = Partner::create(['image' => $request->image, 'link' => $request->link]);
            $this->translations->upsertTranslations('Partner', $p->id, $request->translations, $langs);
            return $p;
        });
        return response()->json($this->withTranslations($partner->fresh()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $partner = Partner::findOrFail($id);
        $request->validate(['image' => 'sometimes|string', 'link' => 'sometimes|string', 'translations' => 'sometimes|array']);
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        if ($request->has('translations')) {
            $this->translations->validateTranslationsPayload('Partner', $request->translations, $langs);
        }
        DB::transaction(function () use ($request, $partner, $langs) {
            $data = [];
            if ($request->has('image')) $data['image'] = $request->image;
            if ($request->has('link')) $data['link'] = $request->link;
            if (count($data) > 0) $partner->update($data);
            if ($request->has('translations')) {
                $this->translations->upsertTranslations('Partner', $partner->id, $request->translations, $langs);
            }
        });
        return response()->json($this->withTranslations($partner->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        $partner = Partner::findOrFail($id);
        DB::transaction(function () use ($partner) {
            $this->translations->deleteForModel('Partner', $partner->id);
            $partner->delete();
        });
        return response()->json(null, 204);
    }

    private function withTranslations(Partner $partner): array
    {
        return array_merge($partner->toArray(), [
            'translations' => $this->translations->loadGroupedByModel('Partner', $partner->id),
        ]);
    }
}
