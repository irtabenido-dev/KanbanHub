<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $task_id
 * @property int $user_id
 * @property array<array-key, mixed> $attachment_attributes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Task|null $task
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereAttachmentAttributes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereUserId($value)
 */
	class Attachment extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $blacklistable_type
 * @property string $blacklistable_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $blacklistable
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember whereBlacklistableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember whereBlacklistableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlacklistMember whereUserId($value)
 */
	class BlacklistMember extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $workspace_id
 * @property string $name
 * @property int $private
 * @property int $owner_id
 * @property string|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BoardJoinRequest> $accessRequests
 * @property-read int|null $access_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlacklistMember> $blacklistedMembers
 * @property-read int|null $blacklisted_members_count
 * @property-read \App\Models\User|null $owner
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Board> $relatedBoards
 * @property-read int|null $related_boards_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskList> $taskLists
 * @property-read int|null $task_lists_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @property-read \App\Models\Workspace|null $workspace
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereOwnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board wherePrivate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Board whereWorkspaceId($value)
 */
	class Board extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $board_id
 * @property int $user_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Board|null $board
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest whereBoardId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardJoinRequest whereUserId($value)
 */
	class BoardJoinRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $board_id
 * @property int $user_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember whereBoardId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BoardMember whereUserId($value)
 */
	class BoardMember extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $workspace_id
 * @property string $invited_id
 * @property string $inviter_id
 * @property string $role
 * @property string $invitation_code
 * @property string|null $expires_at
 * @property string|null $used_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereInvitationCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereInvitedId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereInviterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereUsedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invitation whereWorkspaceId($value)
 */
	class Invitation extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $board_id
 * @property string $list_id
 * @property string $title
 * @property string|null $description
 * @property string|null $deadline
 * @property bool|null $completed
 * @property array<array-key, mixed>|null $task_attributes
 * @property int $position_number
 * @property string|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \App\Models\Board|null $board
 * @property-read \App\Models\TaskList|null $list
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskActivity> $task_activities
 * @property-read int|null $task_activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereBoardId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereListId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePositionNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereTaskAttributes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereUpdatedAt($value)
 */
	class Task extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $task_id
 * @property array<array-key, mixed> $user_details
 * @property array<array-key, mixed> $activity_details
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereActivityDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUserDetails($value)
 */
	class TaskActivity extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $board_id
 * @property string $name
 * @property int $position_number
 * @property string|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Board|null $board
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $tasks
 * @property-read int|null $tasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList whereBoardId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList wherePositionNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskList whereUpdatedAt($value)
 */
	class TaskList extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property string $task_id
 * @property string $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Task|null $task
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskMember whereUserId($value)
 */
	class TaskMember extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property array<array-key, mixed>|null $profile_data
 * @property string|null $deactivated_at
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\WorkspaceUser|null $pivot
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Workspace> $workspaces
 * @property-read int|null $workspaces_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDeactivatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProfileData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $id
 * @property int $owner_id
 * @property string $name
 * @property string|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlacklistMember> $blacklistedMembers
 * @property-read int|null $blacklisted_members_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Board> $boards
 * @property-read int|null $boards_count
 * @property-read \App\Models\User|null $owner
 * @property-read \App\Models\WorkspaceUser|null $pivot
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereOwnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereUpdatedAt($value)
 */
	class Workspace extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $workspace_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereWorkspaceId($value)
 */
	class WorkspaceUser extends \Eloquent {}
}

