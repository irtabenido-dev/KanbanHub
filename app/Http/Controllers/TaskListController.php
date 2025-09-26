<?php

namespace App\Http\Controllers;

use App\Events\RefreshNotifications;
use App\Models\Board;
use App\Models\TaskList;
use App\Notifications\TaskListRemoved;
use App\Notifications\TaskListUpdate;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Notification;

class TaskListController extends Controller
{
    public function addList(Request $request)
    {
        $request->validate([
            'boardId' => 'required',
            'name' => 'required|string|unique:lists,name|max:255',
        ]);

        $board = Board::findOrFail($request->boardId);

        $highestPositionList = $board->taskLists()->orderBy('position_number', 'DESC')->first();

        $highestPosition = $highestPositionList ? $highestPositionList->position_number + 1000 : 1000;

        $newList = TaskList::create([
            'board_id' => $request->boardId,
            'name' => $request->name,
            'archived_at' => null,
            'position_number' => $highestPosition,
        ]);

        return response()->json([
            'newList' => [
                'id' => $newList->id,
                'boardId' => $newList->board_id,
                'name' => $newList->name,
                'position_number' => $highestPosition,
                'tasks' => [],
                'archived_at' => $newList->archived_at,
                'created_at' => $newList->created_at,
            ]
        ]);
    }

    public function getLists(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:boards,id'
        ]);

        $board = Board::findOrFail($request->id);
        $taskLists = $board->taskLists()->whereNull('archived_at')
            ->with('tasks')->orderBy('position_number', 'DESC')->get();

        $mappedTaskLists = $taskLists->map(fn($list) => [
            'id' => $list->id,
            'name' => $list->name,
            'archived_at' => Carbon::parse($list->archived_at)->format('Y-m-d'),
            'tasks' => $list->tasks->map(fn($task) => [
                'id' => $task->id,
                'boardId' => $task->board_id,
                'listId' => $task->list_id,
                'description' => $task->description,
                'deadline' => $task->deadline,
                'status' => $task->status,
                'archived_at' => $task->archived_at
            ]),
        ]);

        return response()->json([
            'taskLists' => $mappedTaskLists
        ]);
    }

    public function getArchivedLists(Request $request)
    {
        $request->validate([
            'boardId' => 'required|exists:boards,id'
        ]);

        $board = Board::findOrFail($request->boardId);

        $archivedLists = $board->taskLists()->whereNotNull('archived_at')
            ->with('tasks')->get();

        $mappedArchivedLists = $archivedLists->map(
            fn($list) =>
            [
                'id' => $list->id,
                'name' => $list->name,
                'archived_at' => Carbon::parse($list->archived_at)->format('Y-m-d'),
                'tasks' => $list->tasks->map(fn($task) => [
                    'id' => $task->id,
                    'boardId' => $task->board_id,
                    'listId' => $task->list_id,
                    'description' => $task->description,
                    'deadline' => $task->deadline,
                    'status' => $task->status,
                    'archived_at' => $task->archived_at
                ]),
            ]
        );

        return response()->json([
            'archivedLists' => $mappedArchivedLists
        ]);
    }

    public function updateListName(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:lists,id',
            'name' => 'required|unique:lists,name'
        ]);

        $taskList = TaskList::findOrFail($request->id);
        $previousName = $taskList->name;
        $taskList->name = $request->name;
        $taskList->save();

        $boardUsers = $taskList->board->users;

        Notification::send($boardUsers, new TaskListUpdate(
            $taskList->board->id,
            $taskList->id,
            $request->name,
            $previousName,
            $taskList->board->name,
            Auth::id()
        ));

        foreach ($boardUsers as $user) {
            event(new RefreshNotifications($user->id));
        };

        return response()->noContent();
    }

    public function archiveList(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:lists,id'
        ]);

        $taskList = TaskList::findOrFail($request->id);
        $taskList->archived_at = Carbon::now();
        $taskList->save();

        $boardUsers = $taskList->board->users;

        Notification::send($boardUsers, new TaskListRemoved(
            Auth::id(),
            $taskList->board->id,
            $taskList->id,
            $taskList->board->name,
            $taskList->name
        ));

        foreach ($boardUsers as $user) {
            event(new RefreshNotifications($user->id));
        }

        return response()->noContent();
    }

    public function unArchiveList(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:lists,id'
        ]);

        $taskList = TaskList::with('tasks.users')->findOrFail($request->id);
        $taskList->archived_at = null;
        $taskList->save();

        $mappedList = [
            'id' => $taskList->id,
            'boardId' => $taskList->board_id,
            'name' => $taskList->name,
            'position_number' => $taskList->position_number,
            'archived_at' => null,
            'tasks' => $taskList->tasks->map(fn($task) => [
                'id' => $task->id,
                'boardId' => $task->board_id,
                'listId' => $task->list_id,
                'title' => $task->title,
                'description' => $task->description,
                'deadline' => $task->deadline,
                'completed' => $task->completed,
                'task_attributes' => $task->task_attributes,
                'position_number' => $task->position_number,
                'archived_at' => $task->archived_at,
                'users' => $task->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profilePicture' => $user->profile_data['profilePicture']
                ])
            ]),
        ];

        return response()->json([
            'restoredList' => $mappedList
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:lists,id'
        ]);

        $taskList = TaskList::findOrFail($request->id);

        DB::transaction(function () use ($taskList) {
            $taskList->delete();

            $boardUsers = $taskList->board->users;

            Notification::send($boardUsers, new TaskListRemoved(
                Auth::id(),
                $taskList->board->id,
                $taskList->id,
                $taskList->board->name,
                $taskList->name
            ));

            foreach ($boardUsers as $user) {
                event(new RefreshNotifications($user->id));
            }
        });

        return response()->noContent();
    }

    public function updateListsPosition(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:lists,id',
            'position_number' => 'required'
        ]);

        $taskList = TaskList::findOrFail($request->id);

        $taskList->position_number = $request->position_number;
        $taskList->save();

        return response()->noContent();
    }

    public function reIndexLists(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:boards,id'
        ]);

        $board = Board::findOrFail($request->id);

        DB::transaction(function () use ($board) {
            $lists = $board->taskLists()->orderBy('position_number', 'ASC')->get();

            $gap = 0;

            foreach ($lists as $list) {
                $targetList = TaskList::findOrFail($list->id);
                $targetList->position_number = $gap;
                $gap += 1000;
                $targetList->save();
            }
        });

        $updatedLists = $board->taskLists()->whereNull('archived_at')->orderBy('position_number', 'ASC')->get();

        $mappedTaskLists = $updatedLists->map(fn($list) => [
            'id' => $list->id,
            'name' => $list->name,
            'position_number' => $list->position_number,
            'archived_at' => Carbon::parse($list->archived_at)->format('Y-m-d'),
            'tasks' => $list->tasks->map(fn($task) => [
                'id' => $task->id,
                'boardId' => $task->board_id,
                'listId' => $task->list_id,
                'title' => $task->title,
                'description' => $task->description,
                'deadline' => $task->deadline,
                'status' => $task->status,
                'archived_at' => $task->archived_at
            ]),
        ]);

        return response()->json([
            'reIndexedLists' => $mappedTaskLists
        ]);
    }
}
