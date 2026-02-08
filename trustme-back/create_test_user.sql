-- Script para criar usuário de teste para o app
-- CPF: 57712083029
-- Senha: 11111111

-- Verificar se o usuário já existe e remover
DELETE FROM users WHERE CPF = '57712083029' OR CPF = '577.120.830-29';

-- Inserir usuário de teste
INSERT INTO users (
    nome_completo,
    name,
    CPF,
    password,
    role,
    created_at,
    updated_at
) VALUES (
    'Usuário Teste App',
    'Usuário Teste App',
    '57712083029',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 11111111
    'user',
    NOW(),
    NOW()
);

-- Verificar se foi criado
SELECT id, nome_completo, CPF, role FROM users WHERE CPF = '57712083029';

