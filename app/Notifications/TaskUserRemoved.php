<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskUserRemoved extends Notification
{
    use Queueable;
    public $taskName;
    public $removedUserName;
    public function __construct($taskName, $removedUserName)
    {
        $this->removedUserName = $removedUserName;
        $this->taskName = $taskName;
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

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'removedUserName' => $this->removedUserName,
            'taskName' => $this->taskName,
            'type' => 'task_user_remove'
        ];
    }
}
