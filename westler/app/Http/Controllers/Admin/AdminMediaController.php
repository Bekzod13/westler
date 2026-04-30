<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMediaController extends Controller
{
    public function __construct(private MediaService $media) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:5120', // 5 MB
        ]);

        $url = $this->media->saveAsWebp($request->file('file'));

        return response()->json(['url' => $url]);
    }
}
