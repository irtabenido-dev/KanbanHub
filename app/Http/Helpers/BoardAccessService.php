<?php

namespace App\Http\Helpers;
class BoardAccessService
{
    public function canAccessBoard($user, $board){
        $workspaceRole = $board->workspace->users()
        ->where('user_id', $user->id)->first()->pivot->role;

        if(in_array($workspaceRole, ['owner', 'admin'])){
            return true;
        }

        return $board->users()->where('user_id', $user->id)->exists();
    }

    public function checkRequestStatus($user, $board){
        if(!$board->accessRequests){
            return null;
        }

        $request = $board->accessRequests->where('user_id', $user->id)->first();

        return $request?->status;
    }
}
