<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskAddAttachment implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $senderId;
    public $taskId;
    public $activityToBeSentAsResponse;
    public function __construct($senderId, $taskId, $activityToBeSentAsResponse)
    {
        $this->senderId = $senderId;
        $this->taskId = $taskId;
        $this->activityToBeSentAsResponse = $activityToBeSentAsResponse;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("task.{$this->taskId}"),
        ];
    }

    public function broadcastAs(){
        return "task.add.file";
    }

    public function broadcastWith(){
        return [
            'senderId' => $this->senderId,
            'activity' => $this->activityToBeSentAsResponse
        ];
    }
}
