<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivationNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $url;
    public function __construct($url)
    {
        //
        $this->url = $url;

    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Reactivate Your Account')
                    ->greeting('Hello!')
                    ->line('We have received your request to reactivate your account.')
                    ->action('Reactivate Account', $this->url)
                    ->line('This reactivation link will expire in 60 minutes.')
                    ->line('If you did not request to have your account reactivated then you may ignore this email');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
