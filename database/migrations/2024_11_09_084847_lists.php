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
        Schema::create('lists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // $table->uuid('board_id');
            $table->string('name');
            $table->integer('position_number');
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->foreignUuid('board_id')
                ->constrained()
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists(table: 'lists');
    }
};
