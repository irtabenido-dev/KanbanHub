<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Board>
 */

class BoardFactory extends Factory
{

    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'workspace_id' => Workspace::factory()->create(),
            'name' => fake()->unique()->words(1, true),
            'private' => 0,
            'owner_id' => User::factory()
        ];
    }

    public function forWorkspace($workspace) {
        return $this->state(fn () => [
            'workspace_id' => $workspace->id,
        ]);
    }

    public function forUser($user){
        return $this->state(fn () => [
            'owner_id' => $user->id
        ]);
    }
    public function configure(){
        return $this->afterCreating(fn ($board) =>
            $board->users()->syncWithoutDetaching([
                $board->owner_id => ['role' => 'owner']
            ])
    );
    }

}
