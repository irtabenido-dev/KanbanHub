<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BoardsTest extends TestCase
{
    use RefreshDatabase;
    public function test_can_create_board()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $boardData = [
            'name' => 'test',
            'workspaceId' => $workspace->id,
            'private' => false
        ];

        $response = $this->actingAs($user)
            ->post(route('board.store'), $boardData);

        $response->assertStatus(200);

        $responseData = $response->json();

        $this->assertDatabaseHas('boards', [
            'id' => $responseData['board']['id'],
            'name' => 'test',
            'workspace_id' => $workspace->id,
            'private' => false
        ]);
    }

    public function test_empty_name_when_creating_board()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $blankNameBoardData = [
            'name' => '',
            'workspaceId' => $workspace->id,
            'private' => false
        ];

        $response = $this->actingAs($user)->postJson(route('board.store'), $blankNameBoardData);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors(['name']);
    }

    public function test_name_exists_when_creating_board()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $nameNotUniqueBoardData = [
            'name' => $board->name,
            'workspaceId' => $workspace->id,
            'private' => false
        ];

        $response = $this->actingAs($user)->postJson(route('board.store'), $nameNotUniqueBoardData);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors(['name']);
    }

    public function test_can_update_board_name()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $updateBoardData = [
            'id' => $board->id,
            'name' => 'updated_name'
        ];

        $response = $this->actingAs($user)
            ->patchJson(route('board.update', $board->id), $updateBoardData);

        $response->assertStatus(204);

        $this->assertDatabaseHas('boards', [
            'id' => $board->id,
            'name' => 'updated_name'
        ]);
    }

    public function test_update_board_name_failed_due_to_empty_name()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $updateBoardData = [
            'id' => $board->id,
            'name' => ''
        ];

        $response = $this->actingAs($user)
            ->patchJson(route('board.update', $board->id), $updateBoardData);

        $response->assertStatus(status: 422);
    }

    public function test_update_board_name_failed_due_to_name_existing()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $updateBoardData = [
            'id' => $board->id,
            'name' => $board->name
        ];

        $response = $this->actingAs($user)
            ->patchJson(route('board.update', $board->id), $updateBoardData);

        $response->assertStatus(422);
    }

    public function test_can_archive_board()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $response = $this->actingAs($user)->patchJson(route('board.archive', $board->id), [
            'id' => $board->id
        ]);

        $board->refresh();

        $response->assertStatus(204);

        $this->assertNotNull($board->archived_at);
    }

    public function test_can_unarchive_board()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $this->actingAs($user)->patchJson(route('board.archive', $board->id), [
            'id' => $board->id
        ]);

        $response = $this->actingAs($user)
            ->patchJson(route('board.unarchive', $board->id), [
                'id' => $board->id
            ]);

        $board->refresh();

        $response->assertStatus(200);

        $this->assertNull($board->archived_at);
    }

    public function test_board_destroy()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $response = $this->actingAs($user)
            ->deleteJson(route('board.destroy', $board->id), [
                'id' => $board->id
            ]);

        $response->assertStatus(204);

        $this->assertDatabaseMissing('boards', [
            'id' => $board->id,
        ]);
    }

    public function test_can_add_member()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $workspace->users()->attach($otherUser, ['role' => 'member']);
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $response = $this->actingAs($user)
            ->postJson(route('board.user.add'), [
                'boardId' => $board->id,
                'userId' => $otherUser->id,
                'role' => 'member'
            ]);

        $response->assertStatus(200);

        $response->assertJsonStructure([
            'newUser' => [
                'id',
                'name',
                'email',
                'boardRole',
                'workspaceRole',
                'isVirtual'
            ]
        ]);
    }

    public function test_can_remove_member()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $workspace->users()->attach($otherUser, ['role' => 'member']);
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $this->actingAs($user)
            ->postJson(route('board.user.add'), [
                'boardId' => $board->id,
                'userId' => $otherUser->id,
                'role' => 'member'
            ]);

        $response = $this->actingAs($user)
            ->deleteJson(route('board.remove.user', [
                'boardId' => $board->id,
                'targetId' => $otherUser->id
            ]), [
                'boardId' => $board->id,
                'targetId' => $otherUser->id
            ]);

        $response->assertStatus(204);
    }

    public function test_can_update_member_role()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $workspace->users()->attach($otherUser, ['role' => 'member']);
        $board = Board::factory()->for($user, 'owner')->for($workspace, 'workspace')->create();

        $this->actingAs($user)
            ->postJson(route('board.user.add'), [
                'boardId' => $board->id,
                'userId' => $otherUser->id,
                'role' => 'member'
            ]);

        $response = $response = $this->actingAs($user)
            ->patchJson(route('board.user.update'), [
                'boardId' => $board->id,
                'targetId' => $otherUser->id,
                'role' => 'admin'
            ]);

        $response->assertStatus(200);

        $response->assertJsonStructure([
            'updatedUser' => [
                'id',
                'name',
                'email',
                'boardRole',
                'workspacerole'
            ]
        ]);

        $response->assertJsonFragment([
            'boardRole' => 'admin'
        ]);
    }
}
