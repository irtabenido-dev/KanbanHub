<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskEditComment implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $senderId;
    public $comment;
    public $taskId;
    public $commentId;

    public function __construct($userId, $commentId, $comment, $taskId)
    {
        $this->senderId = $userId;
        $this->commentId = $commentId;
        $this->comment = $comment;
        $this->taskId = $taskId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("task.{$this->taskId}")
        ];
    }

    public function broadcastAs()
    {
        return "task.edit.comment";
    }

    public function broadcastWith()
    {
        return [
            'senderId' => $this->senderId,
            'commentId' => $this->commentId,
            'updatedComment' => $this->comment
        ];
    }
}
