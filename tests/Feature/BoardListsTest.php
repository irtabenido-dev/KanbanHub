<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\TaskList;
use App\Models\User;
use App\Models\Workspace;
use Carbon\Carbon;
use Tests\TestCase;

class BoardListsTest extends TestCase
{
    public function test_cannot_create_list_with_empty_name()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();

        $listData = [
            'boardId' => $board->id,
            'name' => '',
        ];

        $response = $this->actingAs($user)
            ->postJson(route('taskList.add'), $listData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_create_list_with_existing_name()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();

        $list = TaskList::factory()->for($board, 'board')->create([
            'name' => 'test_list_name_existing',
        ]);

        $listData = [
            'boardId' => $board->id,
            'name' => 'test_list_name_existing',
            'position_number' => $list->position_number + 1
        ];

        $response = $this->actingAs($user)
            ->postJson(route('taskList.add'), $listData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_can_create_list()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();

        $listData = [
            'boardId' => $board->id,
            'name' => 'test_list_name_correct',
        ];

        $response = $this->actingAs($user)
            ->postJson(route('taskList.add'), $listData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('lists', [
            'board_id' => $board->id,
            'name' => 'test_list_name_correct'
        ]);
    }

    public function test_cannot_update_list_name_due_to_existing_name()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();

        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();

        $list = TaskList::factory()->for($board, 'board')->create([
            'name' => 'test_list_name_existing',
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('taskList.update.name'), [
                'id' => $list->id,
                'name' => 'test_list_name_existing'
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_can_update_list_name()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();

        $list = TaskList::factory()->for($board, 'board')->create([
            'name' => 'test_list_name_existing',
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('taskList.update.name'), [
                'id' => $list->id,
                'name' => 'test_updated_list_name'
            ]);

        $response->assertStatus(204);

        $this->assertDatabaseHas('lists', [
            'id' => $list->id,
            'name' => 'test_updated_list_name'
        ]);
    }

    public function test_can_archive_list()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();
        $list = TaskList::factory()->for($board, 'board')->create();

        $response = $this->actingAs($user)
            ->patchJson(route('taskList.archive'), [
                'id' => $list->id
            ]);

        $response->assertStatus(204);

        $list = TaskList::findOrFail($list->id);

        $this->assertNotNull($list->archived_at);
    }

    public function test_can_unarchive_list()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();
        $list = TaskList::factory()->for($board, 'board')->create([
            'board_id' => $board->id,
            'position_number' => 10,
            'archived_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($user)
            ->patchJson(route('taskList.unArchive'), [
                'id' => $list->id
            ]);

        $response->assertStatus(200);

        $list->refresh();

        $this->assertNull($list->archived_at);
    }

    public function test_can_delete_list()
    {
       $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();

        $list = TaskList::create([
            'board_id' => $board->id,
            'name' => 'test_list_delete',
            'archived_at' => null,
            'position_number' => 30
        ]);

        $response = $this->actingAs($user)
            ->deleteJson(route('taskList.destroy'), [
                'id' => $list->id
            ]);

        $response->assertStatus(204);

        $this->assertDatabaseMissing('lists', [
            'id' => $list->id,
        ]);
    }
}
