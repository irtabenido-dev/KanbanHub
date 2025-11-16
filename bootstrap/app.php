<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->convertEmptyStringsToNull(except: [
            fn(Request $request) => $request->is([
                'task/addComment',
                'task/comment/update',
                'task/description/update'
            ])
        ]);

        $middleware->trimStrings(except: [
            fn(Request $request) => $request->is([
                'task/addComment',
                'task/comment/update',
                'task/description/update'
            ])
        ]);
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: [
            '192.168.1.1',
            '10.0.0.0/8',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();
