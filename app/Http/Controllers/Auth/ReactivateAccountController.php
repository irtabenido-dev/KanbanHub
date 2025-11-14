<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ReactivationKey;
use App\Models\User;
use App\Notifications\AccountReactivationNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class ReactivateAccountController extends Controller
{
    //
    public function create(Request $request)
    {

        return Inertia::render('Auth/ReactivateAccount', [
            'email' => $request->email,
            'message' => session('message')
        ]);
    }

    public function sendReactivationLink(Request $request)
    {

        $user = User::where('email', $request->email)
            ->whereNotNull('deactivated_at')->first();

        $key = Str::random(64);

        ReactivationKey::updateOrInsert(
            ['user_id' => $user->id],
            [
                'key' => hash('sha256', $key),
                'expires_at' => now()->addHour(),
            ]
        );

        $url = url('/verify-reactivation?key=' . $key . '&id=' . $user->id);

        $user->notify(new AccountReactivationNotification($url));

        return response()->noContent();
    }

    public function verifyReactivationRequest(Request $request)
    {
        $hashedKey = hash('sha256', $request->key);
        $record = ReactivationKey::where('key', $hashedKey)->first();

        if (!$record) {
            abort(401, 'Reactivation key invalid');
        }

        if ($record->expires_at < now()) {
            abort(401, 'This reactivation link has expired');
        }

        $user = User::findOrFail($request->id);

        if (!$user->deactivated_at) {
            return redirect()->route('login')->with('status', 'This account is already active');
        }

        $user->deactivated_at = null;

        $user->save();

        $record->delete();

        return redirect()->route('login')->with('status', 'Your account has been reactivated and you can now login');
    }
}
