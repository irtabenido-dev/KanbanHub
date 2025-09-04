<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);

        $response->assertInertia(
            fn(Assert $page) =>
            $page->component('Auth/ForgotPassword')
                ->has('errors')
        );
    }

    public function test_reset_password_email_sent_with_email_not_in_database()
    {
        Notification::fake();

        $response = $this->post('/forgot-password', [
            'email' => 'dsdxww@ddd.com'
        ]);

        $response->assertStatus(302);

        $response->assertRedirect();

        $response->assertSessionHasErrors(['email']);

        Notification::assertNothingSent();
    }

    public function test_reset_password_email_not_sent_with_not_proper_format_email(): void
    {
        Notification::fake();

        $response = $this->post('/forgot-password', [
            'email' => 'invalid-email-format'
        ]);

        $response->assertStatus(302);

        $response->assertRedirect();

        $response->assertSessionHasErrors(['email']);
    }

    public function test_reset_password_email_properly_sent()
    {
        Notification::fake();

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->post('/forgot-password', [
            'email' => 'test@test.com'
        ]);

        $response->assertStatus(302);

        Notification::assertSentTo($user, ResetPassword::class);
    }
}
