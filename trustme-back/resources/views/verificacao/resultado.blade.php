<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>Verificação de E-mail</title>
    <style>
        body {
            background: #f8f9fa;
            font-family: sans-serif;
            text-align: center;
            padding-top: 100px;
        }

        .mensagem {
            font-size: 20px;
            color: #333;
        }

        .sucesso {
            color: green;
        }

        .erro {
            color: red;
        }

        .info {
            color: blue;
        }
    </style>
</head>

<body>
    <div class="mensagem {{ $tipo }}">
        {{ $mensagem }}
    </div>
</body>

</html>