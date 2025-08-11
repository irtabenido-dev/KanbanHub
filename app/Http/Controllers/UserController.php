<?php

namespace App\Http\Controllers;

use App\Models\BlacklistMember;
use App\Models\WorkspaceUser;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    //
    use Notifiable;

    public function findUserOrUsers(Request $request)
    {

        $userId = Auth::user()->id;
        $users = [];
        $workspaceId = $request->workspaceId;

        $blacklistedUserIds = BlacklistMember::where('blacklistable_id', $workspaceId)
        ->where('blacklistable_type', Workspace::class)->pluck('user_id')->toArray();

        $users = User::where(function ($query) use ($request) {
            $query->where('name', 'like', "%{$request->searchInput}%")
                ->orWhere('email', 'like', "%{$request->searchInput}%");
        })
            ->whereNot('id', $userId)
            ->whereNotIn('id', $blacklistedUserIds)
            ->whereDoesntHave('workspaces', function ($query) use ($workspaceId) {
                $query->where('workspace_id', $workspaceId);
            })
            ->get();

        return response()->json(['users' => $users], 200);
    }

    public function getUserNotifications()
    {
        $notifications = Auth::user()->unreadNotifications;

        $mappedNotifications = $notifications->map(function ($notification) {
            return match ($notification->type) {
                'App\Notifications\InvitationSent' => [
                    'id' => $notification->id,
                    'invitation_link' => $notification->data['invitation_link'] ?? null,
                    'invited_name' => $notification->data['invited_name'] ?? null,
                    'inviter_name' => $notification->data['inviter_name'] ?? null,
                    'type' => $notification->data['type'] ?? 'invitation_sent',
                    'workspace_id' => $notification->data['workspace_id'] ?? null,
                    'workspace_name' => $notification->data['workspace_name'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\RemoveWorkspaceNotification' => [
                    'type' => $notification->data['type'] ?? 'workspace_removed',
                    'id' => $notification->id,
                    'workspaceName' => $notification->data['workspaceName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\RestoredWorkspaceNotification' => [
                    'type' => $notification->data['type'] ?? 'workspace_restored',
                    'id' => $notification->id,
                    'workspaceName' => $notification->data['workspaceName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\UpdatedWorkspace' => [
                    'type' => $notification->data['type'] ?? 'workspace_updated',
                    'id' => $notification->id,
                    'workspaceName' => $notification->data['workspaceName'] ?? null,
                    'updatedWorkspaceName' => $notification->data['updatedWorkspaceName'],
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\BoardRemovedNotification' => [
                    'type' => $notification->data['type'] ?? 'board_removed',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\BoardRestoredNotification' => [
                    'type' => $notification->data['type'] ?? 'board_removed',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'workspaceName' => $notification->data['workspaceName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\TaskMove' => [
                    'type' => $notification->data['type'] ?? 'task_move',
                    'id' => $notification->id,
                    'taskName' => $notification->data['taskName'] ?? null,
                    'listName' => $notification->data['listName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\TaskUpdateTitle' => [
                    'type' => $notification->data['type'] ?? 'task_title_update',
                    'id' => $notification->id,
                    'updatedTitle' => $notification->data['updatedTitle'] ?? null,
                    'previousTitle' => $notification->data['previousTitle'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\TaskUserAdded' => [
                    'type' => $notification->data['type'] ?? 'task_user_add',
                    'id' => $notification->id,
                    'taskName' => $notification->data['taskName'] ?? null,
                    'addedUserName' => $notification->data['addedUserName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\TaskUserRemoved' => [
                    'type' => $notification->data['type'] ?? 'task_user_remove',
                    'id' => $notification->id,
                    'removedUserName' => $notification->data['removedUserName'] ?? null,
                    'taskName' => $notification->data['taskName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\BoardAddUser' => [
                    'type' => $notification->data['type'] ?? 'board_user_add',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'userName' => $notification->data['userName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\BoardRemoveUser' => [
                    'type' => $notification->data['type'] ?? 'board_user_remove',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'userName' => $notification->data['userName'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\BoardUserRoleUpdate' => [
                    'type' => $notification->data['type'] ?? 'board_user_update',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'newRole' => $notification->data['newRole'] ?? null,
                    'created_at' => $notification->created_at
                ],
                'App\Notifications\TaskRemovedNotification' => [
                    'type' => $notification->data['type'] ?? 'task_removed',
                    'id' => $notification->id,
                    'taskName' => $notification->data['taskName'] ?? null,
                ],
                'App\Notifications\TaskRestoredNotification' => [
                    'type' => $notification->data['type'] ?? 'task_restored',
                    'id' => $notification->id,
                    'taskName' => $notification->data['taskName'] ?? null,
                ],
                'App\Notifications\WorkspaceRoleUpdate' => [
                    'type' => $notification->data['type'] ?? 'workspace_user_role_update',
                    'id' => $notification->id,
                    'updatedRole' => $notification->data['updatedRole'] ?? null,
                    'senderName' => $notification->data['senderName'] ?? null,
                    'workspaceName' => $notification->data['workspaceName'] ?? null
                ],
                'App\Notifications\WorkspaceRemovedUser' => [
                    'type' => $notification->data['type'] ?? 'workspace_remove_user',
                    'id' => $notification->id,
                    'workspaceName' => $notification->data['workspaceName'] ?? null
                ],
                'App\Notifications\TaskListUpdate' => [
                    'type' => $notification->data['type'] ?? 'list_updated',
                    'id' => $notification->id,
                    'updatedListName' => $notification->data['updatedListName'] ?? null,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'previousListName' => $notification->data['previousListName'] ?? null,
                ],
                'App\Notifications\TaskListRemoved' => [
                    'type' => $notification->data['type'] ?? 'list_removed',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'listName' => $notification->data['listName'] ?? null,
                ],
                'App\Notifications\TaskListRestored' => [
                    'type' => $notification->data['type'] ?? 'list_restored',
                    'id' => $notification->id,
                    'boardName' => $notification->data['boardName'] ?? null,
                    'listName' => $notification->data['listName'] ?? null,
                ],
                default => $notification
            };
        });

        return response()->json(['notifications' => $mappedNotifications], 200);
    }

    public function getRole($workspaceId)
    {
        $member = WorkspaceUser::where('workspace_id', $workspaceId)
            ->where('user_id', Auth::user()->id)->first();

        return response()->json(['role' => $member->role]);
    }

    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', '=', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return redirect()->back();
    }
}
