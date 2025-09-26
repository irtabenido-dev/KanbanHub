<?php

namespace App\Http\Controllers;

use App\Events\RefreshNotifications;
use App\Events\TaskAddAttachment;
use App\Events\TaskAddComment;
use App\Events\TaskDeleteAttachment;
use App\Events\TaskDeleteComment;
use App\Events\TaskEditComment;
use App\Events\TaskRemoveDeadline;
use App\Events\TaskToggleCompletion;
use App\Events\TaskUpdateDeadline;
use App\Events\TaskUpdateDescription;
use App\Events\TaskUserAdded;
use App\Events\TaskUserRemoved;
use App\Models\Attachment;
use App\Models\Board;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\TaskList;
use App\Models\User;
use App\Notifications\TaskMove;
use App\Notifications\TaskRemovedNotification;
use App\Notifications\TaskRestoredNotification;
use App\Notifications\TaskUpdateTitle;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Notification;

class TaskController extends Controller
{
    public function getAllArchivedTasks(Request $request)
    {
        $request->validate([
            'boardId' => 'required|exists:boards,id'
        ]);

        $allArchivedTasks = Task::with('list')
            ->whereNotNull('archived_at')
            ->whereHas('list', function ($query) use ($request) {
                $query->where('board_id', $request->boardId);
            })->get();

        return response()->json([
            'allArchivedTasks' => $allArchivedTasks
        ]);
    }

