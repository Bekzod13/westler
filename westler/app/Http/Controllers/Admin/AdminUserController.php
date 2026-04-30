<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');

        $query = User::select('id', 'name', 'login', 'last_login_at');

        if ($q && trim($q) !== '') {
            $search = trim($q);
            $query->where(function ($qb) use ($search) {
                $qb->where('name', 'like', "%{$search}%")
                   ->orWhere('login', 'like', "%{$search}%");
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
        $user = User::select('id', 'name', 'login', 'last_login_at')->findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'login' => 'required|string|unique:users,login',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'login' => $request->login,
            'password' => $request->password,
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'login' => $user->login,
            'last_login_at' => $user->last_login_at,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string',
            'login' => "sometimes|string|unique:users,login,{$id}",
            'password' => 'sometimes|string|min:8',
        ]);

        $data = [];
        if ($request->has('name')) $data['name'] = $request->name;
        if ($request->has('login')) $data['login'] = $request->login;
        if ($request->has('password')) $data['password'] = $request->password;

        $user->update($data);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'login' => $user->login,
            'last_login_at' => $user->last_login_at,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        User::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
