<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Board extends Model
{
    use HasFactory;
    //
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id', 'workspace_id', 'name', 'private', 'owner_id'];
    protected $casts = [
        'id' => 'string',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'board_members',
            'board_id',
            'user_id'
        )
            ->withPivot('role')
            ->withTimestamps();
    }

    public function accessRequests(): HasMany
    {
        return $this->hasMany(BoardJoinRequest::class, 'board_id')
            ->with('user');
    }

    public function relatedBoards(): HasMany
    {
        return $this->hasMany(Board::class, 'workspace_id', 'workspace_id')
            ->whereNull('archived_at')
            ->where(function ($query) {
                $query->where('id', '!=', $this->id);
            });
    }

    public function taskLists(): HasMany
    {
        return $this->hasMany(TaskList::class, 'board_id');
    }

    public function allUsers()
    {
        // $workspace = Workspace::findOrFail($this->workspace_id);
        $workspace = $this->workspace;

        $workspaceAdmins = $workspace->users()
            ->wherePivotIn('role', ['admin', 'owner'])
            ->get();

        $boardUsers = $this->users;

        $allUsersIds = $boardUsers->pluck('id')->toArray();
        $additionalUsers = $workspaceAdmins->reject(fn($user) =>
        in_array($user->id, $allUsersIds));

        return $boardUsers->concat($additionalUsers);
    }

    public function blacklistedMembers(): MorphMany
    {
        return $this->morphMany(BlacklistMember::class, 'blacklistable')->with('user');
    }
}
