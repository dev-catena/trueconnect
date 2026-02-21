<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rota para app React Native com auth via token (Sanctum)
        Broadcast::routes([
            'middleware' => ['auth:sanctum'],
            'prefix' => 'api',
        ]);

        require base_path('routes/channels.php');
    }
}
