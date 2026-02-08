<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DadosIniciaisController extends Controller
{

    public function dadosIniciais()
    {
        try {
            DB::beginTransaction();

            DB::table('users')->insert([
                ['id' => 1, 'nome_completo' => 'usuario 1', 'codigo' => 1234567, 'CPF' => '123', 'email' => 'email1', 'password' => bcrypt('123')],
                ['id' => 2, 'nome_completo' => 'usuario 2', 'codigo' => 1234568, 'CPF' => '456', 'email' => 'email2', 'password' => bcrypt('456')],
                ['id' => 3, 'nome_completo' => 'usuario 3', 'codigo' => 1234569, 'CPF' => '789', 'email' => 'email3', 'password' => bcrypt('789')]
            ]);

            DB::table('selos')->insert([
                ['id' => 1, 'disponivel' => 1, 'descricao' => 'Email', 'codigo' => 'SEL0001', 'validade' => 360],
                ['id' => 2, 'disponivel' => 0, 'descricao' => 'Identidade', 'codigo' => 'SEL0002', 'validade' => 360],
                ['id' => 3, 'disponivel' => 0, 'descricao' => 'Escolaridade', 'codigo' => 'SEL0003', 'validade' => 360],
                ['id' => 4, 'disponivel' => 0, 'descricao' => 'Renda', 'codigo' => 'SEL0004', 'validade' => 360],
                ['id' => 5, 'disponivel' => 0, 'descricao' => 'Estado Civil', 'codigo' => 'SEL0005', 'validade' => 360],
                ['id' => 6, 'disponivel' => 0, 'descricao' => 'Patrimônio', 'codigo' => 'SEL0006', 'validade' => 360],
            ]);

            DB::table('contrato_tipos')->insert([
                ['id' => 1, 'codigo' => 'CTP0001', 'descricao' => 'Todas Cláusulas Normais'],
                ['id' => 2, 'codigo' => 'CTP0002', 'descricao' => 'Todas Cláusulas Sexuais'],
                ['id' => 3, 'codigo' => 'CTP0003', 'descricao' => 'Cláusulas Normais + Sexuais']
            ]);

            DB::table('clausulas')->insert([
                ['id' => 1, 'sexual' => 0, 'codigo' => 'CLA0001', 'nome' => 'Não Exclusividade', 'descricao' => 'As PARTES se comprometem a manter a relação NÃO exclusiva, PODENDO manter relacionamentos íntimos com outras pessoas durante a vigência do contrato.A REGISTRADA ANUÊNCIA E CONCORDÂNCIA, descaracteriza todas as possibilidades futuras de desdobramentos jurídicos de outros vieses jurídicos e jurisprudências no tocante a fidelidade, que através desse contrato NÃO é interesse das partes.'],
                ['id' => 2, 'sexual' => 0, 'codigo' => 'CLA0002', 'nome' => 'Comunicação', 'descricao' => 'As PARTES se comprometem a manter uma comunicação aberta e honesta, discutindo todas as questões e desentendimentos que possam surgir durante a relação, estando fundamentadas e alicerçadas exclusivamente nesse contrato que antecede ao fato, ato e conjunção carnal entre as partes. Todas as permissões concedidas previamente no contrato geram materialidade sobre as permissões previamente concedidas e acordadas.'],
                ['id' => 3, 'sexual' => 0, 'codigo' => 'CLA0003', 'nome' => 'Respeito', 'descricao' => 'As PARTES se comprometem a respeitar a privacidade e a individualidade de cada uma, não interferindo na vida pessoal e profissional da outra parte, não divulgando sobre o contrato sigiloso dessa plataforma, não permitindo prints ou fotos da dinâmica do aplicativo e de dados das partes dentro da norma LGPD, incorrendo em vulnerabilidade jurídica caso quebre essa cláusula.'],
                ['id' => 4, 'sexual' => 0, 'codigo' => 'CLA0004', 'nome' => 'Responsabilidade', 'descricao' => 'As PARTES se comprometem a assumir responsabilidade pelas próprias ações, não transferindo responsabilidades ou culpas para a outra parte. O uso de substâncias exógenas, de abuso, alopáticos é de responsabilidade do usuário não atenuando a responsabilidade civil e criminal sob seus atos. O app e sua estrutura, assim como a parte contrária não se responsabiliza pelo quadro clínico químico, de transtornos ou patologias de nenhuma das partes. Caso essa condição seja vulnerabilidade tipificada, não utilize a plataforma nem faça esse contrato. Decline da possibilidade de se relacionar até que restabeleça suas condições mínimo operacionais para o ato.'],
                ['id' => 7, 'sexual' => 0, 'codigo' => 'CLA0007', 'nome' => 'Não Comunicação de Patrimônio', 'descricao' => 'As PARTES declaram que não haverá comunicação de patrimônio entre elas, cada uma mantendo a propriedade exclusiva de seus bens. No contrato é exigida a divisão das despesas em 50%, sejam contas de bares, restaurantes, motéis, e todo consumo casual, em conformidade com a atual equidade evolutivas da sociedade. Se por fora do contrato, as partes divergirem dessa conduta e fizerem acerto financeiro entre si, o app não se responsabiliza por esses atos e nem entrega materialidade contrária a essa cláusula.'],
                ['id' => 8, 'sexual' => 1, 'codigo' => 'CLA0008', 'nome' => 'Sexo vaginal sem preservativo', 'descricao' => ''],
                ['id' => 9, 'sexual' => 1, 'codigo' => 'CLA0009', 'nome' => 'Sexo vaginal com preservativo', 'descricao' => ''],
                ['id' => 10, 'sexual' => 1, 'codigo' => 'CLA0010', 'nome' => 'Sexo anal sem preservativo', 'descricao' => ''],
                ['id' => 11, 'sexual' => 1, 'codigo' => 'CLA0011', 'nome' => 'Sexo anal com preservativo', 'descricao' => ''],
                ['id' => 12, 'sexual' => 1, 'codigo' => 'CLA0012', 'nome' => 'Sexo oral (você faz)', 'descricao' => ''],
                ['id' => 13, 'sexual' => 1, 'codigo' => 'CLA0013', 'nome' => 'Sexo oral (você recebe)', 'descricao' => ''],
                ['id' => 14, 'sexual' => 1, 'codigo' => 'CLA0014', 'nome' => 'Masturbação mútua', 'descricao' => ''],
                ['id' => 15, 'sexual' => 1, 'codigo' => 'CLA0015', 'nome' => 'Compartilhamento de brinquedos sexuais', 'descricao' => ''],
                ['id' => 16, 'sexual' => 1, 'codigo' => 'CLA0016', 'nome' => 'Sexo em grupo', 'descricao' => ''],
                ['id' => 17, 'sexual' => 1, 'codigo' => 'CLA0017', 'nome' => 'Sexo casual(vigência desse contrato)', 'descricao' => ''],
                ['id' => 19, 'sexual' => 1, 'codigo' => 'CLA0019', 'nome' => 'Práticas BDSM (bondage, dominação, submissão, sadomasoquismo) e suas consequências.', 'descricao' => ''],
                ['id' => 20, 'sexual' => 1, 'codigo' => 'CLA0020', 'nome' => 'Sexo sob efeito de álcool ou drogas', 'descricao' => ''],
                ['id' => 21, 'sexual' => 1, 'codigo' => 'CLA0021', 'nome' => 'Fetiches e suas consequências', 'descricao' => ''],
            ]);

            DB::table('clausula_tipo_contrato')->insert([
                ['id' => 1, 'contrato_tipo_id' => 1, 'clausula_id' => 1],
                ['id' => 2, 'contrato_tipo_id' => 1, 'clausula_id' => 2],
                ['id' => 3, 'contrato_tipo_id' => 1, 'clausula_id' => 3],
                ['id' => 4, 'contrato_tipo_id' => 1, 'clausula_id' => 4],
                ['id' => 7, 'contrato_tipo_id' => 1, 'clausula_id' => 7],
                ['id' => 8, 'contrato_tipo_id' => 2, 'clausula_id' => 8],
                ['id' => 9, 'contrato_tipo_id' => 2, 'clausula_id' => 9],
                ['id' => 10, 'contrato_tipo_id' => 2, 'clausula_id' => 10],
                ['id' => 11, 'contrato_tipo_id' => 2, 'clausula_id' => 11],
                ['id' => 12, 'contrato_tipo_id' => 2, 'clausula_id' => 12],
                ['id' => 13, 'contrato_tipo_id' => 2, 'clausula_id' => 13],
                ['id' => 14, 'contrato_tipo_id' => 2, 'clausula_id' => 14],
                ['id' => 15, 'contrato_tipo_id' => 2, 'clausula_id' => 15],
                ['id' => 16, 'contrato_tipo_id' => 2, 'clausula_id' => 16],
                ['id' => 17, 'contrato_tipo_id' => 2, 'clausula_id' => 17],
                ['id' => 19, 'contrato_tipo_id' => 2, 'clausula_id' => 19],
                ['id' => 20, 'contrato_tipo_id' => 2, 'clausula_id' => 20],
                ['id' => 21, 'contrato_tipo_id' => 2, 'clausula_id' => 21],
                ['id' => 22, 'contrato_tipo_id' => 3, 'clausula_id' => 1],
                ['id' => 23, 'contrato_tipo_id' => 3, 'clausula_id' => 2],
                ['id' => 24, 'contrato_tipo_id' => 3, 'clausula_id' => 3],
                ['id' => 25, 'contrato_tipo_id' => 3, 'clausula_id' => 4],
                ['id' => 28, 'contrato_tipo_id' => 3, 'clausula_id' => 7],
                ['id' => 29, 'contrato_tipo_id' => 3, 'clausula_id' => 8],
                ['id' => 30, 'contrato_tipo_id' => 3, 'clausula_id' => 9],
                ['id' => 31, 'contrato_tipo_id' => 3, 'clausula_id' => 10],
                ['id' => 32, 'contrato_tipo_id' => 3, 'clausula_id' => 11],
                ['id' => 33, 'contrato_tipo_id' => 3, 'clausula_id' => 12],
                ['id' => 34, 'contrato_tipo_id' => 3, 'clausula_id' => 13],
                ['id' => 35, 'contrato_tipo_id' => 3, 'clausula_id' => 14],
                ['id' => 36, 'contrato_tipo_id' => 3, 'clausula_id' => 15],
                ['id' => 37, 'contrato_tipo_id' => 3, 'clausula_id' => 16],
                ['id' => 38, 'contrato_tipo_id' => 3, 'clausula_id' => 17],
                ['id' => 40, 'contrato_tipo_id' => 3, 'clausula_id' => 19],
                ['id' => 41, 'contrato_tipo_id' => 3, 'clausula_id' => 20],
                ['id' => 42, 'contrato_tipo_id' => 3, 'clausula_id' => 21],

            ]);

            DB::table('usuario_selos')->insert([
                ['id' => 1, 'selo_id' => 1, 'usuario_id' => 1, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-06-01 00:00:00'],
                ['id' => 2, 'selo_id' => 1, 'usuario_id' => 2, 'verificado' => 0, 'obtido_em' => NULL, 'expira_em' => NULL],
                ['id' => 3, 'selo_id' => 1, 'usuario_id' => 3, 'verificado' => 0, 'obtido_em' => NULL, 'expira_em' => NULL],

                ['id' => 4, 'selo_id' => 2, 'usuario_id' => 1, 'verificado' => 1, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-06-01 00:00:00'],
                ['id' => 5, 'selo_id' => 2, 'usuario_id' => 2, 'verificado' => 1, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-02-01 00:00:00'],
                ['id' => 6, 'selo_id' => 2, 'usuario_id' => 3, 'verificado' => 1, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-02-01 00:00:00'],

                ['id' => 7, 'selo_id' => 3, 'usuario_id' => 1, 'verificado' => 0, 'obtido_em' => NULL, 'expira_em' => NULL],
                ['id' => 8, 'selo_id' => 3, 'usuario_id' => 2, 'verificado' => 0, 'obtido_em' => NULL, 'expira_em' => NULL],
                ['id' => 9, 'selo_id' => 3, 'usuario_id' => 3, 'verificado' => 0, 'obtido_em' => NULL, 'expira_em' => NULL],
            ]);

            DB::table('perguntas')->insert([
                //normal
                ['id' => 1, 'tipo_alternativa' => 'select', 'alternativas' => '[]', 'contrato_tipo_id' => 1, 'descricao' => 'Pergunta Normal'],

                //sexual
                ['id' => 2, 'tipo_alternativa' => 'select', 'alternativas' => '["Cisgênero", "Trans", "Outro"]', 'contrato_tipo_id' => 2, 'descricao' => 'Qual gênero você se identifica e se declara nas práticas deste contrato?'],
                ['id' => 3, 'tipo_alternativa' => 'select', 'alternativas' => '["Nunca", "As vezes", "Frequentemente", "Sempre"]', 'contrato_tipo_id' => 2, 'descricao' => 'Com que frequência você realiza as práticas marcadas?'],
                ['id' => 4, 'tipo_alternativa' => 'select', 'alternativas' => '["Nunca", "As vezes", "Frequentemente", "Sempre"]', 'contrato_tipo_id' => 2, 'descricao' => 'Você costuma usar preservativo nas práticas sexuais?'],
                ['id' => 5, 'tipo_alternativa' => 'radio', 'alternativas' => '["Sim", "Não"]', 'contrato_tipo_id' => 2, 'descricao' => 'Já compartilhou seringas, agulhas ou outros objetos perfurantes?'],
            ]);

            DB::commit();

            return response()->json(['msg' => 'Dados inseridos com sucesso'], 201);
        } catch (\Exception $e) {

            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
