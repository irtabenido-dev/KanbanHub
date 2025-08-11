<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskUserAdded extends Notification implements ShouldQueue
{
    use Queueable;

    public $taskName;
    public $addedUserName;
    public function __construct($taskName, $addedUserName)
    {
        $this->addedUserName = $addedUserName;
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
            'addedUserName' => $this->addedUserName,
            'taskName' => $this->taskName,
            'type' => 'task_user_add'
        ];
    }
}
