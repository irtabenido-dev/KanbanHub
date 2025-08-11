<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TaskRemovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $boardId;
    public $taskId;
    public $taskName;
    public $senderId;
    public $listId;
    public function __construct($boardId, $listId, $taskId, $taskName, $senderId)
    {
        $this->boardId = $boardId;
        $this->listId = $listId;
        $this->taskId = $taskId;
        $this->taskName = $taskName;
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
        return new PrivateChannel("board.{$this->boardId}");
    }

    public function broadcastAs()
    {
        return 'task.remove';
    }

    public function broadcastWith(){
        return [
            'taskId' => $this->taskId,
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
            'type' => 'task_removed'
        ];
    }
}
