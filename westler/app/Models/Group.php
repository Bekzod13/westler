<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'slug', 'description'];

    public function items(): HasMany
    {
        return $this->hasMany(GroupItem::class)->orderBy('sort_order');
    }
}
