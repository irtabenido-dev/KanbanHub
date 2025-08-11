<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RestoredWorkspaceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */

    public $workspaceName;
    public $userId;
    public $ownerName;
    public function __construct($workspaceName, $userId, $ownerName)
    {
        $this->workspaceName = $workspaceName;
        $this->userId = $userId;
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
        return new PrivateChannel("App.Models.User.{$this->userId}");
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
            'type' => 'workspace_restored'
        ];
    }
}
