<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->integer('sort_order')->default(0);

            $table->index(['group_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_items');
    }
};
