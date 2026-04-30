<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupItem;
use App\Models\Language;
use App\Models\Translation;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminGroupController extends Controller
{
    public function __construct(private TranslationService $translations) {}

    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');
        $query = Group::query();
        if ($q && trim($q) !== '') {
            $search = trim($q);
            $ids = $this->translations->modelIdsMatchingContent('Group', $search);
            $query->where(function ($qb) use ($ids, $search) {
                $qb->where('name', 'like', "%{$search}%")
                   ->orWhere('slug', 'like', "%{$search}%");
                if (count($ids) > 0) $qb->orWhereIn('id', $ids);
                if (is_numeric($search)) $qb->orWhere('id', (int) $search);
            });
        }
        $total = $query->count();
        $rows = $query->orderBy('id')->skip(($page - 1) * $perPage)->take($perPage)->get();
        $data = $rows->map(fn ($g) => $this->withTranslationsSummary($g));
        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function show(int $id): JsonResponse
    {
        $group = Group::with(['items' => fn ($q) => $q->orderBy('sort_order')])->findOrFail($id);
        return response()->json($this->withTranslationsAndItems($group));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'slug' => ['required', 'string', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:groups,slug'],
            'description' => 'nullable|string',
            'translations' => 'required|array',
        ]);
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        abort_if($langs->isEmpty(), 404, 'No active languages');
        $this->translations->validateTranslationsPayload('Group', $request->translations, $langs);
        $group = DB::transaction(function () use ($request, $langs) {
            $g = Group::create(['name' => $request->name, 'slug' => $request->slug, 'description' => $request->description]);
            $this->translations->upsertTranslations('Group', $g->id, $request->translations, $langs);
            return $g;
        });
        return response()->json($this->withTranslationsAndItems($group->load('items')), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $group = Group::with('items')->findOrFail($id);
        $request->validate([
            'name' => 'sometimes|string',
            'slug' => ['sometimes', 'string', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', "unique:groups,slug,{$id}"],
            'description' => 'sometimes|nullable|string',
            'translations' => 'sometimes|array',
        ]);
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        if ($request->has('translations')) {
            $this->translations->validateTranslationsPayload('Group', $request->translations, $langs);
        }
        DB::transaction(function () use ($request, $group, $langs) {
            $data = [];
            if ($request->has('name')) $data['name'] = $request->name;
            if ($request->has('slug')) $data['slug'] = $request->slug;
            if ($request->has('description')) $data['description'] = $request->description;
            if (count($data) > 0) $group->update($data);
            if ($request->has('translations')) {
                $this->translations->upsertTranslations('Group', $group->id, $request->translations, $langs);
            }
        });
        return response()->json($this->withTranslationsAndItems($group->fresh()->load('items')));
    }

    public function destroy(int $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        DB::transaction(function () use ($group) {
            foreach (GroupItem::where('group_id', $group->id)->get() as $item) {
                $this->translations->deleteForModel('GroupItem', $item->id);
            }
            $this->translations->deleteForModel('Group', $group->id);
            $group->delete();
        });
        return response()->json(null, 204);
    }

    private function withTranslationsSummary(Group $g): array
    {
        $translations = $this->translations->loadGroupedByModel('Group', $g->id);
        $translationCount = Translation::where('model_type', 'Group')->where('model_id', $g->id)->count();
        $itemCount = GroupItem::where('group_id', $g->id)->count();
        return array_merge($g->toArray(), compact('translations', 'translationCount', 'itemCount'));
    }

    private function withTranslationsAndItems(Group $g): array
    {
        $base = $this->withTranslationsSummary($g);
        $items = ($g->items ?? collect())->map(function ($item) {
            return array_merge($item->toArray(), [
                'translations' => $this->translations->loadGroupedByModel('GroupItem', $item->id),
            ]);
        })->toArray();
        $base['items'] = $items;
        return $base;
    }
}
