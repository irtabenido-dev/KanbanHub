<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskRestoredNotification extends Notification
{
    use Queueable;

    public $boardId;
    public $listId;
    public $task;
    public $taskName;
    public $senderId;

    public function __construct($boardId, $listId, $task, $taskName, $senderId)
    {
        $this->boardId = $boardId;
        $this->listId = $listId;
        $this->task = $task;
        $this->taskName = $taskName;
        $this->senderId = $senderId;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function broadcastOn()
    {
        return new PrivateChannel("board.{$this->boardId}");
    }

    public function broadcastAs()
    {
        return 'task.restored';
    }

    public function broadcastWith(){
        return [
            'task' => $this->task,
            'listId' => $this->listId,
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
            'taskName' => $this->taskName,
            'type' => 'task_restored'
        ];
    }
}
