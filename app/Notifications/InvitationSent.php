<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationSent extends Notification implements ShouldQueue
{
    use Queueable;

    public $invitationData;
    public $invited_name;
    public $inviter_name;
    public $workspace_name;
    public $workspace_id;
    public $invited_id;


    /**
     * Create a new notification instance.
     */
    public function __construct($invitation_data)
    {
        $this->invitationData = $invitation_data;
        $this->workspace_id = $invitation_data['workspace_id'];
        $this->invited_name = User::findOrFail($this->invitationData['invited_id'])->name;
        $this->invited_id = $this->invitationData['invited_id'];
        $this->inviter_name = User::findOrFail($this->invitationData['inviter_id'])->name;
        $this->workspace_name = Workspace::findOrFail($this->invitationData['workspace_id'])->name;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {

        return ['mail', 'database',  'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {

        return (new MailMessage)
        ->subject("You've been invited to a workspace!")
        ->greeting("Hello {$this->invited_name}!")
        ->line("You have been invited to join the {$this->workspace_name} workspace.")
        ->action("Click this link to accept the invitation", $this->invitationData['invitation_link'])
        ->salutation("Best regards from {$this->inviter_name} and the {$this->workspace_name} team!");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id' => $this->invitationData['id'],
            'type' => 'workspace_invitation',
            'workspace_id' => $this->invitationData['workspace_id'],
            'workspace_name' => $this->workspace_name,
            'invitation_code' => $this->invitationData['invitation_code'],
            'inviter_name' => $this->inviter_name,
            'invited_name' => $this->invited_name,
            'invitation_link' => $this->invitationData['invitation_link']
        ];
    }

    public function broadcastOn(){

        return new PrivateChannel("invite.{$this->invited_id}");
    }

    public function broadcastAs(){
        return 'invitation';
    }

    public function toBroadcast($notifiable){
        return new BroadcastMessage([
            'id' => $this->invitationData['id'],
            'type' => 'workspace_invitation',
            'workspace_id' => $this->workspace_id,
            'workspace_name' => $this->workspace_name,
            'invitation_link' => $this->invitationData['invitation_link'],
            'inviter_name' => $this->inviter_name,
            'invited_name' => $this->invited_name
         ]);
    }

}
