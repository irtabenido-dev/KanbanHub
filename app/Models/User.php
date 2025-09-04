<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_data'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'profile_data' => 'array'
        ];
    }

    protected static function booted(){
        static::creating(function($user){
            $user->profile_data ??= ['profilePicture' => null, 'theme' => 'dark'];
        });

        static::deleting(function($user){
            $user->notifications()->delete();
        });
    }

    public function workspaces(): BelongsToMany{
        return $this->belongsToMany(
        Workspace::class,
         'workspace_user_role')
        ->using(WorkspaceUser::class)
        ->withPivot('role')
        ->withTimestamps();
    }

    public function boards(): BelongsToMany{
        return $this->belongsToMany(
            Board::class,
            'board_members')
            ->using(BoardMember::class)
            ->withPivot('role')
            ->withTimestamps();
    }
}
