<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\TaskList;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskMove extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $activity;
    public $task;
    public $list;
    public $previousListId;
    public $currentListId;
    public $senderId;

    public function __construct($activityId, $taskId, $previousListId, $currentListId, $senderId)
    {
        $this->activity = TaskActivity::findOrFail($activityId);
        $task = Task::with('users')->findOrFail($taskId);
        $orderedTaskUsers = $task->users->sortBy('created_at')->values();
        $this->task = [
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
            'users' => $orderedTaskUsers->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profilePicture' => $user->profile_data['profilePicture'] ?? null
            ])
        ];
        $this->list = TaskList::findOrFail($this->task['listId']);
        $this->previousListId = $previousListId;
        $this->currentListId = $currentListId;
        $this->senderId = $senderId;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel("board.{$this->list->board_id}"),
            new PrivateChannel("task.{$this->task['id']}")
        ];
    }

    public function broadcastAs()
    {
        return 'task.move';
    }

    public function broadcastWith()
    {
        return [
            'task' => $this->task,
            'previousListId' => $this->previousListId,
            'currentListId' => $this->currentListId,
            'activity' => $this->activity,
            'senderId' => $this->senderId
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'taskName' => $this->task['title'],
            'listName' => $this->list->name,
            'type' => 'task_move'
        ];
    }
}
