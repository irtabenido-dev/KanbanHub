<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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
            'name' => 'test_workspace_create'
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
        $workspace = Workspace::factory()->for($user, 'owner')->create();

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

        $workspace = Workspace::factory()->for($owner, 'owner')->create();

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
        $workspace = Workspace::factory()->for($user, 'owner')->create();

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

        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $updateData = [
            'id' => $workspace->id,
            'name' => 'editedTestName'
        ];

        $workspace->users()->attach($otherUser->id, ['role' => 'admin']);

        $response = $this->actingAs($otherUser)
            ->patch(route('workspace.update', $workspace->id), $updateData);

        $response->assertStatus(403);
    }

    public function test_archive_and_unarchive_workspace()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

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

    //add delete edit members
    public function test_add_workspace_members()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $workspace->users()->attach($otherUser->id, ['role' => 'member']);

        $this->assertDatabaseHas('workspace_user_role', [
            'workspace_id' => $workspace->id,
            'user_id' => $otherUser->id,
            'role' => 'member'
        ]);
    }

    public function test_delete_workspace_members()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $workspace->users()->attach($otherUser->id, ['role' => 'member']);

        $response = $this->actingAs($user)->delete(route('user.remove', [
            'workspaceId' => $workspace->id,
            'userId' => $otherUser->id
        ]));

        $response->assertStatus(204);

        $this->assertDatabaseMissing('workspace_user_role', [
            'workspace_id' => $workspace->id,
            'user_id' => $otherUser->id,
        ]);
    }

    public function test_edit_workspace_member_role()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $workspace->users()->attach($otherUser->id, ['role' => 'member']);

        $response = $this->actingAs($user)->patch(route('userRole.update'), [
            'targetId' => $otherUser->id,
            'workspaceId' => $workspace->id,
            'role' => 'admin',
            'previousOwnerId' => $user->id,
            'targetName' => $otherUser->name,
            'currentUserId' => $user->id
        ]);

        $response->assertStatus(204);

        $this->assertDatabaseHas('workspace_user_role', [
            'workspace_id' => $workspace->id,
            'user_id' => $otherUser->id,
            'role' => 'admin'
        ]);
    }
}
