<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>Validação de Acesso - Trustme</title>
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
                <p style="font-size: 16px; color: #333333;"><strong>Olá,</strong></p>

                @if ($tipo === 'primeiro_acesso')
                <p style="font-size: 15px; color: #555555;">Use o código abaixo para concluir seu <strong>primeiro acesso</strong> ao sistema Trustme.</p>
                @else
                <p style="font-size: 15px; color: #555555;">Use o código abaixo para <strong>redefinir sua senha</strong> de acesso ao Trustme.</p>
                @endif

                <p style="font-size: 18px; margin: 20px 0;"><strong style="font-size: 26px; letter-spacing: 2px;">{{ $chave }}</strong></p>

                <p style="font-size: 13px; color: #888888;">Este código expira em 10 minutos.</p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="font-size: 12px; color: #aaaaaa;">Se você não solicitou este código, apenas ignore este e-mail.</p>
                <p style="font-size: 12px; color: #aaaaaa;">&copy; {{ date('Y') }} Trustme. Todos os direitos reservados.</p>
            </td>
        </tr>
    </table>
</body>

</html>