<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WorkspaceRoleUpdate extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $senderId;
    public $senderName;
    public $workspaceId;
    public $workspaceName;
    public $updatedUserId;
    public $updatedRole;
    public $previousOwnerId;
    public $targetName;
    public function __construct(
        $senderId,
        $senderName,
        $workspaceId,
        $workspaceName,
        $updatedUserId,
        $updatedRole,
        $previousOwnerId,
        $targetName
    ) {
        $this->senderId = $senderId;
        $this->senderName = $senderName;
        $this->workspaceId = $workspaceId;
        $this->workspaceName = $workspaceName;
        $this->updatedUserId = $updatedUserId;
        $this->updatedRole = $updatedRole;
        $this->previousOwnerId = $previousOwnerId;
        $this->targetName = $targetName;
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
            new PrivateChannel("App.Models.User.{$this->updatedUserId}"),
        ];
    }

    public function broadcastAs()
    {
        return "workspace.user.role.update";
    }

    public function broadcastWith()
    {
        return [
            'updatedRole' => $this->updatedRole,
            'workspaceName' => $this->workspaceName,
            'targetName' => $this->targetName,
            'previousOwnerId' => $this->previousOwnerId,
            'workspaceId' => $this->workspaceId,
            'updatedUserId' => $this->updatedUserId,
            'senderId' => $this->senderId,
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
            'type' => 'workspace_user_role_update',
            'updatedRole' => $this->updatedRole,
            'workspaceName' => $this->workspaceName,
            'senderName' => $this->senderName,
        ];
    }
}
