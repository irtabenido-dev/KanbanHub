<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);

        $response->assertInertia(
            fn (Assert $page) =>
            $page->component('Auth/Login')
            ->has('errors')
        );
    }

    public function test_new_users_can_login(): void
    {

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => 'password',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password'
        ]);

        $response->assertStatus(302);
        $response->assertRedirect('/workspaces');
        $this->assertAuthenticatedAs($user);
    }
}
