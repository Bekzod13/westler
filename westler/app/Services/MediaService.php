<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class MediaService
{
    /**
     * Save uploaded file as WebP. Returns the public URL path.
     */
    public function saveAsWebp(UploadedFile $file): string
    {
        $filename = Str::uuid() . '.webp';

        $image = Image::read($file->getContent());
        $encoded = $image->toWebp(85);

        Storage::disk('public')->put("uploads/{$filename}", (string) $encoded);

        return '/storage/uploads/' . $filename;
    }
}
