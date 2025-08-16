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
        Schema::create('boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // $table->uuid('workspace_id');
            $table->string('name');
            $table->boolean('private');
            // $table->unsignedBigInteger('owner_id');
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->foreignId('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignUuid('workspace_id')
                ->constrained()
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boards');
    }
};
