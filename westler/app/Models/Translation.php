<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Translation extends Model
{
    public $timestamps = false;

    protected $fillable = ['language_id', 'model_id', 'model_type', 'field', 'content'];

    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }
}
