<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TaskListUpdate extends Notification implements ShouldQueue
{
    use Queueable;
    public $boardId;
    public $listId;
    public $updatedListName;
    public $boardName;
    public $senderId;
    public $previousListName;
    public function __construct($boardId, $listId, $updatedListName, $previousListName, $boardName,$senderId)
    {
        $this->boardId = $boardId;
        $this->listId = $listId;
        $this->updatedListName = $updatedListName;
        $this->previousListName = $previousListName;
        $this->boardName = $boardName;
        $this->senderId = $senderId;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'broadcast'];
    }

    public function broadcastOn()
    {
        return new PrivateChannel("board.{$this->boardId}");
    }

    public function broadcastAs()
    {
        return 'list.update';
    }

    public function broadcastWith()
    {
        return [
            'senderId' => $this->senderId,
            'updatedListName' => $this->updatedListName,
            'listId' => $this->listId
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'list_updated',
            'updatedListName' => $this->updatedListName,
            'boardName' => $this->boardName,
            'previousListName' => $this->previousListName
        ];
    }
}
