<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConexaoRemovida implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conexaoId;
    public $solicitanteId;
    public $destinatarioId;

    /**
     * Create a new event instance.
     */
    public function __construct(int $conexaoId, int $solicitanteId, int $destinatarioId)
    {
        $this->conexaoId = $conexaoId;
        $this->solicitanteId = $solicitanteId;
        $this->destinatarioId = $destinatarioId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->solicitanteId),
            new PrivateChannel('user.' . $this->destinatarioId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'conexao.removida';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->conexaoId,
            'solicitante_id' => $this->solicitanteId,
            'destinatario_id' => $this->destinatarioId,
        ];
    }
}



