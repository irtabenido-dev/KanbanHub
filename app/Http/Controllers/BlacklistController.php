<?php

namespace App\Http\Controllers;

use App\Models\BlacklistMember;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BlacklistController extends Controller
{

    public function getBlacklistedUsers(Request $request)
    {
        $request->validate([
            'id' => 'required',
            'type' => 'required|string'
        ]);

        $type = [
            'workspace' => \App\Models\Workspace::class,
            'board' => \App\Models\Board::class
        ];

        $blacklistedUsers = BlacklistMember::where('blacklistable_id', $request->id)
            ->where('blacklistable_type', $type[$request->type])
            ->with('user')
            ->get();

        return response()->json([
            'blacklistedUsers' => $blacklistedUsers
        ]);
    }
    public function addUserToBlacklist(Request $request)
    {
        $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                Rule::unique('blacklist_members')->where(function ($query) use ($request) {
                    return $query->where('blacklistable_type', $request->blacklistable_type)
                        ->where('blacklistable_id', $request->blacklistable_id);
                }),
            ],
            'blacklistable_type' => 'required|string',
            'blacklistable_id' => 'required',
        ]);

        BlacklistMember::create([
            'blacklistable_type' => $request->blacklistable_type,
            'blacklistable_id' => $request->blacklistable_id,
            'user_id' => $request->user_id
        ]);

        return response()->noContent();
    }

    public function removeUserFromBlacklist(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:blacklist_members,id'
        ]);

        $blacklistedUser = BlacklistMember::findOrFail($request->id);

        $blacklistedUser->delete();

        return response()->noContent();
    }
}
