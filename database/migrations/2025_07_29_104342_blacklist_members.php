<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blacklist_members', function (Blueprint $table) {
            $table->id();
            $table->string('blacklistable_type');
            $table->uuid('blacklistable_id');
            // $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->index(['blacklistable_type', 'blacklistable_id']);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blacklist_members');
    }
};
