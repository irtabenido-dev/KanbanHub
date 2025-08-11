<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskMember extends Model
{
    protected $keyType = 'string';
    protected $table = 'task_members';
    protected $fillable = [
        'task_id',
        'user_id'
    ];

    protected $casts = [
        'task_id' => 'string',
        'user_id' => 'string'
    ];

    public function task(): BelongsTo{
        return $this->belongsTo(Task::class, 'task_id');
    }
}
