<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;


class UpdatedWorkspace extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $workspaceName;
    public $updatedWorkspaceName;
    public $workspaceId;
    public $ownerName;
    public function __construct($workspaceName, $updatedWorkspaceName, $workspaceId, $ownerName)
    {
        $this->workspaceName = $workspaceName;
        $this->updatedWorkspaceName = $updatedWorkspaceName;
        $this->workspaceId = $workspaceId;
        $this->ownerName = $ownerName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function broadcastOn()
    {
        return new PrivateChannel("workspace.{$this->workspaceId}");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'workspaceName' => "{$this->workspaceName} ({$this->ownerName})",
            'updatedWorkspaceName' => "{$this->updatedWorkspaceName} ({$this->ownerName})",
            'type' => 'workspace_updated'
        ];
    }
}
