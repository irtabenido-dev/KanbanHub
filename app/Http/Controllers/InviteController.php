<?php

namespace App\Http\Controllers;

use App\Events\RefreshNotifications;
use App\Models\Invitation;
use App\Models\User;
use App\Models\WorkspaceUser;
use App\Notifications\InvitationSent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class InviteController extends Controller
{
    public function inviteMember(Request $request)
    {
        $request->validate([
            'user_id' => 'exists:users,id|required',
            'workspace_id' => 'required|exists:workspaces,id',
            'role' => 'required'
        ]);

        $invite_code = Str::random(10);
        $invitation_id = Str::uuid();

        $existingInvitation = Invitation::where('invited_id', $request->user_id)
            ->where('workspace_id', $request->workspace_id)
            ->first();

        $invitedUser = User::findOrFail($request->user_id);

        $isStillMember = WorkspaceUser::where('workspace_id', $request->workspace_id)
            ->where('user_id', $request->user_id)->exists();

        if ($isStillMember) {
            return response()->noContent();
        }

        if (!$existingInvitation) {
            $testInvitation = Invitation::create([
                'id' => $invitation_id,
                'workspace_id' => $request->workspace_id,
                'invited_id' => $request->user_id,
                'inviter_id' => Auth::user()->id,
                'role' => $request->role,
                'invitation_code' => $invite_code,
                'expires_at' => Carbon::now()->addDays(7),
            ]);

            $invitation = [
                'id' => $invitation_id,
                'workspace_id' => $request->workspace_id,
                'invited_id' => $request->user_id,
                'inviter_id' => Auth::user()->id,
                'role' => $request->role,
                'invitation_code' => $invite_code,
                'expires_at' => Carbon::now()->addDays(7),
                'invitation_link' => url("/invitation/{$invite_code}")
            ];

            dd($testInvitation);

            $invitedUser->notify(new InvitationSent($invitation));
        } else {

            DB::transaction(function () use ($existingInvitation, $invitedUser, $request) {
                $existingInvitation->expires_at = Carbon::now()->addDays(7);

                $updatedInviteCode = Str::random(10);;

                $existingInvitation->invitation_code = $updatedInviteCode;
                $existingInvitation->role = $request->role;
                $existingInvitation->used_at = null;
                $existingInvitation->save();

                $invitation = [
                    'id' => $existingInvitation->id,
                    'workspace_id' => $request->workspace_id,
                    'invited_id' => $request->user_id,
                    'inviter_id' => Auth::user()->id,
                    'role' => $request->role,
                    'invitation_code' => $updatedInviteCode,
                    'expires_at' => Carbon::now()->addDays(7),
                    'invitation_link' => url("/invitation/{$updatedInviteCode}")
                ];

                $invitedUser->notifications()
                    ->where('data->workspace_id', $request->workspace_id)
                    ->where('type', 'App\Notifications\InvitationSent')
                    ->delete();

                $invitedUser->notify(new InvitationSent($invitation));
            });
        }

        event(new RefreshNotifications($request->user_id));

        return response()->noContent();
    }

    public function verifyInvitation(Request $request)
    {
        $invitation = Invitation::where('invitation_code', '=', $request->code)->first();

        if ($invitation && !Carbon::parse($invitation->expires_at)->isPast() && !$invitation->used_at) {
            return DB::transaction(function () use ($invitation) {
                $invitation->used_at = now();

                $invitation->save();

                $invitation_data =
                    [
                        'workspace_id' => $invitation->workspace_id,
                        'user_id' => $invitation->invited_id,
                        'role' => $invitation->role
                    ];

                $user = Auth::user();

                $notifications = $user->notifications()
                    ->where('notifiable_id', $user->id)
                    ->where('data->workspace_id', $invitation->workspace_id)
                    ->where('type', 'App\Notifications\InvitationSent')
                    ->get();

                foreach ($notifications as $notification) {
                    $notification->markAsRead();
                }

                return app(WorkspaceUsersController::class)->addMember($invitation_data);
            });
        } else {
            abort(404, 'Invitation not found or has expired.');
        }
    }
}
