<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChaveAcesso extends Mailable
{
    use Queueable, SerializesModels;

    public $chave;
    public $tipo;

    /**
     * Create a new message instance.
     */
    public function __construct($chave, $tipo)
    {
        $this->chave = $chave;
        $this->tipo = $tipo;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = 'Código de ' . ($this->tipo === 'primeiro_acesso' ? 'Primeiro Acesso' : 'Redefinição de Senha');
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'email.chave_acesso',
            with: [
                'chave' => $this->chave,
                'tipo' => $this->tipo
            ]
        );
    }


    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
