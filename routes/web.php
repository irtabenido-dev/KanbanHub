<?php

use App\Http\Controllers\BlacklistController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardJoinRequestController;
use App\Http\Controllers\BoardUsersController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskListController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceUsersController;
use App\Http\Controllers\UserController;
use App\Models\BoardMembers;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('workspaces.index');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/deactivate', [ProfileController::class, 'deactivate'])->name('profile.deactivate');
    Route::post('/profile/reactivate', [ProfileController::class, 'reactivate'])->name('profile.reactivate');

    Route::get('/users/blacklisted', [BlacklistController::class, 'getBlacklistedUsers'])->name('user.blacklisted');
    Route::post('/users/blacklist', [BlacklistController::class, 'addUserToBlacklist'])->name('user.blacklist');
    Route::delete('/users/blacklist/remove', [BlacklistController::class, 'removeUserFromBlacklist'])->name('user.removeUserFromBlacklist');

    Route::get('/notifications', [UserController::class, 'getUserNotifications'])->name('user.notifications');
    Route::post('/notifications/{id}/markAsRead', [UserController::class, 'markAsRead'])->name('user.markNotification');
    Route::post('/users/{searchInput}', [UserController::class, 'findUserOrUsers'])->name('user.search');

    Route::post('/workspace/invite', [InviteController::class, 'inviteMember'])->name('user.invite');
    Route::get('/invitation/{code}', [InviteController::class, 'verifyInvitation'])->name('user.verifyInvite');

    Route::get('/workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');
    Route::get('/workspaces/archive', [WorkspaceController::class, 'archivedWorkspaces'])->name('workspaces.archived');
    Route::post('/workspace/create', [WorkspaceController::class, 'store'])->name('workspace.store');
    Route::patch('/workspace/update/{id}', [WorkspaceController::class, 'update'])->name('workspace.update');
    Route::delete('/workspace/destroy/{id}', [WorkspaceController::class, 'destroy'])->name('workspace.destroy');
    Route::patch('/workspace/archive/{id}', [WorkspaceController::class, 'archive'])->name('workspace.archive');
    Route::patch('/workspace/unarchive/{id}', [WorkspaceController::class, 'unarchive'])->name('workspace.unarchive');

    Route::patch('/workspace/user/update', [WorkspaceUsersController::class, 'updateMember'])->name('userRole.update');
    Route::post('/workspace/{workspaceId}/user/remove/{userId}', [WorkspaceUsersController::class, 'removeMember'])->name('user.remove');

    Route::get('/workspace/{workspaceId}/board/{id}', [BoardController::class, 'index'])->name('board.index');
    Route::post('/workspace/board/create', [BoardController::class, 'store'])->name('board.store');
    Route::patch('/workspace/board/{id}/update', [BoardController::class, 'update'])->name('board.update');
    Route::get('/workspace/{workspaceId}/archivedBoards', [BoardController::class, 'archivedBoards'])->name('board.archived');
    Route::patch('/workspace/board/archive/{id}', [BoardController::class, 'archive'])->name('board.archive');
    Route::patch('/workspace/board/unarchive/{id}', [BoardController::class, 'unarchive'])->name('board.unarchive');
    Route::delete('/workspace/board/{id}/destroy', [BoardController::class, 'destroy'])->name('board.destroy');
    Route::get('/workspace/board/{id}/members', [BoardController::class, 'getBoardUsers'])->name('board.users');

    Route::post('/workspace/board/access_request', [BoardJoinRequestController::class, 'store'])->name('board.request.send');
    Route::get('/workspace/board/{boardId}/joinRequests', [BoardJoinRequestController::class, 'getRequests'])->name('board.joinRequests.get');
    Route::post('/workspace/board/access_response', [BoardJoinRequestController::class, 'requestResponse'])->name('board.request.response');

    Route::post('/workspace/board/addUser', [BoardUsersController::class, 'addUser'])->name('board.user.add');
    Route::patch('/board/user/updateRole', [BoardUsersController::class, 'updateRole'])->name('board.user.update');
    Route::get('/workspace/board/{boardId}', [BoardUsersController::class, 'getAvailableUsers'])->name('board.availableUsers.get');
    Route::delete('workspace/board/{boardId}/user/{targetId}', [BoardUsersController::class, 'removeUser'])->name('board.remove.user');

    Route::get('{boardId}/getTaskLists', [TaskListController::class, 'getLists'])->name('taskList.get');
    Route::get('taskList/archived', [TaskListController::class, 'getArchivedLists'])->name('taskList.get.archived');
    Route::post('taskList/addList', [TaskListController::class, 'addList'])->name('taskList.add');
    Route::post('taskList/updateName', [TaskListController::class, 'updateListName'])->name('taskList.update.name');
    Route::post('taskList/reIndex', [TaskListController::class, 'reIndexLists'])->name('taskList.reIndex');
    Route::patch('taskList/archive', [TaskListController::class, 'archiveList'])->name('taskList.archive');
    Route::patch('taskList/unArchive', [TaskListController::class, 'unArchiveList'])->name('taskList.unArchive');
    Route::patch('taskList/position/update', [TaskListController::class, 'updateListsPosition'])->name('taskList.position.update');
    Route::delete('taskList/destroy', [TaskListController::class, 'destroy'])->name('taskList.destroy');

    Route::get('task/users', [TaskController::class, 'getUsers'])->name('task.get.users');
    Route::post('task/user/add', [TaskController::class, 'addUser'])->name('task.add.user');
    Route::post('task/user/remove', [TaskController::class, 'removeUser'])->name('task.remove.user');
    Route::post('task/add', [TaskController::class, 'addTask'])->name('task.add');
    Route::patch('task/position/update', [TaskController::class, 'moveTask'])->name('task.position.update');
    // Route::get('task/getArchived', [TaskController::class, 'getArchivedTasks'])->name('task.getArchivedTasks');
    Route::get('task/getAllArchived', [TaskController::class, 'getAllArchivedTasks'])->name('task.getAllArchived');
    Route::patch('tasks/archive', [TaskController::class, 'archiveTask'])->name('task.archive');
    Route::patch('tasks/unArchive', [TaskController::class, 'unArchiveTask'])->name('task.unArchive');
    Route::delete('tasks/delete', [TaskController::class, 'deleteTask'])->name('task.delete');
    Route::post('tasks/reIndex', [TaskController::class, 'reIndexTasks'])->name('tasks.reIndex');
    Route::post('task/title/update', [TaskController::class, 'titleUpdate'])->name('task.title.update');
    Route::patch('task/completed/toggle', [TaskController::class, 'toggleCompletion'])->name('task.completion.toggle');
    Route::post('task/description/update', [TaskController::class, 'updateDescription'])->name('task.description.update');
    Route::get('task/getActivities', [TaskController::class, 'getActivities'])->name('task.get.activities');
    Route::get('task/downloadFiles', [TaskController::class, 'downloadFiles'])->name('task.download.files');
    Route::get('task/getFiles', [TaskController::class, 'getFiles'])->name('task.get.files');
    Route::post('task/uploadFiles', [TaskController::class, 'uploadFiles'])->name('task.upload.files');
    Route::post('task/deleteFiles', [TaskController::class, 'deleteFiles'])->name('task.delete.files');
    Route::post('task/addComment', [TaskController::class, 'addComment'])->name('task.add.comment');
    Route::patch('task/comment/update', [TaskController::class, 'editComment'])->name('task.comment.edit');
    Route::delete('task/comment/delete', [TaskController::class, 'deleteComment'])->name('task.comment.delete');
    Route::post('task/setDueDate', [TaskController::class, 'setDueDate'])->name('task.set.dueDate');
    Route::delete('task/removeDueDate', [TaskController::class, 'removeDueDate'])->name('task.remove.dueDate');
});

require __DIR__ . '/auth.php';
