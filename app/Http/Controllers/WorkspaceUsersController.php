<?php

namespace App\Http\Controllers;

use App\Events\AddUserToWorkspace;
use App\Events\RefreshNotifications;
use App\Events\RemoveUserFromWorkspace;
use App\Events\UpdateUserRole;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use App\Notifications\WorkspaceRemovedUser;
use App\Notifications\WorkspaceRoleUpdate;
use Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Notification;

class WorkspaceUsersController extends Controller
{
    //

    public function addMember($invitation_data)
    {
        WorkspaceUser::create([
            'workspace_id' => $invitation_data['workspace_id'],
            'user_id' => $invitation_data['user_id'],
            'role' => $invitation_data['role']
        ]);

        return redirect()->route('workspaces.index');
    }

    public function getMembers(Request $request)
    {

        $members = WorkspaceUser::where('workspace_id', $request->id)
            ->with(['user:id,name,email'])->get();

        $members = $members->map(function ($member) {
            $member->user->name = ucfirst($member->user->name);
            $member->role = ucfirst($member->role);
            return $member;
        });

        return response()->json(['members' => $members], 200);
    }

    public function removeMember(Request $request, $workspaceId, $userId)
    {

        WorkspaceUser::where('workspace_id', $workspaceId)
        ->where('user_id', $userId)->delete();

        $workspace = Workspace::findOrFail($workspaceId);

        $notificationRecipient = User::findOrFail($userId);

        Notification::send($notificationRecipient, new WorkspaceRemovedUser(
            $userId,
            $workspaceId,
            $workspace->name,
            Auth::id()
        ));

        event(new RefreshNotifications($userId));

        return response()->noContent(204);
    }

    public function updateMember(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'targetId' => 'required',
            'workspaceId' => 'required',
            'role' => ['required', function ($attribute, $value, $fail) use ($request) {
                $existingRole = WorkspaceUser::where('user_id', $request->targetId)
                    ->where('workspace_id', $request->workspaceId)
                    ->value('role');

                if ($value === $existingRole) {
                    $fail("The {$attribute} must be different from the current role.");
                }
            }],
            'previousOwnerId' => 'required',
            'targetName' => 'required|string',
            'currentUserId' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $targetUser = WorkspaceUser::where('user_id', $request->targetId)
        ->where('workspace_id', $request->workspaceId)
        ->first();

        $currentUser = WorkspaceUser::where('user_id', $request->currentUserId)->where('workspace_id', $request->workspaceId)
        ->first();

        $workspace = Workspace::where('id', $request->workspaceId)->first();

        if($request->role === "owner" ){
            $currentUser->role = "admin";
            $targetUser->role = "owner";
            $workspace->owner_id = $request->targetId;
            $workspace->save();
            $currentUser->save();
            $targetUser->save();
        }else{
            $targetUser->role = $request->role;
            $targetUser->save();
        }

        $notificationReceipient = User::findOrFail($request->targetId);

        Notification::send($notificationReceipient, new WorkspaceRoleUpdate(
            $currentUser->id,
            $notificationReceipient->name,
            $workspace->id,
            $workspace->name,
            $request->targetId,
            $request->role,
            $request->previousOwnerId,
            $request->targetName
        ));

        event(new RefreshNotifications($request->targetId));

        return response()->noContent(204);
    }
}
