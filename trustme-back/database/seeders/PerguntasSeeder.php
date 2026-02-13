<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerguntasSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'contrato_tipo_id' => 1, 'descricao' => 'Pergunta Normal', 'alternativas' => '[]', 'tipo_alternativa' => 'select', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 2, 'contrato_tipo_id' => 2, 'descricao' => 'Qual gênero você se identifica e se declara nas práticas deste contrato?', 'alternativas' => '[\"Cisgênero\", \"Trans\", \"Outro\"]', 'tipo_alternativa' => 'select', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 3, 'contrato_tipo_id' => 2, 'descricao' => 'Com que frequência você realiza as práticas marcadas?', 'alternativas' => '[\"Nunca\", \"As vezes\", \"Frequentemente\", \"Sempre\"]', 'tipo_alternativa' => 'select', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 4, 'contrato_tipo_id' => 2, 'descricao' => 'Você costuma usar preservativo nas práticas sexuais?', 'alternativas' => '[\"Nunca\", \"As vezes\", \"Frequentemente\", \"Sempre\"]', 'tipo_alternativa' => 'select', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 5, 'contrato_tipo_id' => 2, 'descricao' => 'Já compartilhou seringas, agulhas ou outros objetos perfurantes?', 'alternativas' => '[\"Sim\", \"Não\"]', 'tipo_alternativa' => 'radio', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null]
        ];

        foreach ($data as $row) {
            DB::table('perguntas')->insert($row);
        }
    }
}
