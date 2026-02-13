<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'question' => 'O que é o TrueConnect?', 'answer' => 'O TrueConnect é uma plataforma avançada de verificação de conformidade e autenticidade de dados, projetada para criar um ambiente de confiança digital. Além de validar informações, a plataforma permite a conexão segura entre pessoas que desejam estabelecer contratos para formalizar relações afetivas. Nosso objetivo é garantir que ambas as partes sejam quem dizem ser, prevenindo golpes, falsidade ideológica e futuros desacordos através de uma base documental sólida e verificada.', 'order' => 1, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 12:51:35'],
            ['id' => 2, 'question' => 'Como funciona o selo digital?', 'answer' => 'O selo digital do TrueConnect é uma certificação de integridade exibida em seu site ou aplicação. Ele funciona através de um processo rigoroso de auditoria de dados:\\n\\nSubmissão de Evidências: O usuário é orientado pela plataforma a fornecer documentos específicos e informações detalhadas que comprovem suas declarações.\\nVerificação: Nossa plataforma analisa as evidências enviadas para garantir que são autênticas e atualizadas.\\nClassificação: Após a validação, o sistema classifica e emite o selo correspondente ao nível de veracidade comprovada. Esse selo serve como um atestado público de que as informações ali presentes foram verificadas e possuem lastro real, gerando autoridade e segurança imediata para quem visualiza.', 'order' => 2, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 12:49:12'],
            ['id' => 3, 'question' => 'Posso cancelar minha assinatura a qualquer momento?', 'answer' => 'Sim. A flexibilidade é parte do nosso compromisso com a transparência. Você pode gerenciar ou cancelar sua assinatura a qualquer momento diretamente pelo painel administrativo da plataforma, sem burocracias ou multas ocultas.', 'order' => 3, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 12:48:48'],
            ['id' => 4, 'question' => 'Qual a diferença entre os planos?', 'answer' => 'Os planos são estruturados com base no nível de verificação e nas ferramentas de contrato disponíveis. Planos básicos oferecem verificações de identidade essenciais, enquanto planos superiores incluem a gestão de contratos afetivos complexos, análises de evidências mais profundas e monitoramento contínuo da validade dos selos.', 'order' => 4, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 12:51:53'],
            ['id' => 5, 'question' => 'Como posso integrar o TrueConnect ao meu sistema?', 'answer' => 'A integração é simples e direta. Disponibilizamos uma API robusta que permite conectar o fluxo de envio de documentos do seu sistema diretamente à nossa plataforma de verificação. Uma vez que o usuário envia as evidências e o selo é classificado, seu sistema recebe uma notificação automática (webhook) para atualizar o status de certificação do usuário em tempo real, exibindo o selo digital de forma dinâmica na sua interface.', 'order' => 5, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 12:51:05']
        ];

        foreach ($data as $row) {
            DB::table('faqs')->insert($row);
        }
    }
}
