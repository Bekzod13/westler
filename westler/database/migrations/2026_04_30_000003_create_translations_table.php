<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('language_id')->constrained('languages')->cascadeOnDelete();
            $table->unsignedBigInteger('model_id');
            $table->string('model_type');
            $table->string('field');   // mapped from "key" in Prisma
            $table->text('content');    // mapped from "value" in Prisma

            $table->unique(['model_id', 'model_type', 'field', 'language_id']);
            $table->index(['model_id', 'model_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
