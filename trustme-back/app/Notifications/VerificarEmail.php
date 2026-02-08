<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class VerificarEmail extends Notification
{
    public function __construct(public string $token) {}

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = url("/api/usuario/verificar-email/{$this->token}");

        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Confirme seu e-mail')
            ->view('verificacao.verificar_email', [
                'url' => $url,
                'user' => $notifiable,
            ]);
    }
}
