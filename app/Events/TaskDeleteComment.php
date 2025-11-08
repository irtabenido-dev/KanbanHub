<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeleteComment implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $senderId;
    public $commentId;
    public $taskId;
    public function __construct($userId, $commentId, $taskId)
    {
        $this->senderId = $userId;
        $this->commentId = $commentId;
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
            new PrivateChannel("task.{$this->taskId}"),
        ];
    }

    public function broadcastAs(){
        return "task.delete.comment";
    }

    public function broadcastWith(){
        return [
            'senderId' => $this->senderId,
            'commentId' => $this->commentId
        ];
    }
}
