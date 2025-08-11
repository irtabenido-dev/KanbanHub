<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\User;
use App\Models\WorkspaceUser;
use App\Notifications\InvitationSent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class InviteController extends Controller
{
    public function inviteMember(Request $request){

        $invite_code = Str::random(10);
        $invitation_id = Str::uuid();

        $existingInvitation = Invitation::where('invited_id', $request->user_id)
        ->where('workspace_id', $request->workspace_id)
        ->first();

        $isStillMember = WorkspaceUser::where('workspace_id', $request->workspace_id)
        ->where('user_id', $request->user_id)->exists();

        $invited_user = User::findOrFail($request->user_id);

        if(!$existingInvitation && !$isStillMember){
            Invitation::create([
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
                'expires_at' => Carbon::now()->addDays(7),
                'invitation_code' => $invite_code,
                'invitation_link' => url("/invitation/{$invite_code}")
            ];

            $invited_user->notify(new InvitationSent($invitation));
        }elseif($existingInvitation && !$isStillMember){

            if(Carbon::parse($existingInvitation->expires_at)->isPast()){
                $existingInvitation->expires_at = Carbon::now()->addDays(7);
            }

            $updatedInviteCode = Str::random(10);;

            $existingInvitation->invitation_code = $updatedInviteCode;
            $existingInvitation->role = $request->role;
            $existingInvitation->used_at = null;
            $existingInvitation->save();

        $invitation = [
            'id' => $invitation_id,
            'workspace_id' => $request->workspace_id,
            'invited_id' => $request->user_id,
            'inviter_id' => Auth::user()->id,
            'role' => $request->role,
            'invitation_code' => $updatedInviteCode,
            'expires_at' => Carbon::now()->addDays(7),
            'invitation_link' => url("/invitation/{$updatedInviteCode}")
        ];

            $invited_user->notify(new InvitationSent($invitation));
        }

        return redirect()->back()->with('success', 'Invitation has been successfully sent!');
    }

    public function verifyInvitation(Request $request){
        $invitation = Invitation::where('invitation_code', '=', $request->code)->first();

        if($invitation && !Carbon::parse($invitation->expires_at)->isPast() && !$invitation->used_at){

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

            foreach($notifications as $notification){
                $notification->markAsRead();
            }

            return app(WorkspaceUsersController::class)->addMember($invitation_data);

        }else{
            abort(404, 'Invitation not found or has expired.');
        }
    }

}
