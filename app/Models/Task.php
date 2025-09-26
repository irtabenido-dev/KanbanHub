<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'board_id',
        'list_id',
        'title',
        'description',
        'deadline',
        'completed',
        'task_attributes',
        'position_number',
        'archived_at'
    ];
    protected $casts = [
        'id' => 'string',
        'task_attributes' => 'array',
        'completed' => 'boolean'
    ];
    public $incrementing = false;

    protected static function booted()
    {
        static::creating(function ($task) {
            $task->task_attributes ??= ['backgroundColor' => '#F1F3F5'];
        });
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'task_members',
            'task_id',
            'user_id'
        )->withTimestamps();
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class, 'board_id');
    }

    public function list(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'list_id');
    }

    public function task_activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class, 'task_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class, 'task_id');
    }

}
