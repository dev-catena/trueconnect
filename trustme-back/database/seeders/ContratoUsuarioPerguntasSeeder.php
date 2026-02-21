<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoUsuarioPerguntasSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'contrato_id' => 1, 'pergunta_id' => 1, 'usuario_id' => 5, 'resposta' => null, 'created_at' => '2025-09-25 23:05:49', 'updated_at' => '2025-09-25 23:05:49'],
            ['id' => 2, 'contrato_id' => 1, 'pergunta_id' => 1, 'usuario_id' => 4, 'resposta' => null, 'created_at' => '2025-09-25 23:05:49', 'updated_at' => '2025-09-25 23:05:49'],
            ['id' => 3, 'contrato_id' => 3, 'pergunta_id' => 1, 'usuario_id' => 7, 'resposta' => null, 'created_at' => '2025-09-27 14:59:09', 'updated_at' => '2025-09-27 14:59:09'],
            ['id' => 4, 'contrato_id' => 3, 'pergunta_id' => 1, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2025-09-27 14:59:09', 'updated_at' => '2025-09-27 14:59:09'],
            ['id' => 5, 'contrato_id' => 4, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-10-28 17:38:16', 'updated_at' => '2025-10-28 17:38:16'],
            ['id' => 6, 'contrato_id' => 4, 'pergunta_id' => 1, 'usuario_id' => 7, 'resposta' => null, 'created_at' => '2025-10-28 17:38:16', 'updated_at' => '2025-10-28 17:38:16'],
            ['id' => 7, 'contrato_id' => 5, 'pergunta_id' => 2, 'usuario_id' => 7, 'resposta' => 'Trans', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 17:59:11'],
            ['id' => 8, 'contrato_id' => 5, 'pergunta_id' => 3, 'usuario_id' => 7, 'resposta' => 'Frequentemente', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 17:59:28'],
            ['id' => 9, 'contrato_id' => 5, 'pergunta_id' => 4, 'usuario_id' => 7, 'resposta' => 'Frequentemente', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 17:59:32'],
            ['id' => 10, 'contrato_id' => 5, 'pergunta_id' => 5, 'usuario_id' => 7, 'resposta' => 'Não', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 17:59:34'],
            ['id' => 11, 'contrato_id' => 5, 'pergunta_id' => 2, 'usuario_id' => 6, 'resposta' => 'Cisgênero', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 17:57:04'],
            ['id' => 12, 'contrato_id' => 5, 'pergunta_id' => 3, 'usuario_id' => 6, 'resposta' => 'As vezes', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 18:03:37'],
            ['id' => 13, 'contrato_id' => 5, 'pergunta_id' => 4, 'usuario_id' => 6, 'resposta' => 'As vezes', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 18:03:38'],
            ['id' => 14, 'contrato_id' => 5, 'pergunta_id' => 5, 'usuario_id' => 6, 'resposta' => 'Sim', 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 18:03:42'],
            ['id' => 15, 'contrato_id' => 6, 'pergunta_id' => 1, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2025-10-29 11:34:10', 'updated_at' => '2025-10-29 11:34:10'],
            ['id' => 16, 'contrato_id' => 6, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-10-29 11:34:10', 'updated_at' => '2025-10-29 11:34:10'],
            ['id' => 17, 'contrato_id' => 7, 'pergunta_id' => 2, 'usuario_id' => 7, 'resposta' => 'Trans', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:58:29'],
            ['id' => 18, 'contrato_id' => 7, 'pergunta_id' => 3, 'usuario_id' => 7, 'resposta' => 'As vezes', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:58:31'],
            ['id' => 19, 'contrato_id' => 7, 'pergunta_id' => 4, 'usuario_id' => 7, 'resposta' => 'As vezes', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:58:33'],
            ['id' => 20, 'contrato_id' => 7, 'pergunta_id' => 5, 'usuario_id' => 7, 'resposta' => 'Sim', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:58:59'],
            ['id' => 21, 'contrato_id' => 7, 'pergunta_id' => 2, 'usuario_id' => 6, 'resposta' => 'Cisgênero', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:50:11'],
            ['id' => 22, 'contrato_id' => 7, 'pergunta_id' => 3, 'usuario_id' => 6, 'resposta' => 'As vezes', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:50:22'],
            ['id' => 23, 'contrato_id' => 7, 'pergunta_id' => 4, 'usuario_id' => 6, 'resposta' => 'Sempre', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:50:27'],
            ['id' => 24, 'contrato_id' => 7, 'pergunta_id' => 5, 'usuario_id' => 6, 'resposta' => 'Não', 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:50:33'],
            ['id' => 25, 'contrato_id' => 8, 'pergunta_id' => 1, 'usuario_id' => 12, 'resposta' => null, 'created_at' => '2025-10-29 22:47:05', 'updated_at' => '2025-10-29 22:47:05'],
            ['id' => 26, 'contrato_id' => 8, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-10-29 22:47:05', 'updated_at' => '2025-10-29 22:47:05'],
            ['id' => 27, 'contrato_id' => 9, 'pergunta_id' => 1, 'usuario_id' => 12, 'resposta' => null, 'created_at' => '2025-10-29 22:47:37', 'updated_at' => '2025-10-29 22:47:37'],
            ['id' => 28, 'contrato_id' => 9, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-10-29 22:47:37', 'updated_at' => '2025-10-29 22:47:37'],
            ['id' => 29, 'contrato_id' => 10, 'pergunta_id' => 2, 'usuario_id' => 12, 'resposta' => 'Outro', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:55:35'],
            ['id' => 30, 'contrato_id' => 10, 'pergunta_id' => 3, 'usuario_id' => 12, 'resposta' => 'Nunca', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:55:43'],
            ['id' => 31, 'contrato_id' => 10, 'pergunta_id' => 4, 'usuario_id' => 12, 'resposta' => 'Sempre', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:55:48'],
            ['id' => 32, 'contrato_id' => 10, 'pergunta_id' => 5, 'usuario_id' => 12, 'resposta' => 'Não', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:55:54'],
            ['id' => 33, 'contrato_id' => 10, 'pergunta_id' => 2, 'usuario_id' => 6, 'resposta' => 'Outro', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:59:46'],
            ['id' => 34, 'contrato_id' => 10, 'pergunta_id' => 3, 'usuario_id' => 6, 'resposta' => 'Frequentemente', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:59:47'],
            ['id' => 35, 'contrato_id' => 10, 'pergunta_id' => 4, 'usuario_id' => 6, 'resposta' => 'Frequentemente', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:59:49'],
            ['id' => 36, 'contrato_id' => 10, 'pergunta_id' => 5, 'usuario_id' => 6, 'resposta' => 'Sim', 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:59:53'],
            ['id' => 43, 'contrato_id' => 16, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:12:09'],
            ['id' => 44, 'contrato_id' => 16, 'pergunta_id' => 1, 'usuario_id' => 12, 'resposta' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:12:09'],
            ['id' => 45, 'contrato_id' => 17, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:12:09'],
            ['id' => 46, 'contrato_id' => 17, 'pergunta_id' => 1, 'usuario_id' => 12, 'resposta' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:12:09'],
            ['id' => 47, 'contrato_id' => 18, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-11-04 11:12:10', 'updated_at' => '2025-11-04 11:12:10'],
            ['id' => 48, 'contrato_id' => 18, 'pergunta_id' => 1, 'usuario_id' => 12, 'resposta' => null, 'created_at' => '2025-11-04 11:12:10', 'updated_at' => '2025-11-04 11:12:10'],
            ['id' => 49, 'contrato_id' => 19, 'pergunta_id' => 1, 'usuario_id' => 7, 'resposta' => null, 'created_at' => '2025-11-04 11:26:14', 'updated_at' => '2025-11-04 11:26:14'],
            ['id' => 50, 'contrato_id' => 19, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-11-04 11:26:14', 'updated_at' => '2025-11-04 11:26:14'],
            ['id' => 55, 'contrato_id' => 27, 'pergunta_id' => 2, 'usuario_id' => 6, 'resposta' => 'Cisgênero', 'created_at' => '2025-11-07 13:38:03', 'updated_at' => '2025-11-07 13:39:32'],
            ['id' => 56, 'contrato_id' => 27, 'pergunta_id' => 3, 'usuario_id' => 6, 'resposta' => 'Nunca', 'created_at' => '2025-11-07 13:38:03', 'updated_at' => '2025-11-07 13:39:38'],
            ['id' => 57, 'contrato_id' => 27, 'pergunta_id' => 4, 'usuario_id' => 6, 'resposta' => 'Nunca', 'created_at' => '2025-11-07 13:38:03', 'updated_at' => '2025-11-07 13:39:39'],
            ['id' => 58, 'contrato_id' => 27, 'pergunta_id' => 5, 'usuario_id' => 6, 'resposta' => 'Não', 'created_at' => '2025-11-07 13:38:03', 'updated_at' => '2025-11-07 13:39:46'],
            ['id' => 59, 'contrato_id' => 27, 'pergunta_id' => 2, 'usuario_id' => 8, 'resposta' => 'Outro', 'created_at' => '2025-11-07 13:38:04', 'updated_at' => '2025-11-07 13:41:16'],
            ['id' => 60, 'contrato_id' => 27, 'pergunta_id' => 3, 'usuario_id' => 8, 'resposta' => 'Frequentemente', 'created_at' => '2025-11-07 13:38:04', 'updated_at' => '2025-11-07 13:41:15'],
            ['id' => 61, 'contrato_id' => 27, 'pergunta_id' => 4, 'usuario_id' => 8, 'resposta' => 'Sempre', 'created_at' => '2025-11-07 13:38:04', 'updated_at' => '2025-11-07 13:41:17'],
            ['id' => 62, 'contrato_id' => 27, 'pergunta_id' => 5, 'usuario_id' => 8, 'resposta' => 'Não', 'created_at' => '2025-11-07 13:38:04', 'updated_at' => '2025-11-07 13:42:31'],
            ['id' => 63, 'contrato_id' => 29, 'pergunta_id' => 1, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2025-11-07 13:53:23', 'updated_at' => '2025-11-07 13:53:23'],
            ['id' => 64, 'contrato_id' => 29, 'pergunta_id' => 1, 'usuario_id' => 6, 'resposta' => null, 'created_at' => '2025-11-07 13:53:23', 'updated_at' => '2025-11-07 13:53:23'],
            ['id' => 65, 'contrato_id' => 30, 'pergunta_id' => 1, 'usuario_id' => 5, 'resposta' => null, 'created_at' => '2025-11-10 17:47:59', 'updated_at' => '2025-11-10 17:47:59'],
            ['id' => 66, 'contrato_id' => 30, 'pergunta_id' => 1, 'usuario_id' => 4, 'resposta' => null, 'created_at' => '2025-11-10 17:47:59', 'updated_at' => '2025-11-10 17:47:59'],
            ['id' => 79, 'contrato_id' => 34, 'pergunta_id' => 1, 'usuario_id' => 19, 'resposta' => null, 'created_at' => '2026-02-10 10:08:58', 'updated_at' => '2026-02-10 10:08:58'],
            ['id' => 80, 'contrato_id' => 34, 'pergunta_id' => 1, 'usuario_id' => 14, 'resposta' => null, 'created_at' => '2026-02-10 10:08:58', 'updated_at' => '2026-02-10 10:08:58'],
            ['id' => 81, 'contrato_id' => 35, 'pergunta_id' => 1, 'usuario_id' => 19, 'resposta' => null, 'created_at' => '2026-02-11 10:24:45', 'updated_at' => '2026-02-11 10:24:45'],
            ['id' => 82, 'contrato_id' => 35, 'pergunta_id' => 1, 'usuario_id' => 14, 'resposta' => null, 'created_at' => '2026-02-11 10:24:45', 'updated_at' => '2026-02-11 10:24:45']
        ];

        foreach ($data as $row) {
            DB::table('contrato_usuario_perguntas')->insert($row);
        }
    }
}