    public function deleteTask(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:tasks,id'
        ]);

        $task = Task::findOrFail($request->id);
        $taskUsers = $task->users;
        $boardId = $task->board->id;
        DB::transaction(function () use ($task, $taskUsers, $boardId) {
            Notification::send(
                $taskUsers,
                new TaskRemovedNotification(
                    $boardId,
                    $task->list_id,
                    $task->id,
                    $task->title,
                    Auth::id()
                )
            );
            $task->users()->detach();
            $task->delete();
        });

        return response()->noContent();
    }

    public function archiveTask(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:tasks,id'
        ]);

        $task = Task::findOrFail($request->id);
        $task->archived_at = Carbon::now();

        $taskUsers = $task->users;
        $boardId = $task->board->id;

        Notification::send(
            $taskUsers,
            new TaskRemovedNotification(
                $boardId,
                $task->list_id,
                $task->id,
                $task->title,
                Auth::id()
            )
        );

        $task->save();

        return response()->noContent();
    }

    public function unArchiveTask(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:tasks,id'
        ]);

        $task = Task::with(['users', 'board'])->findOrFail($request->id);

        DB::transaction(function () use ($task) {
            $task->archived_at = null;
            $task->save();

            $mappedTask = [
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
            ];

            Notification::send(
                $task->users,
                new TaskRestoredNotification(
                    $task->board->id,
                    $task->list_id,
                    $mappedTask,
                    $task->title,
                    Auth::id()
                )
            );
        });

        $task->refresh();

        return response()->json([
            'restoredTask' => [
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
            ]
        ]);
    }

    public function addTask(Request $request)
    {
        $request->validate([
            'boardId' => 'required|exists:boards,id',
            'listId'  => 'required|exists:lists,id',
            'title'   => 'required'
        ]);

        $taskList = TaskList::findOrFail($request->listId);
        $lastTask = $taskList->tasks()->orderBy('position_number', 'desc')->first();
        $position = $lastTask === null ? 1000 : $lastTask->position_number + 1000;
        $generatedId = Str::uuid();

        Task::create([
            'id' => $generatedId,
            'board_id' => $request->boardId,
            'list_id' => $request->listId,
            'title' => $request->title,
            'completed' => false,
            'position_number' => $position
        ]);

        $addedTask = Task::findOrFail($generatedId);

        return response()->json([
            'addedTask' => [
                'id' => $addedTask->id,
                'boardId' => $addedTask->board_id,
                'listId' => $addedTask->list_id,
                'title' => $addedTask->title,
                'description' => $addedTask->description,
                'deadline' => $addedTask->deadline,
                'completed' => $addedTask->completed,
                'attributes' => $addedTask->task_attributes,
                'position_number' => $addedTask->position_number,
                'archived_at' => $addedTask->archived_at,
                'users' => $addedTask->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profilePicture' => $user->profile_data['profilePicture']
                ])
            ]
        ]);
    }

    public function moveTask(Request $request)
    {
        $request->validate([
            'listId' => 'required|exists:lists,id',
            'taskId' => 'required|exists:tasks,id',
            'position_number' => 'required|numeric'
        ]);

        DB::beginTransaction();
        $task = Task::findOrFail($request->taskId);
        $previousListId = $task->list_id;
        try {

            $task->list_id = $request->listId;
            $task->position_number = $request->position_number;
            $task->save();

            DB::commit();

            $listName = TaskList::findOrFail($request->listId)->name;
            $user = Auth::user();
            $users = Board::findOrFail($task->board_id)->users;
            $generatedId = Str::uuid();

            TaskActivity::create([
                'id' => $generatedId,
                'task_id' => $request->taskId,
                'user_details' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'profilePicture' => $user->profile_data['profilePicture'],
                ],
                'activity_details' => [
                    'type' => 'action',
                    'content' => "moved the task to list {$listName}"
                ]
            ]);

            Notification::send(
                $users,
                new TaskMove(
                    $generatedId,
                    $task->id,
                    $previousListId,
                    $request->listId,
                    Auth::id()
                )
            );

            $userIds = $users->pluck('id')->toArray();

            foreach ($userIds as $userId) {
                event(new RefreshNotifications($userId));
            }

            return response()->noContent();
        } catch (\Exception $error) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to move task with error ' . $error->getMessage()
            ], 500);
        }
    }

    public function reIndexTasks(Request $request)
    {
        $request->validate([
            'listId' => 'required|exists:lists,id'
        ]);

        $list = TaskList::findOrFail($request->listId);

        $tasks = $list->tasks()->orderBy('position_number', 'asc')->get();

        try {
            DB::transaction(function () use ($tasks) {
                $gap = 1000;

                foreach ($tasks as $task) {
                    $gap += 1000;

                    $targetTask = Task::findOrFail($task->id);
                    $targetTask->position_number = $gap;
                    $targetTask->save();
                }
            });

            $updatedTasks = $list->tasks()->orderBy('position_number', 'asc')->get();

            $mappedTasks = $updatedTasks->map(fn($task) => [
                'id' => $task->id,
                'boardId' => $task->board_id,
                'listId' => $task->list_id,
                'description' => $task->description,
                'deadline' => $task->deadline,
                'status' => $task->status,
                'archived_at' => $task->archived_at
            ]);

            return response()->json([
                'reIndexedTasks' => $mappedTasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to reindex tasks',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function titleUpdate(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
            'title' => 'required'
        ]);

        $task = Task::findOrFail($request->taskId);
        $previousTitle = $task->title;
        $task->title = $request->title;
        $task->save();
        $user = Auth::user();

        $generatedId = Str::uuid();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "updated the task name into {$request->title}"
            ]
        ]);

        $taskUsers = $task->users;

        Notification::send(
            $taskUsers,
            new TaskUpdateTitle(
                $generatedId,
                $user->id,
                $task->id,
                $task->board_id,
                $request->title,
                $task->list_id,
                $previousTitle
            )
        );

        $userIds = $taskUsers->pluck('id')->toArray();

        foreach ($userIds as $userId) {
            event(new RefreshNotifications($userId));
        }

        return response()->json([
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at
            ]
        ]);
    }

    public function toggleCompletion(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id'
        ]);

        $task = Task::findOrFail($request->taskId);
        $task->completed = !$task->completed;
        $task->save();

        $taskStatus = $task->completed ? 'complete' : 'incomplete';

        $user = Auth::user();

        $generatedId = Str::uuid();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "marked the task as {$taskStatus}"
            ]
        ]);

        $boardId = TaskList::findOrFail($task->list_id)->board_id;

        event(new TaskToggleCompletion(
            $task->list_id,
            $task->id,
            $task->completed,
            $user->id,
            $generatedId,
            $boardId
        ));

        return response()->json([
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at
            ]
        ]);
    }

    public function getUsers(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id'
        ]);

        $task = Task::findOrFail($request->taskId);
        $users = $task->users;

        return response()->json([
            'users' => $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profileImage' => $user->profile_data['profilePicture'],
            ])
        ]);
    }

    public function addUser(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
            'userId' => 'required|exists:users,id'
        ]);

        $task = Task::findOrFail($request->taskId);
        $boardId = TaskList::findOrFail($task->list_id)->board_id;

        $task->users()->syncWithoutDetaching([
            $request->userId
        ]);

        $addedUser = User::findOrFail($request->userId);
        $currentUser = Auth::user();

        $generatedId = Str::uuid();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'profilePicture' => $currentUser->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "{$addedUser->name} is now a member of the task"
            ]
        ]);

        $addedUser->notify(new \App\Notifications\TaskUserAdded(
            $task->title,
            $addedUser->name
        ));

        event(new TaskUserAdded(
            $task->list_id,
            $task->id,
            $boardId,
            $generatedId,
            $addedUser->id,
            $currentUser->id
        ));

        event(new RefreshNotifications($addedUser->id));

        return response()->json([
            'addedUser' => [
                'id' => $addedUser->id,
                'name' => $addedUser->name,
                'email' => $addedUser->email,
                'profilePicture' => $addedUser->profile_data['profilePicture']
            ],
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at
            ]
        ]);
    }

    public function removeUser(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
            'userId' => 'required|exists:users,id'
        ]);

        $task = Task::findOrFail($request->taskId);
        $boardId = TaskList::findOrFail($task->list_id)->board_id;

        $task->users()->detach($request->userId);

        $removedUser = User::findOrFail($request->userId);

        $currentUser = Auth::user();

        $generatedId = Str::uuid();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'profilePicture' => $currentUser->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "{$removedUser->name} has been removed from the task"
            ]
        ]);

        $removedUser->notify(new \App\Notifications\TaskUserRemoved(
            $task->title,
            $removedUser->name
        ));

        event(new TaskUserRemoved(
            $task->list_id,
            $task->id,
            $boardId,
            $request->userId,
            $currentUser->id,
            $generatedId
        ));

        event(new RefreshNotifications($removedUser->id));

        return response()->json([
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at
            ]
        ]);
    }

    public function updateDescription(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
        ]);

        $task = Task::findOrFail($request->taskId);
        $task->description = $request->description;
        $task->save();

        $user = Auth::user();

        $generatedId = Str::uuid();
        $boardId = TaskList::findOrFail($task->list_id)->board_id;

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "updated the task description"
            ]
        ]);

        event(new TaskUpdateDescription(
            $task->list_id,
            $boardId,
            $task->id,
            $user->id,
            $generatedId,
            $request->description
        ));

        return response()->json([
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at
            ]
        ]);
    }

    public function getActivities(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id'
        ]);

        $task = Task::with(['task_activities' => fn($q) =>
        $q->orderByDesc('created_at')])
            ->findOrFail($request->taskId);

        return response()->json([
            'activities' => $task->task_activities->map(
                fn($activity) => [
                    'id' => $activity->id,
                    'taskId' => $activity->task_id,
                    'userDetails' => [
                        'id' => $activity->user_details['id'],
                        'name' => $activity->user_details['name'],
                        'profilePicture' => $activity->user_details['profilePicture']
                    ],
                    'activityDetails' => $activity->activity_details,
                    'created_at' => $activity->created_at
                ]
            )
        ]);
    }

    public function getFiles(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id'
        ]);

        $task = Task::findOrFail($request->taskId);

        $attachments = $task->attachments;

        return response()->json([
            'attachments' => $attachments->map(fn($file) => [
                'id' => $file->id,
                'taskId' => $file->task_id,
                'userId' => $file->user_id,
                'attachment_attributes' => $file->attachment_attributes,
            ])
        ]);
    }

    public function downloadFiles(Request $request)
    {
        $request->validate([
            'fileId' => 'required|exists:attachments,id'
        ]);

        $file = Attachment::findOrFail($request->fileId);

        $path = $file->attachment_attributes['path'];

        return response()->download(Storage::disk('public')->path($path));
    }

    public function uploadFiles(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
            'file' => 'required|file|max:25600',
            Rule::unique('attachments', 'attachment_attributes->name')
                ->where(
                    fn($query) =>
                    $query->where('task_id', $request->taskId)
                )
        ]);

        $user = Auth::user();

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            $path = $file->store('attachments', 'public');

            $uploadedFile = Attachment::create([
                'id' => Str::uuid(),
                'task_id' => $request->taskId,
                'user_id' => $user->id,
                'attachment_attributes' => [
                    'name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                    'uploader_name' => $user->name,
                    'uploader_id' => $user->id
                ],
            ]);

            $user = Auth::user();
            $generatedId =  Str::uuid();

            TaskActivity::create([
                'id' => $generatedId,
                'task_id' => $request->taskId,
                'user_details' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'profilePicture' => $user->profile_data['profilePicture'],
                ],
                'activity_details' => [
                    'type' => 'attachment',
                    'id' => $uploadedFile->id,
                    'attachmentName' => $uploadedFile->attachment_attributes['name'],
                    'url' => $uploadedFile->attachment_attributes['path'],
                ]
            ]);

            $activity = TaskActivity::findOrFail($generatedId);

            $activityToBeSentAsResponse = [
                'url' => Storage::url($path),
                'uploadedFile' => [
                    'id' => $uploadedFile->id,
                    'taskId' => $uploadedFile->task_id,
                    'userId' => $uploadedFile->user_id,
                    'attachment_attributes' => $uploadedFile->attachment_attributes,
                ],
                'activity' => [
                    'id' => $activity->id,
                    'taskId' => $activity->task_id,
                    'userDetails' => [
                        'id' => $activity->user_details['id'],
                        'name' => $activity->user_details['name'],
                        'profilePicture' => $activity->user_details['profilePicture']
                    ],
                    'activityDetails' => $activity->activity_details,
                    'created_at' => $activity->created_at
                ]
            ];

            event(new TaskAddAttachment(
                $user->id,
                $request->taskId,
                $activityToBeSentAsResponse['activity']
            ));

            return response()->json($activityToBeSentAsResponse);
        }
        return response('No file uploaded', 400);
    }

    public function deleteFiles(Request $request)
    {
        $request->validate([
            'fileId' => 'exists:attachments,id'
        ]);

        $file = Attachment::findOrFail($request->fileId);
        Storage::disk('public')->delete($file->attachment_attributes['path']);
        $file->delete();

        $uploadedFileActivity = TaskActivity::whereJsonContains(
            'activity_details->id',
            $request->fileId
        )->first();

        $user = Auth::user();

        $generateId = Str::uuid();

        TaskActivity::create([
            'id' => $generateId,
            'task_id' => $uploadedFileActivity->task_id,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "deleted the file {$uploadedFileActivity->activity_details['attachmentName']}"
            ]
        ]);

        $activity = TaskActivity::findOrFail($generateId);

        $activityToBeSentAsResponse = [
            'id' => $activity->id,
            'taskId' => $activity->task_id,
            'userDetails' => [
                'id' => $activity->user_details['id'],
                'name' => $activity->user_details['name'],
                'profilePicture' => $activity->user_details['profilePicture']
            ],
            'activityDetails' => $activity->activity_details,
            'created_at' => $activity->created_at
        ];

        event(new TaskDeleteAttachment(
            $uploadedFileActivity->activity_details['id'],
            $uploadedFileActivity->task_id,
            $user->id,
            $activityToBeSentAsResponse
        ));

        $uploadedFileActivity->delete();

        return response()->json([
            'activity' => $activityToBeSentAsResponse
        ]);
    }

    public function addComment(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
            'comment' => 'required'
        ]);

        $user = Auth::user();
        $generatedId = Str::uuid();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'comment',
                'content' => $request->comment,
            ]
        ]);

        event(new TaskAddComment(
            $request->taskId,
            $user->id,
            $generatedId
        ));

        return response()->json([
            'newComment' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at->format('F j, Y g:i A')
            ]
        ]);
    }

    public function editComment(Request $request)
    {
        $request->validate([
            'commentId' => 'required|exists:task_activities,id',
            'comment' => 'required'
        ]);

        $comment = TaskActivity::findOrFail($request->commentId);
        $comment->activity_details = [
            ...$comment->activity_details,
            'content' => $request->comment
        ];
        $comment->save();

        $user = Auth::user();

        event(new TaskEditComment(
            $user->id,
            $request->commentId,
            $request->comment,
            $comment->task_id
        ));

        return response()->noContent();
    }

    public function deleteComment(Request $request)
    {
        $request->validate([
            'commentId' => 'required|exists:task_activities,id'
        ]);

        $comment = TaskActivity::findOrFail($request->commentId);
        $comment->delete();

        $user = Auth::user();

        event(new TaskDeleteComment(
            $user->id,
            $request->commentId,
            $comment->task_id
        ));

        return response()->noContent();
    }

    public function setDueDate(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
            'date' => 'required|date'
        ]);

        $task = Task::findOrFail($request->taskId);
        $boardId = TaskList::findOrFail($task->list_id)->board_id;

        $task->deadline = $request->date;
        $task->save();

        $user = Auth::user();
        $generatedId = Str::uuid();
        $localeDate = Carbon::parse($request->date)
            ->setTimezone('Asia/Manila')
            ->toDayDateTimeString();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "Set the deadline of the task to {$localeDate}",
            ]
        ]);

        event(new TaskUpdateDeadline(
            $task->list_id,
            $task->id,
            $boardId,
            $generatedId,
            $user->id,
            $request->date
        ));

        return response()->json([
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at->format('F j, Y g:i A')
            ]
        ]);
    }

    public function removeDueDate(Request $request)
    {
        $request->validate([
            'taskId' => 'required|exists:tasks,id',
        ]);

        $task = Task::findOrFail($request->taskId);
        $task->deadline = null;
        $task->save();
        $boardId = TaskList::findOrFail($task->list_id)->board_id;
        $user = Auth::user();
        $generatedId = Str::uuid();

        $activity = TaskActivity::create([
            'id' => $generatedId,
            'task_id' => $request->taskId,
            'user_details' => [
                'id' => $user->id,
                'name' => $user->name,
                'profilePicture' => $user->profile_data['profilePicture'],
            ],
            'activity_details' => [
                'type' => 'action',
                'content' => "Removed the deadline for the task",
            ]
        ]);

        event(new TaskRemoveDeadline(
            $task->list_id,
            $task->id,
            $boardId,
            $generatedId,
            $user->id
        ));

        return response()->json([
            'activity' => [
                'id' => $activity->id,
                'taskId' => $activity->task_id,
                'userDetails' => [
                    'id' => $activity->user_details['id'],
                    'name' => $activity->user_details['name'],
                    'profilePicture' => $activity->user_details['profilePicture']
                ],
                'activityDetails' => $activity->activity_details,
                'created_at' => $activity->created_at->format('F j, Y g:i A')
            ]
        ]);
    }
}
