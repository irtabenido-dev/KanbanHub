<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{

    public function edit(Request $request): Response
    {
        return Inertia::render('Profile');
    }

    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();
        $request->user()->fill($request->only('name', 'email'));

        $profileData = $user->profile_data;

        if($request->newPassword){
            $user->password = Hash::make($request->newPassword);
        }

        if($request->hasFile('profilePicture')){
            if($profileData['profilePicture']){
                Storage::disk('public')->delete($profileData['profilePicture']);
            }

            $path = $request->file('profilePicture')
            ->store('profile_pictures', 'public');

            $profileData['profilePicture'] = "/storage/{$path}";
        }

        $user->profile_data = $profileData;
        $user->save();

        return response()->json([
            'user' => $user
        ]);
    }

    public function deactivate(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->deactivated_at = Carbon::now();
        $user->save();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null);
    }

    public function reactivate(Request $request){

    }
}
