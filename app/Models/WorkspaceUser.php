<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class WorkspaceUser extends Pivot
{
    protected $table = 'workspace_user_role';
    protected $fillable = ['user_id', 'workspace_id', 'role'];

}
