<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    public $timestamps = false;

    protected $fillable = ['image', 'opened_year', 'elements', 'chat_id', 'bot_token'];

    protected function casts(): array
    {
        return [
            'elements' => 'array',
        ];
    }
}
