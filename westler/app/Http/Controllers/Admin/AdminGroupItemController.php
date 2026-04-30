<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupItem;
use App\Models\Language;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminGroupItemController extends Controller
{
    public function __construct(private TranslationService $translations) {}

    public function index(int $groupId): JsonResponse
    {
        Group::findOrFail($groupId);
        $rows = GroupItem::where('group_id', $groupId)->orderBy('sort_order')->get();
        $data = $rows->map(fn ($it) => $this->withTranslations($it));
        return response()->json($data);
    }

    public function show(int $groupId, int $itemId): JsonResponse
    {
        Group::findOrFail($groupId);
        $item = GroupItem::where('id', $itemId)->where('group_id', $groupId)->firstOrFail();
        return response()->json($this->withTranslations($item));
    }

    public function store(Request $request, int $groupId): JsonResponse
    {
        Group::findOrFail($groupId);
        $request->validate(['sortOrder' => 'sometimes|integer', 'translations' => 'required|array']);
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        abort_if($langs->isEmpty(), 404, 'No active languages');
        $this->translations->validateTranslationsPayload('GroupItem', $request->translations, $langs);
        $item = DB::transaction(function () use ($request, $groupId, $langs) {
            $item = GroupItem::create(['group_id' => $groupId, 'sort_order' => $request->input('sortOrder', 0)]);
            $this->translations->upsertTranslations('GroupItem', $item->id, $request->translations, $langs);
            return $item;
        });
        return response()->json($this->withTranslations($item->fresh()), 201);
    }

    public function update(Request $request, int $groupId, int $itemId): JsonResponse
    {
        Group::findOrFail($groupId);
        $item = GroupItem::where('id', $itemId)->where('group_id', $groupId)->firstOrFail();
        $request->validate(['sortOrder' => 'sometimes|integer', 'translations' => 'sometimes|array']);
        $langs = Language::where('is_active', true)->orderBy('id')->get(['id', 'code']);
        if ($request->has('translations')) {
            $this->translations->validateTranslationsPayload('GroupItem', $request->translations, $langs);
        }
        DB::transaction(function () use ($request, $item, $langs) {
            if ($request->has('sortOrder')) $item->update(['sort_order' => $request->sortOrder]);
            if ($request->has('translations')) {
                $this->translations->upsertTranslations('GroupItem', $item->id, $request->translations, $langs);
            }
        });
        return response()->json($this->withTranslations($item->fresh()));
    }

    public function destroy(int $groupId, int $itemId): JsonResponse
    {
        Group::findOrFail($groupId);
        $item = GroupItem::where('id', $itemId)->where('group_id', $groupId)->firstOrFail();
        DB::transaction(function () use ($item) {
            $this->translations->deleteForModel('GroupItem', $item->id);
            $item->delete();
        });
        return response()->json(null, 204);
    }

    private function withTranslations(GroupItem $item): array
    {
        return array_merge($item->toArray(), [
            'translations' => $this->translations->loadGroupedByModel('GroupItem', $item->id),
        ]);
    }
}
