<?php

namespace App\Notifications;

use App\Models\TaskActivity;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskUpdateTitle extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $activity;
    public $senderId;
    public $taskId;
    public $boardId;
    public $listId;
    public $updatedTitle;
    public $previousTitle;
    public function __construct($activityId, $senderId, $taskId, $boardId, $updatedTitle, $listId, $previousTitle)
    {
        $this->activity = TaskActivity::findOrFail($activityId);
        $this->senderId = $senderId;
        $this->taskId = $taskId;
        $this->boardId = $boardId;
        $this->updatedTitle = $updatedTitle;
        $this->listId = $listId;
        $this->previousTitle = $previousTitle;
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

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("task.{$this->taskId}"),
            new PrivateChannel("board.{$this->boardId}")
        ];
    }

    public function broadcastAs()
    {
        return "task.update.title";
    }

    public function broadcastWith()
    {
        return [
            'activity' => $this->activity,
            'senderId' => $this->senderId,
            'updatedTitle' => $this->updatedTitle,
            'previousTitle' => $this->previousTitle,
            'taskId' => $this->taskId,
            'listId' => $this->listId
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
            'updatedTitle' => $this->updatedTitle,
            'previousTitle' => $this->previousTitle,
            'type' => 'task_title_update'
        ];
    }
}
