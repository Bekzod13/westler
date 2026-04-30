<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->integer('opened_year')->nullable();
            $table->json('elements')->nullable();
            $table->string('chat_id', 512)->nullable();
            $table->string('bot_token', 512)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
