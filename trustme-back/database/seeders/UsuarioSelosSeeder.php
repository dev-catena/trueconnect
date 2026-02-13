<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioSelosSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'selo_id' => 1, 'usuario_id' => 1, 'verificado' => 1, 'obtido_em' => '2025-01-01 10:00:00', 'expira_em' => '2025-06-01 00:00:00', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 2, 'selo_id' => 1, 'usuario_id' => 2, 'verificado' => 0, 'obtido_em' => null, 'expira_em' => null, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 3, 'selo_id' => 1, 'usuario_id' => 3, 'verificado' => 0, 'obtido_em' => null, 'expira_em' => null, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 4, 'selo_id' => 2, 'usuario_id' => 1, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-06-01 00:00:00', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 5, 'selo_id' => 2, 'usuario_id' => 2, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-02-01 00:00:00', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 6, 'selo_id' => 2, 'usuario_id' => 3, 'verificado' => 1, 'obtido_em' => '2025-01-01 00:00:00', 'expira_em' => '2025-02-01 00:00:00', 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 7, 'selo_id' => 3, 'usuario_id' => 1, 'verificado' => 0, 'obtido_em' => null, 'expira_em' => null, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 8, 'selo_id' => 3, 'usuario_id' => 2, 'verificado' => 0, 'obtido_em' => null, 'expira_em' => null, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 9, 'selo_id' => 3, 'usuario_id' => 3, 'verificado' => 0, 'obtido_em' => null, 'expira_em' => null, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 10, 'selo_id' => 1, 'usuario_id' => 4, 'verificado' => 1, 'obtido_em' => '2025-09-25 21:59:12', 'expira_em' => '2026-09-20 21:59:12', 'deleted_at' => null, 'created_at' => '2025-09-25 21:59:12', 'updated_at' => '2025-09-25 21:59:12'],
            ['id' => 11, 'selo_id' => 1, 'usuario_id' => 6, 'verificado' => 1, 'obtido_em' => '2025-11-04 11:58:54', 'expira_em' => '2026-10-30 11:58:54', 'deleted_at' => null, 'created_at' => '2025-11-04 11:58:54', 'updated_at' => '2025-11-04 11:58:54']
        ];

        foreach ($data as $row) {
            DB::table('usuario_selos')->insert($row);
        }
    }
}
