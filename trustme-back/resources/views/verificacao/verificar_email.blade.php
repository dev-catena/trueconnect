<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>Confirmação de E-mail - Trustme</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <h2 style="margin: 0; color: #222222;">TRUSTME</h2>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 30px 0;">
                <p style="font-size: 16px; color: #333333;"><strong>Olá {{ $user->nome_completo }},</strong></p>

                <p style="font-size: 15px; color: #555555;">Clique no botão abaixo para <strong>confirmar seu e-mail</strong> e validar sua conta no aplicativo Trustme.</p>

                <p style="margin: 30px 0;">
                    <a href="{{ $url }}" style="padding: 12px 25px; background-color: #38bdf8; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Validar Conta
                    </a>
                </p>

                <p style="font-size: 14px; color: #888888;">Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:</p>
                <p style="font-size: 13px; color: #555555;">{{ $url }}</p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="font-size: 12px; color: #aaaaaa;">Se você não solicitou esta verificação, apenas ignore este e-mail.</p>
                <p style="font-size: 12px; color: #aaaaaa;">&copy; {{ date('Y') }} Trustme. Todos os direitos reservados.</p>
            </td>
        </tr>
    </table>
</body>

</html>