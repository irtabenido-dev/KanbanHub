<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class BlacklistMember extends Model
{
    protected $table = 'blacklist_members';
    protected $fillable = ['blacklistable_type', 'blacklistable_id', 'user_id'];

    public function blacklistable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
