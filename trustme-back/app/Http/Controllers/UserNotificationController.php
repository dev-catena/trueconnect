<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    /**
     * Lista notificações do usuário autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = UserNotification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        $limit = min((int) $request->get('limit', 50), 100);
        $notifications = $query->limit($limit)->get();

        $unreadCount = UserNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Notificações listadas.',
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Marca uma notificação como lida.
     */
    public function markAsRead(Request $request, int $id)
    {
        $notification = UserNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return $this->fail('Notificação não encontrada.', null, 404);
        }

        $notification->markAsRead();
        return $this->ok('Notificação marcada como lida.');
    }

    /**
     * Marca todas as notificações do usuário como lidas.
     */
    public function markAllAsRead(Request $request)
    {
        UserNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->ok('Todas as notificações foram marcadas como lidas.');
    }
}
