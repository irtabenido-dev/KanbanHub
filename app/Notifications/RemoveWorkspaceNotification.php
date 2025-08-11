<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class RemoveWorkspaceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */

    public $workspaceName;
    public $workspaceId;
    public $ownerName;
    public function __construct($workspaceName, $workspaceId, $ownerName)
    {
        $this->workspaceName = $workspaceName;
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

    public function broadcastAs()
    {
        return 'removeWorkspace';
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
            'type' => 'workspace_removed'
        ];
    }
}
