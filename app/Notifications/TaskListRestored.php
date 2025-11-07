<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskListRestored extends Notification
{
    use Queueable;

    public $list;
    public $senderId;
    public $boardName;
    public function __construct($list, $senderId, $boardName)
    {
        $this->list = $list;
        $this->senderId = $senderId;
        $this->boardName = $boardName;
    }

    public function via(object $notifiable): array
    {
        return ['broadcast'];
    }

    public function broadcastOn(){
        return new PrivateChannel("board.{$this->list['boardId']}");
    }

    public function broadcastAs(){
        return 'list.restored';
    }

    public function broadcastWith(){
        return [
            'senderId' => $this->senderId,
            'list' => $this->list
        ];
    }
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'list_restored',
            'listName' => $this->list['name'],
            'boardName' => $this->boardName
        ];
    }
}
