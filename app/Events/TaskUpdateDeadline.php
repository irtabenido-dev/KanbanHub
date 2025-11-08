<?php

namespace App\Events;

use App\Models\TaskActivity;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdateDeadline implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $listId;
    public $taskId;
    public $boardId;
    public $activity;
    public $senderId;
    public $date;
    public function __construct($listId, $taskId, $boardId, $activityId, $senderId, $date)
    {
        $this->listId = $listId;
        $this->taskId = $taskId;
        $this->boardId = $boardId;
        $this->activity = TaskActivity::findOrFail($activityId);
        $this->senderId = $senderId;
        $this->date = $date;
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
        return "task.deadline.update";
    }

    public function broadcastWith()
    {
        return [
            'listId' => $this->listId,
            'taskId' => $this->taskId,
            'boardId' => $this->boardId,
            'senderId' => $this->senderId,
            'date' => $this->date,
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
