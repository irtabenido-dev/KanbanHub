<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardJoinRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoardJoinRequestController extends Controller
{
    public function getRequests(Request $request)
    {
        $board = Board::findOrFail($request->boardId);
        $joinRequests = $board->accessRequests()->where('status', 'pending')->get();

        $mappedRequests = $joinRequests->map(fn($accessRequest) => [
            'id' => $accessRequest->id,
            'user_id' => $accessRequest->user->id,
            'name' => $accessRequest->user->name,
            'email' => $accessRequest->user->email,
            'requested_at' => Carbon::parse($accessRequest->created_at)->format('Y-m-d'),
        ]);

        return response()->json([
            'joinRequests' => $mappedRequests
        ]);
    }

    public function store(Request $request)
    {
        $userId = Auth::id();
        $boardId = $request->boardId;
        $accessRequest = BoardJoinRequest::where('board_id', $boardId)
            ->where('user_id', $userId)->first();

        if (!$accessRequest) {
            BoardJoinRequest::create([
                'board_id' => $boardId,
                'user_id' => $userId,
                'status' => 'pending'
            ]);
        }else if($accessRequest && $accessRequest ->status === 'approved'){
            $accessRequest->status = 'pending';
            $accessRequest->save();
        } else {
            if ($accessRequest->status === "rejected") {
                $accessRequest->status = "pending";
                $accessRequest->save();
                return response()->json(['message' => 'success']);
            }
            return response()->json(['error' => 'A join request is already pending.'], 409);
        }

        return response()->noContent();
    }

    public function requestResponse(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:board_join_requests,id',
            'userId' => 'required|exists:users,id',
            'role' => 'required|string',
            'accept' => 'required|boolean'
        ]);

        $accessRequest = BoardJoinRequest::findOrFail($request->id);

        $board = Board::findOrFail($accessRequest->board_id);
        if ($request->accept && $accessRequest->status === 'approved') {
            $accessRequest->status = 'pending';
            $accessRequest->save();
        } else if ($request->accept && $accessRequest->status === 'pending') {
            $accessRequest->status = 'approved';
            $accessRequest->save();
            $board->users()->syncWithoutDetaching([
                $request->userId => ['role' => $request->role]
            ]);
        } else if ($request->accept && $accessRequest->status === 'rejected') {
            $accessRequest->status = 'approved';
            $accessRequest->save();
            $board->users()->syncWithoutDetaching([
                $request->userId => ['role' => $request->role]
            ]);
        } else {
            $accessRequest->status = 'rejected';
            $accessRequest->save();
        }

        return response()->noContent();
    }
}
