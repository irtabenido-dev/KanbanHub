<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Workspace>
 */
class WorkspaceFactory extends Factory
{

    public function forUser($user)
    {
        return $this->state(fn() => [
            'owner_id' => $user->id
        ]);
    }

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'owner_id' => User::factory(),
            'id' => Str::uuid()
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($workspace) {
            if ($workspace->owner_id) {
                $workspace->users()->syncWithoutDetaching([
                    $workspace->owner_id => ['role' => 'owner']
                ]);
            }
        });
    }
}
