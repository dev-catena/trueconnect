<?php

namespace App\Events;

use App\Models\UsuarioConexao;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConexaoCriada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conexao;

    /**
     * Create a new event instance.
     */
    public function __construct(UsuarioConexao $conexao)
    {
        $this->conexao = $conexao->load(['solicitante', 'destinatario']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->conexao->solicitante_id),
            new PrivateChannel('user.' . $this->conexao->destinatario_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'conexao.criada';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->conexao->id,
            'solicitante_id' => $this->conexao->solicitante_id,
            'destinatario_id' => $this->conexao->destinatario_id,
            'aceito' => $this->conexao->aceito,
            'created_at' => $this->conexao->created_at?->toIso8601String(),
            'solicitante' => [
                'id' => $this->conexao->solicitante->id ?? null,
                'codigo' => $this->conexao->solicitante->codigo ?? null,
                'nome_completo' => $this->conexao->solicitante->nome_completo ?? null,
                'email' => $this->conexao->solicitante->email ?? null,
            ],
            'destinatario' => [
                'id' => $this->conexao->destinatario->id ?? null,
                'codigo' => $this->conexao->destinatario->codigo ?? null,
                'nome_completo' => $this->conexao->destinatario->nome_completo ?? null,
                'email' => $this->conexao->destinatario->email ?? null,
            ],
        ];
    }
}



