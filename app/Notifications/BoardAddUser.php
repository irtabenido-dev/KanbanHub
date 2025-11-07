<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BoardAddUser extends Notification
{
    use Queueable;

    public $userName;
    public $boardId;
    public $boardName;
    public $workspaceId;
    public $addedUser;
    public $hasAccess;
    public $senderId;
    public function __construct($boardId, $boardName, $workspaceId, $hasAccess, $addedUser, $senderId)
    {
        $this->boardId = $boardId;
        $this->boardName = $boardName;
        $this->workspaceId = $workspaceId;
        $this->hasAccess = $hasAccess;
        $this->addedUser = $addedUser;
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
            new PrivateChannel("App.Models.User.{$this->addedUser['id']}"),
            new PrivateChannel("board.{$this->boardId}")
        ];
    }

    public function broadcastWith(){
        return [
            'boardId' => $this->boardId,
            'addedUser' => $this->addedUser,
            'workspaceId' => $this->workspaceId,
            'hasAccess' => $this->hasAccess,
            'senderId' => $this->senderId
        ];
    }

    public function broadcastAs(){
        return "board.user.add";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'board_user_add',
            'boardName' => $this->boardName,
            'userName' => $this->addedUser['name'],
        ];
    }
}
