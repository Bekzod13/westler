<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminLanguageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');

        $query = Language::query();

        if ($q && trim($q) !== '') {
            $search = trim($q);
            $query->where(function ($qb) use ($search) {
                $qb->where('name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
                if (is_numeric($search)) {
                    $qb->orWhere('id', (int) $search);
                }
            });
        }

        $total = $query->count();
        $data = $query->orderBy('id')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(Language::findOrFail($id));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:64',
            'code' => ['required', 'string', 'regex:/^[a-z]{2}(-[A-Z]{2})?$/', 'unique:languages,code'],
            'isDefault' => 'sometimes|boolean',
            'isActive' => 'sometimes|boolean',
        ]);

        $isDefault = $request->boolean('isDefault', false);
        $isActive = $request->boolean('isActive', true);

        $language = DB::transaction(function () use ($request, $isDefault, $isActive) {
            if ($isDefault) {
                Language::query()->update(['is_default' => false]);
            }
            return Language::create([
                'name' => $request->name,
                'code' => $request->code,
                'is_default' => $isDefault,
                'is_active' => $isActive,
            ]);
        });

        return response()->json($language, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $language = Language::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:64',
            'code' => ['sometimes', 'string', 'regex:/^[a-z]{2}(-[A-Z]{2})?$/', "unique:languages,code,{$id}"],
            'isDefault' => 'sometimes|boolean',
            'isActive' => 'sometimes|boolean',
        ]);

        $language = DB::transaction(function () use ($request, $language) {
            if ($request->boolean('isDefault', false)) {
                Language::query()->update(['is_default' => false]);
            }

            $data = [];
            if ($request->has('name')) $data['name'] = $request->name;
            if ($request->has('code')) $data['code'] = $request->code;
            if ($request->has('isDefault')) $data['is_default'] = $request->boolean('isDefault');
            if ($request->has('isActive')) $data['is_active'] = $request->boolean('isActive');

            $language->update($data);
            return $language->fresh();
        });

        return response()->json($language);
    }

    public function destroy(int $id): JsonResponse
    {
        Language::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
