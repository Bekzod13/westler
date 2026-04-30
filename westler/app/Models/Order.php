<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public $timestamps = false;

    protected $fillable = ['full_name', 'company_name', 'phone', 'email', 'message'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
