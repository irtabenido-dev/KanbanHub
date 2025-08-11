<?php

namespace App\Http\Controllers;

use App\Events\RefreshNotifications;

use App\Http\Helpers\BoardAccessService;
use App\Models\BlacklistMember;
use App\Models\Board;
use App\Notifications\RestoredWorkspaceNotification;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Workspace;
use App\Notifications\RemoveWorkspaceNotification;
use App\Notifications\UpdatedWorkspace;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    //
    public function getWorkspaces()
    {
        $user = Auth::user();
        $accessChecker = new BoardAccessService();

        $userBlacklistRecords = BlacklistMember::where('user_id', $user->id)
            ->where('blacklistable_type', Board::class)
            ->pluck('blacklistable_id')
            ->toArray();

        $workspaces = $user->workspaces()->whereNull('archived_at')->with([
            'owner',
            'users',
            'boards' => function ($query) use ($user) {
                $query->whereNull('archived_at')
                    ->where(function ($q) use ($user) {
                        $q->orWhereHas('users', function ($query) use ($user) {
                            $query->where('users.id', $user->id);
                        })
                            ->orWhereExists(function ($query) use ($user) {
                                $query->select(\DB::raw(1))
                                    ->from('workspace_user_role')
                                    ->whereColumn('workspace_user_role.workspace_id', 'boards.workspace_id')
                                    ->where('workspace_user_role.user_id', $user->id);
                            });
                    });
            }
        ])->latest()->get()->map(function ($workspace) use ($accessChecker, $user, $userBlacklistRecords) {
            return [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'owner_name' => $workspace->owner->name,
                'owner_id' => $workspace->owner->id,
                'currentUser' => [
                    'id' => $workspace->pivot->user_id,
                    'role' => $workspace->pivot->role
                ],
                'users' => $workspace->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->pivot->role
                    ];
                }),
                'boards' => $workspace->boards->sortByDesc('created_at')->map(function ($board) use ($accessChecker, $user, $userBlacklistRecords) {
                    return [
                        'id' => $board->id,
                        'name' => $board->name,
                        'workspaceId' => $board->workspace_id,
                        'created_at' => $board->created_at,
                        'hasAccess' => $board->private
                            ? $accessChecker->canAccessBoard($user, $board) && !in_array($board->id, $userBlacklistRecords)
                            : !in_array($board->id, $userBlacklistRecords),
                        'requestStatus' => $accessChecker->checkRequestStatus($user, $board),
                        'blacklisted' => in_array($board->id, $userBlacklistRecords)
                    ];
                })->values()
            ];
        });

        return $workspaces;
    }

    public function getArchivedWorkspaces()
    {
        $user = Auth::user();

        $mappedWorkspaces = $user->workspaces()->where('owner_id', '=', $user->id)->whereNotNull('archived_at')->with(['owner', 'users', 'boards'])->latest()->get()->map(function ($workspace) {
            return [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'owner_name' => $workspace->owner->name,
                'owner_id' => $workspace->owner->id,
                'archived_at' => Carbon::parse($workspace->archived_at)->format('Y-m-d'),
                'currentUser' => [
                    'id' => $workspace->pivot->user_id,
                    'role' => $workspace->pivot->role
                ],
                'users' => $workspace->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->pivot->role
                    ];
                }),
                'boards' => $workspace->boards->map(function ($board) {
                    return [
                        'id' => $board->id,
                        'name' => $board->name,
                        'workspaceId' => $board->workspace_id,
                        'created_at' => $board->created_at
                    ];
                })
            ];
        });

        return $mappedWorkspaces;
    }

    public function index()
    {
        $workspaces = $this->getWorkspaces();

        return Inertia::render('Workspaces', [
            'workspaces' => $workspaces,
        ]);
    }

    public function archivedWorkspaces()
    {

        return response()->json([
            'workspaces' => $this->getArchivedWorkspaces()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:115|unique:workspaces,name'
        ]);

        $user = Auth::user();
        $generatedId = STR::uuid();

        $workspace = Workspace::create([
            'id' => $generatedId,
            'name' => ucfirst($request->name),
            'owner_id' => $user->id
        ]);

        $workspace->users()->attach($user->id, ['workspace_id' => $generatedId, 'role' => 'owner']);

        $newWorkspace = $user->workspaces()->with(['owner', 'users', 'boards'])->find($generatedId);

        $mappedWorkspace = [
            'id' => $newWorkspace->id,
            'name' => $newWorkspace->name,
            'owner_name' => $newWorkspace->owner->name,
            'owner_id' => $newWorkspace->owner->id,
            'currentUser' => [
                'id' => $newWorkspace->pivot->user_id,
                'role' => $newWorkspace->pivot->role
            ],
            'users' => $newWorkspace->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role
                ];
            }),
            'boards' => $newWorkspace->boards->map(function ($board) {
                return [
                    'id' => $board->id,
                    'name' => $board->name,
                    'workspaceId' => $board->workspace_id,
                    'created_at' => $board->created_at
                ];
            })
        ];

        return response()->json([
            'workspace' => $mappedWorkspace
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:workspaces,id',
            'name' => 'required|string|max:115|unique:workspaces,name'
        ]);

        $user = Auth::user();
        $workspace = Workspace::findOrFail($request->id)
            ->with('owner')->first();
        $workspace->name = $request->name;
        $workspace->save();

        $users = $workspace->users->where('id', '!=', $user->id);
        $userIds = $users->pluck('id')->toArray();

        Notification::send(
            $users,
            new UpdatedWorkspace(
                $workspace->name,
                $request->name,
                $workspace->id,
                $workspace->owner->name
            )
        );

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        }

        return response()->noContent();
    }

    public function archive(Request $request)
    {
        $workspace = Workspace::findOrFail($request->id);
        $workspace->archived_at = Carbon::now();
        $workspace->save();

        $userId = Auth::id();

        $users = $workspace->users->where('id', '!=', $userId);
        $userIds = $users->pluck('id')->toArray();

        Notification::send($users, new RemoveWorkspaceNotification($workspace->name, $workspace->id, $workspace->owner->name));

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        }

        return response()->json([
            'id' => $request->id
        ]);
    }

    public function unarchive(Request $request)
    {
        $workspace = Workspace::findOrFail($request->id);
        $workspace->archived_at = null;
        $workspace->save();

        $user = Auth::user();

        $updatedWorkspace = $user->workspaces()->with(['owner', 'users', 'boards'])->find($request->id);

        $mappedWorkspace = [
            'id' =>  $updatedWorkspace->id,
            'name' =>  $updatedWorkspace->name,
            'owner_name' =>  $updatedWorkspace->owner->name,
            'owner_id' =>  $updatedWorkspace->owner->id,
            'currentUser' => [
                'id' =>  $updatedWorkspace->pivot->user_id,
                'role' =>  $updatedWorkspace->pivot->role
            ],
            'users' =>  $updatedWorkspace->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role
                ];
            }),
            'boards' =>  $updatedWorkspace->boards->map(function ($board) {
                return [
                    'id' => $board->id,
                    'name' => $board->name,
                    'workspaceId' => $board->workspace_id
                ];
            })
        ];

        $users = $workspace->users->where('id', '!=', $user->id);
        $userIds = $users->pluck('id')->toArray();

        Notification::send($users, new RestoredWorkspaceNotification($mappedWorkspace['name'], $user->id, $workspace->owner->name));

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        }

        return response()->json([
            'restoredWorkspace' => $mappedWorkspace
        ]);
    }

    public function destroy(Request $request)
    {
        $workspace = Workspace::findOrFail($request->id);
        $users = $workspace->users;
        $owner = $workspace->owner;

        DB::table('notifications')->whereJsonContains('data->workspace_id', $request->id)->delete();
        DB::table('invitations')->where('workspace_id', $request->id)->delete();
        DB::table('boards')->where('workspace_id', $request->id)->delete();

        Notification::send($users, new RemoveWorkspaceNotification($workspace->name, $workspace->id, $owner->name));

        $workspace->delete();

        return response()->json([
            'id' => $request->id
        ]);
    }
}
