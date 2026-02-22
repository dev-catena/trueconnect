<?php

namespace App\Observers;

use App\Models\Subscription;
use App\Models\UserPlanBalance;

class SubscriptionObserver
{
    public function created(Subscription $subscription): void
    {
        if ($subscription->status === 'active' && $subscription->user) {
            UserPlanBalance::topUpForUser($subscription->user);
        }
    }
}
