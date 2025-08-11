<?php

namespace App\Http\Controllers;

use App\Events\RefreshNotifications;
use App\Http\Helpers\BoardAccessService;
use App\Models\BlacklistMember;
use App\Models\Board;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\BoardAddUser;
use App\Notifications\BoardRemoveUser;
use App\Notifications\BoardUserRoleUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Notification;

class BoardUsersController extends Controller
{
    public function getAvailableUsers(Request $request)
    {
        $board = Board::findOrFail($request->boardId);
        $workspace = Workspace::findOrFail($board->workspace_id);

        $blacklistedUserIds = BlacklistMember::where('blacklistable_id', $board->id)
        ->where('blacklistable_type', Board::class)
        ->pluck('user_id')->toArray();

        $workspaceUsers = $workspace->users()
            ->wherePivotIn('role', ['member'])
            ->get();

        $boardUserIds = $board->users()
        ->pluck('users.id')->toArray();

        $availableUsers = $workspaceUsers->filter(function ($user) use ($boardUserIds, $blacklistedUserIds) {
            return !in_array($user->id, $boardUserIds) && !in_array($user->id, $blacklistedUserIds);
        });

        return response()->json([
            'availableUsers' => $availableUsers->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'workspaceRole' => $user->pivot->role,
                ];
            })
        ]);
    }

    public function addUser(Request $request)
    {
        $board = Board::findOrFail($request->boardId);
        $user = User::findOrFail($request->userId);

        $board->users()->attach(
            $request->userId,
            ['role' => $request->role]
        );

        $workspace = Workspace::findOrFail($board->workspace_id);
        $workspaceUsers = $workspace->users()->get();

        $mappedUser = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'boardRole' => $request->role,
            'workspaceRole' => optional($workspaceUsers->firstWhere('id', $user->id))
                ->pivot->role ?? null,
            'isVirtual' => !$board->users->contains('id', $user->id)
        ];

        $accessChecker = new BoardAccessService();

        Notification::send($user, new BoardAddUser(
            $board->id,
            $board->name,
            $workspace->id,
            $accessChecker->canAccessBoard($user, $board),
            $mappedUser,
            Auth::id()
        ));

        return response()->json([
            'newUser' => $mappedUser
        ]);
    }

    public function updateRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
            'boardId' => 'required|exists:boards,id',
            'targetId' => 'required|exists:users,id'
        ]);

        $board = Board::findOrFail($request->boardId);
        $targetUser = $board->users()->find($request->targetId);

        if ($targetUser->pivot->role === $request->role) {
            throw ValidationException::withMessages([
                'role' => ['The new role must be different from the current role.'],
            ]);
        }

        $currentUser = $board->users->find(Auth::id());

        $boardOwner = $board->users()->where('role', 'owner')->first();

        if ($boardOwner && $request->role === 'owner' && $boardOwner->id !== $request->targetId) {
            $board->users()->updateExistingPivot(
                $boardOwner->id,
                ['role' => 'admin']
            );

            Notification::send($boardOwner, new BoardUserRoleUpdate(
                $boardOwner->id,
                'admin',
                $board->id,
                $board->name,
                Auth::id()
            ));
        }

        if (
            ($currentUser->pivot->role === 'owner' && $currentUser->id !== $request->targetId)
            && $request->role === 'owner'
        ) {
            $board->users()->updateExistingPivot($currentUser->id, ['role' => 'admin']);
        }

        $targetUserWorkspaceRole = $board->workspace->users()->where('user_id', $targetUser->id)
            ->first()->pivot->role;

        $board->users()->updateExistingPivot($request->targetId, ['role' => $request->role]);

        $mappedUser = [
            'id' => $targetUser->id,
            'name' => $targetUser->name,
            'email' => $targetUser->email,
            'boardRole' => $request->role,
            'workspacerole' => $targetUserWorkspaceRole
        ];

        Notification::send($targetUser, new BoardUserRoleUpdate(
            $targetUser->id,
            $request->role,
            $board->id,
            $board->name,
            Auth::id()
        ));

        event(new RefreshNotifications($targetUser->id));

        return response()->json([
            'updatedUser' => $mappedUser
        ]);
    }

    public function removeUser(Request $request)
    {
        $board = Board::findOrFail($request->boardId);

        $workspace = Workspace::findOrFail($board->workspace_id);

        $user = $board->users()->find($request->targetId);

        $board->users()->detach($user);

        Notification::send($user, new BoardRemoveUser(
            $user->id,
            $user->name,
            $board->id,
            $board->name,
            $workspace->id,
            false,
            Auth::id()
        ));

        event(new RefreshNotifications($user->id));

        return response()->noContent();
    }
}
