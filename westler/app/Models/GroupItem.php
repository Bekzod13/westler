<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupItem extends Model
{
    public $timestamps = false;

    protected $fillable = ['group_id', 'sort_order'];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}
