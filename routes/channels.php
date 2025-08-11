<?php

use App\Models\Board;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('invite.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
    return $user->workspaces->contains('id', $workspaceId);
});

Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    return DB::table('board_members')
        ->where('board_id', $boardId)
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    $task = Task::find($taskId);

    if (!$task) {
        return false;
    }

    $list = $task->list;
    $board = $list->board;

    return DB::table('board_members')
        ->where('board_id', $board->id)
        ->where('user_id', $user->id)
        ->exists();
});
