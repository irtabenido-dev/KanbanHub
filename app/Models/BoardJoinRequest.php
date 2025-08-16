<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BoardJoinRequest extends Model
{
    //
    public $incrementing = false;
    protected $fillable = [
        'board_id',
        'user_id',
        'status'
    ];
    protected $keyType = 'string';
    protected $casts = [
        'id' => 'string',
    ];
    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class, 'board_id')
        ->with('users');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
