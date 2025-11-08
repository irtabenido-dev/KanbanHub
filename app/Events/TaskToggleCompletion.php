<?php

namespace App\Events;

use App\Models\TaskActivity;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskToggleCompletion implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $listId;
    public $taskId;
    public $completed;
    public $senderId;
    public $boardId;
    public $activity;
    public function __construct($listId, $taskId, $completed, $userId, $activityId, $boardId)
    {
        $this->listId = $listId;
        $this->taskId = $taskId;
        $this->completed = $completed;
        $this->senderId = $userId;
        $this->activity = TaskActivity::findOrFail($activityId);
        $this->boardId = $boardId;
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
        return "task.update.completed";
    }

    public function broadcastWith()
    {
        return [
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
            ],
            'senderId' => $this->senderId,
            'listId' => $this->listId,
            'taskId' => $this->taskId,
            'completed' => $this->completed,
            'boardId' => $this->boardId
        ];
    }
}
