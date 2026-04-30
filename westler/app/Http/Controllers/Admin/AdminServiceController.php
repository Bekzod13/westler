<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Service;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminServiceController extends Controller
{
    public function __construct(private TranslationService $translations) {}

    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');

        $query = Service::query();

        if ($q && trim($q) !== '') {
            $search = trim($q);
            $ids = $this->translations->modelIdsMatchingContent('Service', $search);
            $query->where(function ($qb) use ($ids, $search) {
                if (count($ids) > 0) $qb->whereIn('id', $ids);
                if (is_numeric($search)) $qb->orWhere('id', (int) $search);
                if (count($ids) === 0 && !is_numeric($search)) $qb->whereIn('id', []);
            });
        }

        $total = $query->count();
        $rows = $query->orderBy('id')->skip(($page - 1) * $perPage)->take($perPage)->get();
        $data = $rows->map(fn ($s) => $this->withTranslations($s));

        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function show(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        return response()->json($this->withTranslations($service));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|string',
            'translations' => 'required|array',
        ]);

        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        abort_if($langs->isEmpty(), 404, 'No active languages configured; add languages first');

        $this->translations->validateTranslationsPayload('Service', $request->translations, $langs);

        $service = DB::transaction(function () use ($request, $langs) {
            $service = Service::create(['image' => $request->image]);
            $this->translations->upsertTranslations('Service', $service->id, $request->translations, $langs);
            return $service;
        });

        return response()->json($this->withTranslations($service->fresh()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'image' => 'sometimes|string',
            'translations' => 'sometimes|array',
        ]);

        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);

        if ($request->has('translations')) {
            $this->translations->validateTranslationsPayload('Service', $request->translations, $langs);
        }

        DB::transaction(function () use ($request, $service, $langs) {
            if ($request->has('image')) $service->update(['image' => $request->image]);
            if ($request->has('translations')) {
                $this->translations->upsertTranslations('Service', $service->id, $request->translations, $langs);
            }
        });

        return response()->json($this->withTranslations($service->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        DB::transaction(function () use ($service) {
            $this->translations->deleteForModel('Service', $service->id);
            $service->delete();
        });
        return response()->json(null, 204);
    }

    private function withTranslations(Service $service): array
    {
        return array_merge($service->toArray(), [
            'translations' => $this->translations->loadGroupedByModel('Service', $service->id),
        ]);
    }
}
