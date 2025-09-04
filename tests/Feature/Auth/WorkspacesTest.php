<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Str;
use Tests\TestCase;

class WorkspacesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_user_cannot_render_workspaces()
    {

        $response = $this->get('/workspaces');

        $response->assertStatus(302);

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_render_workspaces()
    {

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/workspaces');

        $response->assertStatus(200);

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Workspaces')
                ->where('auth.user.id', $user->id)
                ->etc()
        );
    }

    public function test_empty_name_when_creating_workspace()
    {
        $user = User::factory()->create();

        $workspaceData = [
            'name' => ''
        ];

        $response = $this->actingAs($user)
            ->postJson(route('workspace.store'), $workspaceData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_can_create_workspace()
    {
        $user = User::factory()->create();

        $workspaceData = [
            'name' => 'test'
        ];

        $response = $this->actingAs($user)
            ->post(route('workspace.store'), $workspaceData);

        $response->assertStatus(201);

        $response->assertJsonStructure([
            'workspace'
        ]);
    }

    public function test_can_delete_workspace()
    {
        $user = User::factory()->create();
        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => 'test',
            'owner_id' => $user->id
        ]);

        $workspace->users()->attach($user->id, ['role' => 'owner']);

        $response = $this->actingAs($user)
            ->delete(route('workspace.destroy', $workspace->id), [
                'id' => $workspace->id,
                'userId' => $user->id
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('workspaces', [
            'id' => $workspace->id
        ]);
    }

    public function test_user_cannot_delete_workspace_they_do_not_own()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => 'test',
            'owner_id' => $owner->id
        ]);

        $response = $this->actingAs($otherUser)
            ->delete(route('workspace.destroy', $workspace->id), [
                'id' => $workspace->id,
                'userId' => $otherUser->id
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id
        ]);
    }

    public function test_can_edit_workspace()
    {
        $user = User::factory()->create();
        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => 'test',
            'owner_id' => $user->id
        ]);

        $workspace->users()->attach($user->id, ['role' => 'owner']);

        $updateData = [
            'id' => $workspace->id,
            'name' => 'editedTestName'
        ];

        $response = $this->actingAs($user)
            ->patch(
                route('workspace.update', $workspace->id),
                $updateData
            );

        $response->assertStatus(204);

        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
            'name' => 'editedTestName'
        ]);
    }

    public function test_cannot_edit_workspace_user_does_not_own()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => 'test',
            'owner_id' => $user->id
        ]);

        $updateData = [
            'id' => $workspace->id,
            'name' => 'editedTestName'
        ];

        $workspace->users()->attach($user->id, ['role' => 'owner']);
        $workspace->users()->attach($otherUser->id, ['role' => 'admin']);

        $response = $this->actingAs($otherUser)
            ->patch(route('workspace.update', $workspace->id), $updateData);

        $response->assertStatus(403);
    }

    public function test_archive_and_unarchive_workspace()
    {
        $user = User::factory()->create();
        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => 'test',
            'owner_id' => $user->id
        ]);

        $workspace->users()->attach($user->id, ['role' => 'owner']);

        $response = $this->actingAs($user)
            ->patch(route('workspace.archive', $workspace->id));

        $response->assertStatus(200);

        $workspace->refresh();
        $this->assertNotNull($workspace->archived_at);

        $response = $this->actingAs($user)
            ->patch(route('workspace.unarchive', $workspace->id));

        $response->assertStatus(200);

        $workspace->refresh();

        $this->assertNull($workspace->archived_at);
    }



    // public function test_can_create_boards()
    // {
    //     $user = User::factory()->create();
    //     $workspace = Workspace::create([
    //         'id' => Str::uuid(),
    //         'name' => 'test',
    //         'owner_id' => $user->id
    //     ]);

    //     $workspace->users()->attach($user->id, ['role' => 'owner']);

    //     $boardData = [
    //         'name' => 'test',
    //         'workspaceId' => $workspace->id,
    //         'private' => false
    //     ];

    //     $response = $this->actingAs($user)
    //         ->post(route('board.store'), $boardData);

    //     $response->assertStatus(200);

    //     $responseData = $response->json();

    //     $this->assertDatabaseHas('boards', [
    //         'id' => $responseData['board']['id'],
    //         'name' => 'test',
    //         'workspace_id' => $workspace->id,
    //         'private' => false
    //     ]);
    // }
}
