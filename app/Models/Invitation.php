<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'inviter_id',
        'invited_id',
        'workspace_id',
        'role',
        'invitation_code',
        'expires_at'
    ];

}



