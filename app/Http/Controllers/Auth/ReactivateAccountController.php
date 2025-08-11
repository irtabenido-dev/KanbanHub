<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AccountReactivationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class ReactivateAccountController extends Controller
{
    //
    public function create(Request $request){

        return Inertia::render('Auth/ReactivateAccount', [
            'email' => $request->email,
            'message' => session('message')
        ]);
    }

    public function sendReactivationLink(Request $request) {

        $user = User::where('email', $request->email)
        ->whereNotNull('deactivated_at')->first();

        $url = URL::temporarySignedRoute(
            'account.verify-reactivation',
            now()->addHour(),
            ['id' => $user->id]
        );

        $user->notify(new AccountReactivationNotification($url));

        return back()->with('message', 'Request sent, please check your email address for further instructions on reactivating your account');
    }

    public function verifyReactivationRequest(Request $request){
        if(!$request->hasValidSignature()){
            abort(401, 'This reactivation link has expired');
        }

        $user = User::findOrFail($request->id);

        if(!$user->deactivated_at){
            return redirect()->route('login')->with('status', 'This account is already active');
        }

        $user->deactivated_at = null;

        $user->save();

        return redirect()->route('login')->with('status', 'Your account has been reactivated and you can now login');
    }
}
