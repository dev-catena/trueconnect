<?php

namespace App\Events;

use App\Models\SealRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SealRequestAtualizado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sealRequest;
    public $acao; // 'criada', 'aprovada', 'rejeitada', 'revogada'

    /**
     * Create a new event instance.
     */
    public function __construct(SealRequest $sealRequest, string $acao = 'atualizada')
    {
        $this->sealRequest = $sealRequest->load(['user', 'sealType']);
        $this->acao = $acao;
    }

    /**
     * Get the channels the event should broadcast on.
     * Canal privado para admin/servicedesk - quem avalia os selos
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('seal-requests'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'seal_request.atualizado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->sealRequest->id,
            'user_id' => $this->sealRequest->user_id,
            'seal_type_id' => $this->sealRequest->seal_type_id,
            'status' => $this->sealRequest->status,
            'acao' => $this->acao,
            'created_at' => $this->sealRequest->created_at?->toIso8601String(),
            'reviewed_at' => $this->sealRequest->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->sealRequest->rejection_reason,
        ];
    }
}
