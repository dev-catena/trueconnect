<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Disparado quando alguém tenta se conectar com um usuário que não tem conexões disponíveis.
 * O destinatário é notificado para adquirir mais conexões.
 */
class DestinatarioSemConexoes implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $solicitante,
        public User $destinatario
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->destinatario->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'conexao.destinatario_sem_conexoes';
    }

    public function broadcastWith(): array
    {
        return [
            'solicitante' => [
                'id' => $this->solicitante->id,
                'codigo' => $this->solicitante->codigo ?? null,
                'nome_completo' => $this->solicitante->nome_completo ?? null,
            ],
            'message' => $this->solicitante->nome_completo . ' quer se conectar com você, mas você precisa adquirir mais conexões no seu plano.',
        ];
    }
}
