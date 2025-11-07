<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BoardRemoveUser extends Notification
{
    use Queueable;

    public $userId;
    public $userName;
    public $boardId;
    public $boardName;
    public $workspaceId;
    public $hasAccess;
    public $senderId;
    public function __construct($userId, $userName, $boardId, $boardName, $workspaceId, $hasAccess, $senderId)
    {
        $this->userId = $userId;
        $this->userName = $userName;
        $this->boardId = $boardId;
        $this->boardName = $boardName;
        $this->workspaceId = $workspaceId;
        $this->hasAccess = $hasAccess;
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
            new PrivateChannel("App.Models.User.{$this->userId}"),
            new PrivateChannel("board.{$this->boardId}")
        ];
    }

    public function broadcastWith()
    {
        return [
            'boardId' => $this->boardId,
            'userId' => $this->userId,
            'workspaceId' => $this->workspaceId,
            'hasAccess' => $this->hasAccess,
            'senderId' => $this->senderId
        ];
    }

    public function broadcastAs()
    {
        return "board.user.remove";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'board_user_remove',
            'boardName' => $this->boardName,
            'userName' => $this->userName,
        ];
    }
}
