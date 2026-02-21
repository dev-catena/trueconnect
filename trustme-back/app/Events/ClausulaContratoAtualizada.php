<?php

namespace App\Events;

use App\Models\Contrato;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClausulaContratoAtualizada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $contratoId;
    public int $clausulaId;
    public int $usuarioId;
    public ?bool $aceito; // true=concordo, false=discordo

    /**
     * Create a new event instance.
     * Disparado quando uma parte altera concordar/discordar em uma cláusula.
     */
    public function __construct(int $contratoId, int $clausulaId, int $usuarioId, ?bool $aceito)
    {
        $this->contratoId = $contratoId;
        $this->clausulaId = $clausulaId;
        $this->usuarioId = $usuarioId;
        $this->aceito = $aceito;
    }

    /**
     * Get the channels the event should broadcast on.
     * Envia para contratante e todos os participantes (exceto quem fez a alteração).
     */
    public function broadcastOn(): array
    {
        $contrato = Contrato::with('participantes')->find($this->contratoId);
        if (!$contrato) {
            return [];
        }

        $userIds = [$contrato->contratante_id];
        foreach ($contrato->participantes ?? [] as $p) {
            $uid = $p->usuario_id ?? null;
            if ($uid) {
                $userIds[] = $uid;
            }
        }
        $userIds = array_unique(array_filter($userIds));

        return array_map(fn($id) => new PrivateChannel('user.' . $id), $userIds);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'clausula.contrato.atualizada';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'contrato_id' => $this->contratoId,
            'clausula_id' => $this->clausulaId,
            'usuario_id' => $this->usuarioId,
            'aceito' => $this->aceito,
        ];
    }
}
