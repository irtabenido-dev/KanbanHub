<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Attachment extends Model
{
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'task_id',
        'user_id',
        'attachment_attributes',
    ];

    protected $casts = [
        'id' => 'string',
        'attachment_attributes' => 'array'
    ];

    public $incrementing = false;
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
