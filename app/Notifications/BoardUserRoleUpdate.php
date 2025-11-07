<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BoardUserRoleUpdate extends Notification
{
    use Queueable;

    public $userId;
    public $newRole;
    public $boardId;
    public $boardName;
    public $senderId;
    public function __construct($userId, $newRole, $boardId, $boardName, $senderId)
    {
        $this->userId = $userId;
        $this->newRole = $newRole;
        $this->boardId = $boardId;
        $this->boardName = $boardName;
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

    public function broadcastOn(){
        return [
            new PrivateChannel("board.{$this->boardId}"),
        ];
    }

    public function broadcastAs(){
        return "board.user.update";
    }

    public function broadcastWith(){
        return [
            'userId' => $this->userId,
            'newRole' => $this->newRole
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'board_user_update',
            'newRole' => $this->newRole,
            'boardName' => $this->boardName,
            'senderId' => $this->senderId
        ];
    }
}
