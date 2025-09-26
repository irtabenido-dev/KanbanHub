<?php

namespace App\Events;

use App\Models\TaskActivity;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskRemoveDeadline implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $listId;
    public $taskId;
    public $boardId;
    public $activity;
    public $senderId;

    public function __construct($listId, $taskId, $boardId, $activityId, $senderId)
    {
        $this->listId = $listId;
        $this->taskId = $taskId;
        $this->boardId = $boardId;
        $this->activity = TaskActivity::findOrFail($activityId);
        $this->senderId = $senderId;
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
            new PrivateChannel("board.{$this->boardId}"),
        ];
    }

    public function broadcastAs()
    {
        return "task.deadline.remove";
    }

    public function broadcastWith()
    {
        return [
            'listId' => $this->listId,
            'taskId' => $this->taskId,
            'boardId' => $this->boardId,
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
