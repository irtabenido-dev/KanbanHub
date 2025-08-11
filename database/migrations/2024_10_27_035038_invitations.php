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
        Schema::create('invitations', function(Blueprint $table){
            $table->uuid('id')->primary();
            $table->string('workspace_id');
            $table->string('invited_id');
            $table->string('inviter_id');
            $table->string('role');
            $table->string('invitation_code');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists(table: 'invitations');
    }
};
