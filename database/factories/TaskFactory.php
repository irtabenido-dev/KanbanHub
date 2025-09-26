<?php

namespace Database\Factories;

use App\Models\Board;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    public $user;
    public $board;
    public $list;
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'title' => fake()->title(),
            'completed' => false,
            'position_number' => 0
        ];
    }

    public function withRelations(User $user = null)
    {
        $user ??= User::factory()->create();

        return $this->afterMaking(function ($task) use($user) {
            if (!$task->board_id || !$task->list_id) {

                $board = Board::factory()->for($user, 'owner')->create();
                $list = TaskList::factory()->for($board, 'board')->create();

                $task->setRelation('tempUser', $user);
                $task->board_id = $board->id;
                $task->list_id = $list->id;
            };
        })->afterCreating(function ($task) {
            $user = $task->getRelation('tempUser');
            $task->users()->syncWithoutDetaching($user);
        });
    }
}
