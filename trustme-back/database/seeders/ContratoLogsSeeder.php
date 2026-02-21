<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoLogsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'contrato_id' => 1, 'usuario_id' => 5, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-09-25 23:10:42', 'updated_at' => '2025-09-25 23:10:42'],
            ['id' => 2, 'contrato_id' => 1, 'usuario_id' => 5, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-09-25 23:05:49', 'valor_novo' => '2025-09-25 23:10:42', 'deleted_at' => null, 'created_at' => '2025-09-25 23:10:42', 'updated_at' => '2025-09-25 23:10:42'],
            ['id' => 3, 'contrato_id' => 1, 'usuario_id' => 5, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-09-26 00:05:49', 'valor_novo' => '2025-09-26 23:10:42', 'deleted_at' => null, 'created_at' => '2025-09-25 23:10:42', 'updated_at' => '2025-09-25 23:10:42'],
            ['id' => 4, 'contrato_id' => 2, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-09-27 14:46:55', 'updated_at' => '2025-09-27 14:46:55'],
            ['id' => 5, 'contrato_id' => 2, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-09-27 14:32:04', 'valor_novo' => '2025-09-27 14:46:55', 'deleted_at' => null, 'created_at' => '2025-09-27 14:46:55', 'updated_at' => '2025-09-27 14:46:55'],
            ['id' => 6, 'contrato_id' => 2, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-09-27 15:32:04', 'valor_novo' => '2025-09-28 14:46:55', 'deleted_at' => null, 'created_at' => '2025-09-27 14:46:55', 'updated_at' => '2025-09-27 14:46:55'],
            ['id' => 7, 'contrato_id' => 4, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-10-28 17:45:59', 'updated_at' => '2025-10-28 17:45:59'],
            ['id' => 8, 'contrato_id' => 4, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-10-28 17:38:16', 'valor_novo' => '2025-10-28 17:45:59', 'deleted_at' => null, 'created_at' => '2025-10-28 17:45:59', 'updated_at' => '2025-10-28 17:45:59'],
            ['id' => 9, 'contrato_id' => 4, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-10-28 18:38:16', 'valor_novo' => '2025-10-28 23:45:59', 'deleted_at' => null, 'created_at' => '2025-10-28 17:45:59', 'updated_at' => '2025-10-28 17:45:59'],
            ['id' => 10, 'contrato_id' => 5, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-10-28 18:03:45', 'updated_at' => '2025-10-28 18:03:45'],
            ['id' => 11, 'contrato_id' => 5, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-10-28 17:56:22', 'valor_novo' => '2025-10-28 18:03:45', 'deleted_at' => null, 'created_at' => '2025-10-28 18:03:45', 'updated_at' => '2025-10-28 18:03:45'],
            ['id' => 12, 'contrato_id' => 5, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-10-28 18:56:22', 'valor_novo' => '2025-10-29 18:03:45', 'deleted_at' => null, 'created_at' => '2025-10-28 18:03:45', 'updated_at' => '2025-10-28 18:03:45'],
            ['id' => 13, 'contrato_id' => 7, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-10-29 12:00:03', 'updated_at' => '2025-10-29 12:00:03'],
            ['id' => 14, 'contrato_id' => 7, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-10-29 11:49:09', 'valor_novo' => '2025-10-29 12:00:03', 'deleted_at' => null, 'created_at' => '2025-10-29 12:00:03', 'updated_at' => '2025-10-29 12:00:03'],
            ['id' => 15, 'contrato_id' => 7, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-10-29 12:49:09', 'valor_novo' => '2025-10-30 12:00:03', 'deleted_at' => null, 'created_at' => '2025-10-29 12:00:03', 'updated_at' => '2025-10-29 12:00:03'],
            ['id' => 16, 'contrato_id' => 8, 'usuario_id' => 12, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-10-29 23:01:30', 'updated_at' => '2025-10-29 23:01:30'],
            ['id' => 17, 'contrato_id' => 8, 'usuario_id' => 12, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-10-29 22:47:05', 'valor_novo' => '2025-10-29 23:01:30', 'deleted_at' => null, 'created_at' => '2025-10-29 23:01:30', 'updated_at' => '2025-10-29 23:01:30'],
            ['id' => 18, 'contrato_id' => 8, 'usuario_id' => 12, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-10-29 23:47:05', 'valor_novo' => '2025-10-30 00:01:30', 'deleted_at' => null, 'created_at' => '2025-10-29 23:01:30', 'updated_at' => '2025-10-29 23:01:30'],
            ['id' => 22, 'contrato_id' => 16, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-04 11:20:02', 'updated_at' => '2025-11-04 11:20:02'],
            ['id' => 23, 'contrato_id' => 16, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-04 11:12:09', 'valor_novo' => '2025-11-04 11:20:02', 'deleted_at' => null, 'created_at' => '2025-11-04 11:20:02', 'updated_at' => '2025-11-04 11:20:02'],
            ['id' => 24, 'contrato_id' => 16, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-04 12:12:09', 'valor_novo' => '2025-11-05 11:20:02', 'deleted_at' => null, 'created_at' => '2025-11-04 11:20:02', 'updated_at' => '2025-11-04 11:20:02'],
            ['id' => 25, 'contrato_id' => 19, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-04 11:31:25', 'updated_at' => '2025-11-04 11:31:25'],
            ['id' => 26, 'contrato_id' => 19, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-04 11:26:14', 'valor_novo' => '2025-11-04 11:31:25', 'deleted_at' => null, 'created_at' => '2025-11-04 11:31:25', 'updated_at' => '2025-11-04 11:31:25'],
            ['id' => 27, 'contrato_id' => 19, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-04 12:26:14', 'valor_novo' => '2025-11-05 11:31:25', 'deleted_at' => null, 'created_at' => '2025-11-04 11:31:25', 'updated_at' => '2025-11-04 11:31:25'],
            ['id' => 31, 'contrato_id' => 23, 'usuario_id' => 8, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-07 13:25:24', 'updated_at' => '2025-11-07 13:25:24'],
            ['id' => 32, 'contrato_id' => 23, 'usuario_id' => 8, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-07 13:17:41', 'valor_novo' => '2025-11-07 13:25:24', 'deleted_at' => null, 'created_at' => '2025-11-07 13:25:24', 'updated_at' => '2025-11-07 13:25:24'],
            ['id' => 33, 'contrato_id' => 23, 'usuario_id' => 8, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-07 14:17:41', 'valor_novo' => '2025-11-07 15:25:24', 'deleted_at' => null, 'created_at' => '2025-11-07 13:25:24', 'updated_at' => '2025-11-07 13:25:24'],
            ['id' => 34, 'contrato_id' => 24, 'usuario_id' => 8, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-07 13:28:03', 'updated_at' => '2025-11-07 13:28:03'],
            ['id' => 35, 'contrato_id' => 24, 'usuario_id' => 8, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-07 13:25:47', 'valor_novo' => '2025-11-07 13:28:03', 'deleted_at' => null, 'created_at' => '2025-11-07 13:28:03', 'updated_at' => '2025-11-07 13:28:03'],
            ['id' => 36, 'contrato_id' => 24, 'usuario_id' => 8, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-07 14:25:47', 'valor_novo' => '2025-11-07 14:28:03', 'deleted_at' => null, 'created_at' => '2025-11-07 13:28:03', 'updated_at' => '2025-11-07 13:28:03'],
            ['id' => 40, 'contrato_id' => 27, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-07 13:43:19', 'updated_at' => '2025-11-07 13:43:19'],
            ['id' => 41, 'contrato_id' => 27, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-07 13:38:03', 'valor_novo' => '2025-11-07 13:43:19', 'deleted_at' => null, 'created_at' => '2025-11-07 13:43:19', 'updated_at' => '2025-11-07 13:43:19'],
            ['id' => 42, 'contrato_id' => 27, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-07 14:38:03', 'valor_novo' => '2025-11-08 13:43:19', 'deleted_at' => null, 'created_at' => '2025-11-07 13:43:19', 'updated_at' => '2025-11-07 13:43:19'],
            ['id' => 43, 'contrato_id' => 29, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-07 13:54:46', 'updated_at' => '2025-11-07 13:54:46'],
            ['id' => 44, 'contrato_id' => 29, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-07 13:53:23', 'valor_novo' => '2025-11-07 13:54:46', 'deleted_at' => null, 'created_at' => '2025-11-07 13:54:46', 'updated_at' => '2025-11-07 13:54:46'],
            ['id' => 45, 'contrato_id' => 29, 'usuario_id' => 6, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-07 14:53:23', 'valor_novo' => '2025-11-07 19:54:46', 'deleted_at' => null, 'created_at' => '2025-11-07 13:54:46', 'updated_at' => '2025-11-07 13:54:46'],
            ['id' => 46, 'contrato_id' => 30, 'usuario_id' => 4, 'tabela' => 'contratos', 'coluna' => 'status', 'valor_antigo' => 'Pendente', 'valor_novo' => 'Ativo', 'deleted_at' => null, 'created_at' => '2025-11-10 17:53:36', 'updated_at' => '2025-11-10 17:53:36'],
            ['id' => 47, 'contrato_id' => 30, 'usuario_id' => 4, 'tabela' => 'contratos', 'coluna' => 'dt_inicio', 'valor_antigo' => '2025-11-10 17:47:59', 'valor_novo' => '2025-11-10 17:53:36', 'deleted_at' => null, 'created_at' => '2025-11-10 17:53:36', 'updated_at' => '2025-11-10 17:53:36'],
            ['id' => 48, 'contrato_id' => 30, 'usuario_id' => 4, 'tabela' => 'contratos', 'coluna' => 'dt_fim', 'valor_antigo' => '2025-11-10 18:47:59', 'valor_novo' => '2025-11-11 17:53:36', 'deleted_at' => null, 'created_at' => '2025-11-10 17:53:36', 'updated_at' => '2025-11-10 17:53:36']
        ];

        foreach ($data as $row) {
            DB::table('contrato_logs')->insert($row);
        }
    }
}
