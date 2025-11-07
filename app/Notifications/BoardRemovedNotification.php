<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BoardRemovedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $senderId;
    public $board;
    public function __construct($senderId, $board)
    {
        $this->senderId = $senderId;
        $this->board = $board;
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
            new PrivateChannel("workspace.{$this->board['workspace_id']}"),
            new PrivateChannel("board.{$this->board['id']}")
        ];
    }

    public function broadcastAs()
    {
        return 'board.removed';
    }

    public function broadcastWith(){
        return [
            'senderId' => $this->senderId,
            'workspaceId' => $this->board['workspace_id'],
            'boardId' => $this->board['id']
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
            'type' => 'board_removed'
        ];
    }
}
