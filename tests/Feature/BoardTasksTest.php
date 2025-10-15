<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\TaskList;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BoardTasksTest extends TestCase
{
    use RefreshDatabase;
    public function test_create_task_with_empty_title()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();
        $list = TaskList::factory()->for($board, 'board')->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.add'), [
                'boardId' => $board->id,
                'listId' => $list->id,
                'title' => ''
            ]);

        $response->assertStatus(422);
    }

    public function test_created_task_successfully()
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->for($user, 'owner')->create();
        $board = Board::factory()->for($workspace, 'workspace')->for($user, 'owner')->create();
        $list = TaskList::factory()->for($board, 'board')->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.add'), [
                'boardId' => $board->id,
                'listId' => $list->id,
                'title' => 'test'
            ]);

        $response->assertStatus(200);

        $responseData = $response->json();

        $this->assertDatabaseHas('tasks', [
            'id' => $responseData['addedTask']['id'],
            'title' => 'test'
        ]);
    }

    public function test_task_update_title_with_no_title_input()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.title.update'), [
                'taskId' => $task->id,
                'title' => ''
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrorFor('title');
    }

    public function test_task_update_title_successfully()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.title.update'), [
                'taskId' => $task->id,
                'title' => 'title_updated'
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'title_updated'
        ]);
    }

    public function test_task_toggle_completion()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->patchJson(route('task.completion.toggle'), [
                'taskId' => $task->id
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => true
        ]);
    }

    public function test_task_update_description()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.description.update'), [
                'taskId' => $task->id,
                'description' => [
                    "type" => "doc",
                    "content" => [
                        [
                            "type" => "paragraph",
                            "content" => [
                                ["text" => "updated_description", "type" => "text"]
                            ]
                        ]
                    ]
                ]
            ]);

        $response->assertStatus(200);

        $task = Task::findOrFail($task->id);

        $this->assertEquals(
            [
                "type" => "doc",
                "content" => [
                    [
                        "type" => "paragraph",
                        "content" => [
                            ["text" => "updated_description", "type" => "text"]
                        ]
                    ]
                ]
            ],
            json_decode($task->description, true)
        );
    }

    public function test_task_failed_to_add_comment_due_to_empty_input()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.add.comment'), [
                'taskId' => $task->id,
                'comment' => ''
            ]);

        $response->assertStatus(422);
    }

    public function test_task_add_comment()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.add.comment'), [
                'taskId' => $task->id,
                'comment' => 'new_comment'
            ]);

        $response->assertStatus(200);

        $response->assertJsonFragment([
            'content' => 'new_comment'
        ]);
    }

    public function test_task_edit_comment()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.add.comment'), [
                'taskId' => $task->id,
                'comment' => 'initial_comment'
            ]);

        $response->assertStatus(200);

        $comment = TaskActivity::where('task_id', $task->id)
            ->where('activity_details->type', 'comment')
            ->where('activity_details->content', 'initial_comment')
            ->firstOrFail();

        $response = $this->actingAs($user)
            ->patchJson(route('task.comment.edit'), [
                'commentId' => $comment['id'],
                'comment' => [
                    'type' => 'comment',
                    'content' => [
                        'type' => 'doc',
                        'content' => [
                            [
                                'type' => 'paragraph',
                                'content' => [
                                    [
                                        'text' => 'updated_comment',
                                        'type' => 'text',
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

        $comment->refresh();

        $this->assertEquals(
            'updated_comment',
            $comment->activity_details['content']['content']['content'][0]['content'][0]['text']
        );
    }

    public function test_task_delete_comment()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.add.comment'), [
                'taskId' => $task->id,
                'comment' => 'delete_comment'
            ]);

        $comment = $response->json('newComment');

        $response = $this->actingAs($user)
            ->deleteJson(route('task.comment.delete'), [
                'commentId' => $comment['id']
            ]);

        $this->assertDatabaseMissing('task_activities', [
            'id' => $comment['id'],
        ]);
    }

    public function test_task_failed_to_set_due_date()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.set.dueDate'), [
                'taskId' => $task->id,
                'date' => null
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrorFor('date');
    }

    public function test_successfully_set_due_date()
    {
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
            ->postJson(route('task.set.dueDate'), [
                'taskId' => $task->id,
                'date' => now()->utc()->format('Y-m-d H:i:s')
            ]);

        $response->assertStatus(200);
        $task = Task::findOrFail($task->id);

        $this->assertNotNull($task->deadline);
    }

    public function test_remove_due_date(){
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)
        ->create([
            'deadline' => now()->utc()->format('Y-m-d H:i:s')
        ]);

        $response = $this->actingAs($user)
        ->deleteJson(route('task.remove.dueDate'), [
            'taskId' => $task->id
        ]);

        $response->assertStatus(200);

        $task = Task::findOrFail($task->id);

        $this->assertNull($task->deadline);
    }

    public function test_archive_task(){
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
        ->patchJson(route('task.archive'), [
            'id' => $task->id
        ]);

        $response->assertStatus(204);

        $task = Task::findOrFail($task->id);

        $this->assertNotNull($task->archived_at);
    }

    public function test_unarchive_task(){
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();

        $response = $this->actingAs($user)
        ->patchJson(route('task.unArchive'), [
            'id' => $task->id
        ]);

        $response->assertStatus(200);

        $task = Task::findOrFail($task->id);

        $this->assertNull($task->archived_at);
    }

    public function test_add_user_to_task(){
        $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();
        $otherUser = User::factory()->create();
        $board = $task->board;
        $board->users()->attach($otherUser->id, ['role' => 'member']);

        $response = $this->actingAs($user)
        ->postJson(route('task.add.user'), [
            'taskId' => $task->id,
            'userId' => $otherUser->id
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('task_members', [
            'task_id' => $task->id,
            'user_id' => $otherUser->id
        ]);
    }

    public function test_remove_user_from_task(){
         $user = User::factory()->create();
        $task = Task::factory()->withRelations($user)->create();
        $otherUser = User::factory()->create();
        $board = $task->board;
        $board->users()->attach($otherUser->id, ['role' => 'member']);

        $response = $this->actingAs($user)
        ->postJson(route('task.remove.user'), [
            'taskId' => $task->id,
            'userId' => $otherUser->id
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('task_members', [
            'task_id' => $task->id,
            'user_id' => $otherUser->id
        ]);
    }
}
