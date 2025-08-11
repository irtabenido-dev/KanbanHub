<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TaskActivity extends Model
{
    protected $table = 'task_activities';

    protected $fillable = [
        'id',
        'task_id',
        'user_details',
        'activity_details'
    ];

    protected $casts = [
        'id' => 'string',
        'user_details' => 'array',
        'activity_details' => 'array'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function task(): BelongsTo{
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function user(): BelongsTo{
        return $this->belongsTo(User::class, 'user_id');
    }
}
