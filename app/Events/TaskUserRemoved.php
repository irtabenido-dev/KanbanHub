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

class TaskUserRemoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $listId;
    public $taskId;
    public $boardId;
    public $removedUserId;
    public $senderId;
    public $activity;

    public function __construct($listId, $taskId, $boardId, $removedUserId, $senderId, $activityId)
    {
        $this->listId = $listId;
        $this->taskId = $taskId;
        $this->boardId = $boardId;
        $this->removedUserId = $removedUserId;
        $this->senderId = $senderId;
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
            new PrivateChannel("task.{$this->taskId}"),
            new PrivateChannel("board.{$this->boardId}"),
        ];
    }

    public function broadcastAs(){
        return "task.user.remove";
    }

    public function broadcastWith(){
        return [
            'taskId' => $this->taskId,
            'listId' => $this->listId,
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
            'removedUserId' => $this->removedUserId
        ];
    }
}
