<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BoardRestoredNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */

    public $board;
    public $workspaceId;
    public $workspaceName;
    public $senderId;
    public function __construct($board, $workspaceId, $workspaceName, $senderId)
    {
        $this->board = $board;
        $this->workspaceId = $workspaceId;
        $this->workspaceName = $workspaceName;
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
        return new PrivateChannel("workspace.{$this->workspaceId}");
    }

    public function broadcastAs()
    {
        return 'board.restored';
    }

    public function broadcastWith(){
        return [
            'restoredBoard' => $this->board,
            'senderId' => $this->senderId,
            'workspaceId' => $this->workspaceId
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
            'boardName' => $this->board['name'],
            'workspaceName' => $this->workspaceName,
            'type' => 'board_restored'
        ];
    }
}
