<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeleteAttachment implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $fileId;
    public $taskId;
    public $senderId;
    public $activityToBeSentAsResponse;
    public function __construct($fileId, $taskId, $senderId, $activity)
    {
        $this->fileId = $fileId;
        $this->taskId = $taskId;
        $this->senderId = $senderId;
        $this->activityToBeSentAsResponse = $activity;
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
        return "task.delete.file";
    }

    public function broadcastWith(){
        return [
            'fileId' => $this->fileId,
            'activity' => $this->activityToBeSentAsResponse,
            'senderId' => $this->senderId
        ];
    }
}
