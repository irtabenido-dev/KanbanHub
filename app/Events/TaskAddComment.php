<?php

namespace App\Events;

use App\Models\TaskActivity;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskAddComment implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $taskId;
    public $senderId;
    public $activity;
    public function __construct($taskId, $userId, $activityId)
    {
        $this->taskId = $taskId;
        $this->senderId = $userId;
        $this->activity = TaskActivity::findOrFail($activityId);
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

    public function broadcastAs(){
        return "task.add.comment";
    }

    public function broadcastWith(){
        return [
            'senderId' => $this->senderId,
            'activity' => [
                'id' => $this->activity->id,
                'taskId' => $this->activity->task_id,
                'userDetails' => [
                    'id' => $this->activity->user_details['id'],
                    'name' => $this->activity->user_details['name'],
                    'profilePicture' => $this->activity->user_details['profilePicture']
                ],
                'activityDetails' => $this->activity->activity_details,
                'created_at' => $this->activity->created_at
            ]
        ];
    }
}
