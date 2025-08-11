<?php

namespace App\Events;

use App\Models\TaskActivities;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdateDescription implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $listId;
    public $boardId;
    public $taskId;
    public $userId;
    public $activity;
    public $updatedDescription;
    public function __construct($listId, $boardId, $taskId, $userId, $activityId, $updatedDescription)
    {
        $this->listId = $listId;
        $this->boardId = $boardId;
        $this->taskId = $taskId;
        $this->userId = $userId;
        $this->activity = TaskActivities::findOrFail($activityId);
        $this->updatedDescription = $updatedDescription;
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
            new PrivateChannel("board.{$this->boardId}")
        ];
    }

    public function broadcastAs()
    {
        return "task.update.description";
    }

    public function broadcastWith()
    {
        return [
            'listId' => $this->listId,
            'taskId' => $this->taskId,
            'boardId' => $this->boardId,
            'senderId' => $this->userId,
            'updatedDescription' => $this->updatedDescription,
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
