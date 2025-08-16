<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Workspace extends Model
{
    //
    protected $fillable = ['id','owner_id', 'name'];

    protected $keyType = 'string';

    public $incrementing = false;

    public function users(): BelongsToMany{
        return $this->belongsToMany(
        User::class,
        'workspace_user_role')
        ->using(WorkspaceUser::class)
        ->withPivot('role')
        ->withTimestamps();
    }

    protected static function booted(){
        static::deleting(function($workspace){
            $workspace->blacklistedMembers()->delete();
        });
    }

    public function owner(): BelongsTo{
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function boards(): HasMany{
        return $this->hasMany(Board::class);
    }

    public function blacklistedMembers():MorphMany{
        return $this->morphMany(BlacklistMember::class, 'blacklistable')->with('user');
    }
}
