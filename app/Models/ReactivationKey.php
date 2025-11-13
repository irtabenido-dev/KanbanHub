<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReactivationKey extends Model
{
    protected $table = 'reactivation_keys';
    protected $fillable = ['key', 'user_id', 'expires_at'];


}
