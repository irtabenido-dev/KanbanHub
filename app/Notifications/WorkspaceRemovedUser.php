<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class WorkspaceRemovedUser extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $targetUserId;
    public $workspaceId;
    public $workspaceName;
    public $senderId;
    public function __construct($targetUserId, $workspaceId, $workspaceName, $senderId)
    {
        $this->targetUserId = $targetUserId;
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

    /**
     * Get the mail representation of the notification.
     */
    public function broadcastOn()
    {
        return [
            new PrivateChannel("App.Models.User.{$this->targetUserId}"),
        ];
    }

    public function broadcastAs()
    {
        return "workspace.user.remove";
    }

    public function broadcastWith()
    {
        return [
            'workspaceId' => $this->workspaceId,
            'senderId' => $this->senderId,
            'targetUserId' => $this->targetUserId
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
            'type' => 'workspace_remove_user',
            'workspaceName' => $this->workspaceName
        ];
    }
}
