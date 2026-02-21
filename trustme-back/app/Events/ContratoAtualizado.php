<?php

namespace App\Events;

use App\Models\Contrato;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContratoAtualizado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $contrato;
    public $acao; // 'criado', 'assinado', 'atualizado', 'cancelado'
    /** IDs de usuários para broadcast (usado quando participantes foram excluídos, ex: cancelado) */
    public ?array $userIdsParaNotificar = null;

    /**
     * Create a new event instance.
     * @param array|null $userIdsParaNotificar Quando acao='cancelado', passar os IDs de contratante+participantes antes da exclusão.
     */
    public function __construct(Contrato $contrato, string $acao = 'atualizado', ?array $userIdsParaNotificar = null)
    {
        $this->contrato = $contrato->load([
            'tipo:id,codigo,descricao',
            'contratante:id,nome_completo,email',
            'participantes:id,contrato_id,usuario_id',
        ]);
        $this->acao = $acao;
        $this->userIdsParaNotificar = $userIdsParaNotificar;
    }

    /**
     * Get the channels the event should broadcast on.
     * Envia para contratante e todos os participantes.
     */
    public function broadcastOn(): array
    {
        if ($this->userIdsParaNotificar !== null && !empty($this->userIdsParaNotificar)) {
            $userIds = array_values(array_unique($this->userIdsParaNotificar));
            return array_map(fn($id) => new PrivateChannel('user.' . $id), $userIds);
        }
        $userIds = [$this->contrato->contratante_id];
        $participantes = $this->contrato->participantes ?? collect();
        foreach ($participantes as $p) {
            $uid = $p->usuario_id ?? null;
            if ($uid) {
                $userIds[] = $uid;
            }
        }
        $userIds = array_unique($userIds);
        return array_map(fn($id) => new PrivateChannel('user.' . $id), $userIds);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'contrato.atualizado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->contrato->id,
            'codigo' => $this->contrato->codigo,
            'status' => $this->contrato->status,
            'acao' => $this->acao,
            'contratante_id' => $this->contrato->contratante_id,
        ];
    }
}
