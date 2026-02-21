<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoUsuariosSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'contrato_id' => 1, 'usuario_id' => 5, 'aceito' => 1, 'dt_aceito' => '2025-09-25 23:10:42', 'deleted_at' => null, 'created_at' => '2025-09-25 23:05:49', 'updated_at' => '2025-09-25 23:10:42'],
            ['id' => 2, 'contrato_id' => 1, 'usuario_id' => 4, 'aceito' => 1, 'dt_aceito' => '2025-09-25 23:10:13', 'deleted_at' => null, 'created_at' => '2025-09-25 23:05:49', 'updated_at' => '2025-09-25 23:10:13'],
            ['id' => 3, 'contrato_id' => 2, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-09-27 14:46:55', 'deleted_at' => null, 'created_at' => '2025-09-27 14:32:04', 'updated_at' => '2025-09-27 14:46:55'],
            ['id' => 4, 'contrato_id' => 2, 'usuario_id' => 7, 'aceito' => 1, 'dt_aceito' => '2025-09-27 14:46:16', 'deleted_at' => null, 'created_at' => '2025-09-27 14:32:04', 'updated_at' => '2025-09-27 14:46:16'],
            ['id' => 5, 'contrato_id' => 3, 'usuario_id' => 7, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-09-27 14:59:09', 'updated_at' => '2025-09-27 14:59:09'],
            ['id' => 6, 'contrato_id' => 3, 'usuario_id' => 8, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-09-27 14:59:09', 'updated_at' => '2025-09-27 14:59:09'],
            ['id' => 7, 'contrato_id' => 4, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-10-28 17:45:58', 'deleted_at' => null, 'created_at' => '2025-10-28 17:38:16', 'updated_at' => '2025-10-28 17:45:58'],
            ['id' => 8, 'contrato_id' => 4, 'usuario_id' => 7, 'aceito' => 1, 'dt_aceito' => '2025-10-28 17:44:50', 'deleted_at' => null, 'created_at' => '2025-10-28 17:38:16', 'updated_at' => '2025-10-28 17:44:50'],
            ['id' => 9, 'contrato_id' => 5, 'usuario_id' => 7, 'aceito' => 1, 'dt_aceito' => '2025-10-28 18:03:05', 'deleted_at' => null, 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 18:03:05'],
            ['id' => 10, 'contrato_id' => 5, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-10-28 18:03:45', 'deleted_at' => null, 'created_at' => '2025-10-28 17:56:22', 'updated_at' => '2025-10-28 18:03:45'],
            ['id' => 11, 'contrato_id' => 6, 'usuario_id' => 8, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 11:34:10', 'updated_at' => '2025-10-29 11:34:10'],
            ['id' => 12, 'contrato_id' => 6, 'usuario_id' => 6, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 11:34:10', 'updated_at' => '2025-10-29 11:34:10'],
            ['id' => 13, 'contrato_id' => 7, 'usuario_id' => 7, 'aceito' => 1, 'dt_aceito' => '2025-10-29 11:59:07', 'deleted_at' => null, 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 11:59:07'],
            ['id' => 14, 'contrato_id' => 7, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-10-29 12:00:02', 'deleted_at' => null, 'created_at' => '2025-10-29 11:49:09', 'updated_at' => '2025-10-29 12:00:02'],
            ['id' => 15, 'contrato_id' => 8, 'usuario_id' => 12, 'aceito' => 1, 'dt_aceito' => '2025-10-29 23:01:30', 'deleted_at' => null, 'created_at' => '2025-10-29 22:47:05', 'updated_at' => '2025-10-29 23:01:30'],
            ['id' => 16, 'contrato_id' => 8, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-10-29 22:58:46', 'deleted_at' => null, 'created_at' => '2025-10-29 22:47:05', 'updated_at' => '2025-10-29 22:58:46'],
            ['id' => 17, 'contrato_id' => 9, 'usuario_id' => 12, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 22:47:37', 'updated_at' => '2025-10-29 22:47:37'],
            ['id' => 18, 'contrato_id' => 9, 'usuario_id' => 6, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 22:47:37', 'updated_at' => '2025-10-29 22:47:37'],
            ['id' => 19, 'contrato_id' => 10, 'usuario_id' => 12, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:48:36'],
            ['id' => 20, 'contrato_id' => 10, 'usuario_id' => 6, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 22:48:36', 'updated_at' => '2025-10-29 22:48:36'],
            ['id' => 21, 'contrato_id' => 11, 'usuario_id' => 12, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 22:48:51', 'updated_at' => '2025-10-29 22:48:51'],
            ['id' => 22, 'contrato_id' => 11, 'usuario_id' => 6, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-10-29 22:48:51', 'updated_at' => '2025-10-29 22:48:51'],
            ['id' => 31, 'contrato_id' => 16, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-11-04 11:20:02', 'deleted_at' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:20:02'],
            ['id' => 32, 'contrato_id' => 16, 'usuario_id' => 12, 'aceito' => 1, 'dt_aceito' => '2025-11-04 11:17:50', 'deleted_at' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:17:50'],
            ['id' => 33, 'contrato_id' => 17, 'usuario_id' => 6, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:12:09'],
            ['id' => 34, 'contrato_id' => 17, 'usuario_id' => 12, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-04 11:12:09', 'updated_at' => '2025-11-04 11:12:09'],
            ['id' => 35, 'contrato_id' => 18, 'usuario_id' => 6, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-04 11:12:10', 'updated_at' => '2025-11-04 11:12:10'],
            ['id' => 36, 'contrato_id' => 18, 'usuario_id' => 12, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-04 11:12:10', 'updated_at' => '2025-11-04 11:12:10'],
            ['id' => 37, 'contrato_id' => 19, 'usuario_id' => 7, 'aceito' => 1, 'dt_aceito' => '2025-11-04 11:30:31', 'deleted_at' => null, 'created_at' => '2025-11-04 11:26:14', 'updated_at' => '2025-11-04 11:30:31'],
            ['id' => 38, 'contrato_id' => 19, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-11-04 11:31:24', 'deleted_at' => null, 'created_at' => '2025-11-04 11:26:14', 'updated_at' => '2025-11-04 11:31:24'],
            ['id' => 41, 'contrato_id' => 21, 'usuario_id' => 5, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-05 18:46:59', 'updated_at' => '2025-11-05 18:46:59'],
            ['id' => 42, 'contrato_id' => 21, 'usuario_id' => 4, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-05 18:46:59', 'updated_at' => '2025-11-05 18:46:59'],
            ['id' => 43, 'contrato_id' => 22, 'usuario_id' => 5, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-06 13:25:19', 'updated_at' => '2025-11-06 13:25:19'],
            ['id' => 44, 'contrato_id' => 22, 'usuario_id' => 4, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2025-11-06 13:25:19', 'updated_at' => '2025-11-06 13:25:19'],
            ['id' => 45, 'contrato_id' => 23, 'usuario_id' => 8, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:25:24', 'deleted_at' => null, 'created_at' => '2025-11-07 13:17:41', 'updated_at' => '2025-11-07 13:25:24'],
            ['id' => 46, 'contrato_id' => 23, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:24:45', 'deleted_at' => null, 'created_at' => '2025-11-07 13:17:42', 'updated_at' => '2025-11-07 13:24:45'],
            ['id' => 47, 'contrato_id' => 24, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:27:27', 'deleted_at' => null, 'created_at' => '2025-11-07 13:25:47', 'updated_at' => '2025-11-07 13:27:27'],
            ['id' => 48, 'contrato_id' => 24, 'usuario_id' => 8, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:28:03', 'deleted_at' => null, 'created_at' => '2025-11-07 13:25:48', 'updated_at' => '2025-11-07 13:28:03'],
            ['id' => 53, 'contrato_id' => 27, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:43:19', 'deleted_at' => null, 'created_at' => '2025-11-07 13:38:03', 'updated_at' => '2025-11-07 13:43:19'],
            ['id' => 54, 'contrato_id' => 27, 'usuario_id' => 8, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:42:38', 'deleted_at' => null, 'created_at' => '2025-11-07 13:38:03', 'updated_at' => '2025-11-07 13:42:38'],
            ['id' => 57, 'contrato_id' => 29, 'usuario_id' => 8, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:54:23', 'deleted_at' => null, 'created_at' => '2025-11-07 13:53:23', 'updated_at' => '2025-11-07 13:54:23'],
            ['id' => 58, 'contrato_id' => 29, 'usuario_id' => 6, 'aceito' => 1, 'dt_aceito' => '2025-11-07 13:54:46', 'deleted_at' => null, 'created_at' => '2025-11-07 13:53:23', 'updated_at' => '2025-11-07 13:54:46'],
            ['id' => 59, 'contrato_id' => 30, 'usuario_id' => 5, 'aceito' => 1, 'dt_aceito' => '2025-11-10 17:52:59', 'deleted_at' => null, 'created_at' => '2025-11-10 17:47:59', 'updated_at' => '2025-11-10 17:52:59'],
            ['id' => 60, 'contrato_id' => 30, 'usuario_id' => 4, 'aceito' => 1, 'dt_aceito' => '2025-11-10 17:53:36', 'deleted_at' => null, 'created_at' => '2025-11-10 17:47:59', 'updated_at' => '2025-11-10 17:53:36'],
            ['id' => 82, 'contrato_id' => 34, 'usuario_id' => 19, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-10 10:08:58', 'updated_at' => '2026-02-10 10:08:58'],
            ['id' => 83, 'contrato_id' => 34, 'usuario_id' => 14, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-10 10:08:58', 'updated_at' => '2026-02-10 10:08:58'],
            ['id' => 84, 'contrato_id' => 35, 'usuario_id' => 19, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-11 10:24:45', 'updated_at' => '2026-02-11 10:24:45'],
            ['id' => 85, 'contrato_id' => 35, 'usuario_id' => 14, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => '2026-02-12 09:37:48', 'created_at' => '2026-02-11 10:24:45', 'updated_at' => '2026-02-12 09:37:48']
        ];

        foreach ($data as $row) {
            DB::table('contrato_usuarios')->insert($row);
        }
    }
}
