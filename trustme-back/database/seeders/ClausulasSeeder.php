<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClausulasSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'codigo' => 'CLA0001', 'nome' => 'Não Exclusividade', 'descricao' => 'As PARTES se comprometem a manter a relação NÃO exclusiva, PODENDO manter relacionamentos íntimos com outras pessoas durante a vigência do contrato.A REGISTRADA ANUÊNCIA E CONCORDÂNCIA, descaracteriza todas as possibilidades futuras de desdobramentos jurídicos de outros vieses jurídicos e jurisprudências no tocante a fidelidade, que através desse contrato NÃO é interesse das partes.', 'sexual' => 0, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 2, 'codigo' => 'CLA0002', 'nome' => 'Comunicação', 'descricao' => 'As PARTES se comprometem a manter uma comunicação aberta e honesta, discutindo todas as questões e desentendimentos que possam surgir durante a relação, estando fundamentadas e alicerçadas exclusivamente nesse contrato que antecede ao fato, ato e conjunção carnal entre as partes. Todas as permissões concedidas previamente no contrato geram materialidade sobre as permissões previamente concedidas e acordadas.', 'sexual' => 0, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 3, 'codigo' => 'CLA0003', 'nome' => 'Respeito', 'descricao' => 'As PARTES se comprometem a respeitar a privacidade e a individualidade de cada uma, não interferindo na vida pessoal e profissional da outra parte, não divulgando sobre o contrato sigiloso dessa plataforma, não permitindo prints ou fotos da dinâmica do aplicativo e de dados das partes dentro da norma LGPD, incorrendo em vulnerabilidade jurídica caso quebre essa cláusula.', 'sexual' => 0, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 4, 'codigo' => 'CLA0004', 'nome' => 'Responsabilidade', 'descricao' => 'As PARTES se comprometem a assumir responsabilidade pelas próprias ações, não transferindo responsabilidades ou culpas para a outra parte. O uso de substâncias exógenas, de abuso, alopáticos é de responsabilidade do usuário não atenuando a responsabilidade civil e criminal sob seus atos. O app e sua estrutura, assim como a parte contrária não se responsabiliza pelo quadro clínico químico, de transtornos ou patologias de nenhuma das partes. Caso essa condição seja vulnerabilidade tipificada, não utilize a plataforma nem faça esse contrato. Decline da possibilidade de se relacionar até que restabeleça suas condições mínimo operacionais para o ato.', 'sexual' => 0, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 7, 'codigo' => 'CLA0007', 'nome' => 'Não Comunicação de Patrimônio', 'descricao' => 'As PARTES declaram que não haverá comunicação de patrimônio entre elas, cada uma mantendo a propriedade exclusiva de seus bens. No contrato é exigida a divisão das despesas em 50%, sejam contas de bares, restaurantes, motéis, e todo consumo casual, em conformidade com a atual equidade evolutivas da sociedade. Se por fora do contrato, as partes divergirem dessa conduta e fizerem acerto financeiro entre si, o app não se responsabiliza por esses atos e nem entrega materialidade contrária a essa cláusula.', 'sexual' => 0, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 8, 'codigo' => 'CLA0008', 'nome' => 'Sexo vaginal sem preservativo', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 9, 'codigo' => 'CLA0009', 'nome' => 'Sexo vaginal com preservativo', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 10, 'codigo' => 'CLA0010', 'nome' => 'Sexo anal sem preservativo', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 11, 'codigo' => 'CLA0011', 'nome' => 'Sexo anal com preservativo', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 12, 'codigo' => 'CLA0012', 'nome' => 'Sexo oral (você faz)', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 13, 'codigo' => 'CLA0013', 'nome' => 'Sexo oral (você recebe)', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 14, 'codigo' => 'CLA0014', 'nome' => 'Masturbação mútua', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 15, 'codigo' => 'CLA0015', 'nome' => 'Compartilhamento de brinquedos sexuais', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 16, 'codigo' => 'CLA0016', 'nome' => 'Sexo em grupo', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 17, 'codigo' => 'CLA0017', 'nome' => 'Sexo casual(vigência desse contrato)', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 19, 'codigo' => 'CLA0019', 'nome' => 'Práticas BDSM (bondage, dominação, submissão, sadomasoquismo) e suas consequências.', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 20, 'codigo' => 'CLA0020', 'nome' => 'Sexo sob efeito de álcool ou drogas', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 21, 'codigo' => 'CLA0021', 'nome' => 'Fetiches e suas consequências', 'descricao' => '', 'sexual' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null]
        ];

        foreach ($data as $row) {
            DB::table('clausulas')->insert($row);
        }
    }
}
