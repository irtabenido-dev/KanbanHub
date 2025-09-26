<?php

namespace Database\Factories;

use App\Models\Board;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TaskList>
 */
class TaskListFactory extends Factory
{

    public function definition(): array
    {
        return [
            'board_id' => Board::factory()->create(),
            'name' => fake()->unique()->words(1, true),
            'archived_at' => null,
            'position_number' => 0
        ];
    }

    public function forBoard($board)
    {
        return $this->state(fn() => [
            'board_id' => $board->id
        ]);
    }
}
