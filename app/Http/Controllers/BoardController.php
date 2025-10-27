<?php

namespace App\Http\Controllers;

use App\Events\RefreshNotifications;

use App\Http\Helpers\BoardAccessService;
use App\Models\Board;
use App\Models\Workspace;
use App\Models\WorkspaceUsers;
use App\Notifications\BoardRemovedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Notifications\BoardRestoredNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BoardController extends Controller
{
    public function archivedBoards(Request $request)
    {
        $boards = Board::whereNotNull('archived_at')->where('workspace_id', $request->workspaceId)->latest('archived_at')->get();

        $mappedBoard = $boards->map(function ($board) {
            return [
                'id' => $board->id,
                'name' => $board->name,
                'private' => $board->private,
                'workspaceId' => $board->workspace_id,
                'archived_at' => Carbon::parse($board->archived_at)->format('Y-m-d'),
            ];
        });

        return response()->json([
            'archivedBoards' => $mappedBoard
        ]);
    }

    public function index(Request $request)
    {
        $currentUser = Auth::user();

        $board = Board::with(['owner', 'relatedBoards' => function ($query) use ($request) {
            $query->where('id', '!=', $request->id)->latest();
        }])->whereNull('archived_at')->findOrFail($request->id);

        $isBoardMember = $board->users()->where('user_id', $currentUser->id)->exists();

        if (!$isBoardMember && !$board->private) {
            $board->users()->attach(
                $currentUser->id,
                ['role' => 'member']
            );
        }

        $workspaceOwner = Workspace::findOrFail($board->workspace_id)->owner()->first();

        $mappedBoard = [
            'id' => $board->id,
            'boardOwnerId' => $board->owner_id,
            'workspaceId' => $board->workspace_id,
            'workspaceOwnerId' => $workspaceOwner->id,
            'name' => $board->name,
            'created_at' => $board->created_at,
            'private' => $board->private,
            'relatedBoards' => $board->relatedBoards->map(fn($board) =>
            [
                'id' => $board->id,
                'name' => $board->name,
                'workspaceId' => $board->workspace_id,
                'private' => $board->private,
                'created_at' => $board->created_at,
            ])
        ];

        $taskLists = $board->taskLists()->with(['tasks' => function ($query) {
            $query->with(['users' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])->whereNull('archived_at')
                ->orderBy('position_number', 'asc');
        }])->whereNull('archived_at')
            ->orderBy('position_number', 'asc')->get();

        $mappedTaskLists = $taskLists->map(fn($list) => [
            'id' => $list->id,
            'boardId' => $list->board_id,
            'name' => $list->name,
            'position_number' => $list->position_number,
            'archived_at' => $list->archived_at ? Carbon::parse($list->archived_at)->format('Y-m-d') : null,
            'tasks' => $list->tasks->map(fn($task) => [
                'id' => $task->id,
                'boardId' => $task->board_id,
                'listId' => $task->list_id,
                'title' => $task->title,
                'description' => $task->description,
                'deadline' => $task->deadline,
                'completed' => $task->completed,
                'task_attributes' => $task->attributes,
                'position_number' => $task->position_number,
                'archived_at' => $task->archived_at,
                'users' => $task->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profilePicture' => $user->profile_data['profilePicture']
                ])
            ]),
        ]);

        $workspaceUsers = Workspace::findOrFail($board->workspace_id)->users()->get();
        $allMembers = $board->allUsers();

        $users = $allMembers->map(function ($user) use ($workspaceUsers, $board) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'boardRole' => optional($board->users->firstWhere('id', $user->id))
                    ->pivot->role ?? null,
                'workspaceRole' => optional($workspaceUsers->firstWhere('id', $user->id))
                    ->pivot->role ?? null,
                'profilePicture' => $user->profile_data['profilePicture'],
                'isVirtual' => !$board->users->contains('id', $user->id),
            ];
        });

        return Inertia::render('Board', [
            'board' => $mappedBoard,
            'lists' => $mappedTaskLists,
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'max:115',
                Rule::unique('boards')->where(function ($query) use ($request) {
                    return $query->where('workspace_id', $request->workspaceId);
                }),
            ],
            'private' => 'required'
        ]);

        $accessChecker = new BoardAccessService();
        $generatedId = STR::uuid();
        $user = Auth::user();

        Board::create([
            'id' => $generatedId,
            'workspace_id' => $request->workspaceId,
            'name' => ucfirst($request->name),
            'private' => $request->private,
            'owner_id' => $user->id
        ]);

        $board = Board::findOrFail($generatedId);

        $board->users()->attach($user->id, ['role' => 'owner']);

        return response()->json([
            'board' => [
                'id' => $board->id,
                'name' => $board->name,
                'workspaceId' => $board->workspace_id,
                'private' => $board->private,
                'created_at' => $board->created_at,
                'hasAccess' => $accessChecker->canAccessBoard($user, $board),
            ]
        ], 200);
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:boards,id',
            'name' => 'required|string|max:115|unique:boards,name'
        ]);

        $board = Board::findOrFail($request->id);
        $board->name = $request->name;
        $board->save();

        return response()->noContent(204);
    }

    public function archive(Request $request)
    {
        $board = Board::findOrFail($request->id);
        $board->archived_at = Carbon::now();
        $board->save();

        $users = null;

        $users = $board->private
            ? $board->users()->get()
            : Workspace::findOrFail($board->workspace_id)->users()->get();

        $userIds = $users->pluck('id')->toArray();

        Notification::send($users, new BoardRemovedNotification(
            Auth::id(),
            $board,
        ));

        $userId = Auth::id();

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        };

        return response()->noContent(204);
    }

    public function unarchive(Request $request)
    {
        $board = Board::with('users')->findOrFail($request->id);
        $board->archived_at = null;
        $board->save();

        $workspace = Workspace::findOrFail($board->workspace_id);
        $user = Auth::user();

        $users = null;

        $users = $board->private
            ? $board->users()->get()
            : Workspace::findOrFail($board->workspace_id)->users()->get();

        $userIds = $users->pluck('id')->toArray();

        function mappedBoard($user, $board)
        {
            $accessChecker = new BoardAccessService();
            return [
                'id' => $board->id,
                'name' => $board->name,
                'workspaceId' => $board->workspace_id,
                'private' => $board->private,
                'created_at' => $board->created_at,
                'hasAccess' => $board->private ? $accessChecker->canAccessBoard($user, $board) : true,
                'requestStatus' => $accessChecker->checkRequestStatus($user, $board)
            ];
        }

        foreach ($users as $user) {
            $mappedBoard = mappedBoard($user, $board);

            Notification::send($user, new BoardRestoredNotification(
                $mappedBoard,
                $workspace->id,
                $workspace->name,
                Auth::id()
            ));
        }

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        }

        $restoredBoard = mappedBoard(Auth::user(), $board);

        return response()->json([
            'restoredBoard' => $restoredBoard
        ]);
    }

    public function destroy(Request $request)
    {
        $board = Board::findOrFail($request->id);

        $boardCopy = $board->toArray();

        $users = null;

        $users = $board->private
            ? $board->users()->get()
            : Workspace::findOrFail($board->workspace_id)->users()->get();

        $userIds = $users->pluck('id')->toArray();

        Notification::send($users, new BoardRemovedNotification(
            Auth::id(),
            $boardCopy
        ));

        $userId = Auth::id();

        $board->delete();

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        };

        return response()->noContent();
    }
}
