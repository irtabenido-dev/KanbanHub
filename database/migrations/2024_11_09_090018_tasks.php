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
        //
        Schema::create('tasks', function(Blueprint $table){
            $table->uuid('id')->primary();
            $table->uuid('board_id');
            $table->uuid('list_id');
            $table->string('title');
            $table->json('description')->nullable();
            $table->dateTime('deadline')->nullable();
            $table->boolean('completed')->nullable();
            $table->json('task_attributes')->nullable();
            $table->integer('position_number');
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('tasks');
    }
};
