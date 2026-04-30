<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTranslationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $modelType = $request->query('modelType');
        $modelIdRaw = $request->query('modelId');
        $q = $request->query('q');

        $query = Translation::with('language:id,code,name');

        if ($modelType && $modelType !== '') $query->where('model_type', $modelType);
        if ($modelIdRaw !== null && $modelIdRaw !== '') $query->where('model_id', (int) $modelIdRaw);

        if ($q && trim($q) !== '') {
            $search = trim($q);
            $query->where(function ($qb) use ($search) {
                $qb->where('content', 'like', "%{$search}%")
                   ->orWhere('field', 'like', "%{$search}%")
                   ->orWhere('model_type', 'like', "%{$search}%")
                   ->orWhereHas('language', fn ($lq) => $lq->where('code', 'like', "%{$search}%"));
                if (is_numeric($search)) $qb->orWhere('model_id', (int) $search);
            });
        }

        $total = $query->count();
        $data = $query->orderBy('model_type')->orderBy('model_id')->orderBy('field')
            ->skip(($page - 1) * $perPage)->take($perPage)->get();

        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(Translation::with('language:id,code,name')->findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate(['content' => 'required|string']);
        $t = Translation::findOrFail($id);
        $t->update(['content' => $request->content]);
        return response()->json($t->load('language:id,code,name'));
    }

    public function destroy(int $id): JsonResponse
    {
        Translation::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
