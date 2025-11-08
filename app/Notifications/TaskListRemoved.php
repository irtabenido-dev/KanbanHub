<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class TaskListRemoved extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $senderId;
    public $listId;
    public $boardId;
    public $boardName;
    public $listName;
    public function __construct($senderId, $boardId, $listId, $boardName, $listName)
    {
        $this->senderId = $senderId;
        $this->boardId = $boardId;
        $this->listId = $listId;
        $this->boardName = $boardName;
        $this->listName = $listName;
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
            new PrivateChannel("board.{$this->boardId}")
        ];
    }

    public function broadcastAs()
    {
        return 'list.remove';
    }

    public function broadcastWith()
    {
        return [
            'senderId' => $this->senderId,
            'boardId' => $this->boardId,
            'listId' => $this->listId,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'list_removed',
            'boardName' => $this->boardName,
            'listName' => $this->listName
        ];
    }
}
