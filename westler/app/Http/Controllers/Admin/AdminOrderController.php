<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 15)));
        $q = $request->query('q');

        $query = Order::query();

        if ($q && trim($q) !== '') {
            $search = trim($q);
            $query->where(function ($qb) use ($search) {
                $qb->where('full_name', 'like', "%{$search}%")
                   ->orWhere('company_name', 'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%")
                   ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $data = $query->orderByDesc('created_at')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json(compact('data', 'total', 'page', 'perPage'));
    }

    public function destroy(int $id): JsonResponse
    {
        Order::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
