<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class BoardMember extends Pivot
{
    protected $table = 'board_members';
    protected $fillable = ['board_id', 'user_id', 'role'];
}
