<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestimonialsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'name' => 'João Silva', 'company' => 'TechCorp Ltda', 'content' => 'O TrueConnect Me dá hoje tranquilidade para estabelecer relações sem medo se desacordos e processos indevidos contra mim', 'avatar' => null, 'rating' => 5, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 01:52:13'],
            ['id' => 2, 'name' => 'Maria Santos', 'company' => 'Inovação Digital', 'content' => 'Excelente plataforma! Faltava mesmo uma forma de ter essa tranquilidade que a plataforma nos trouxe', 'avatar' => null, 'rating' => 5, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 01:52:50'],
            ['id' => 3, 'name' => 'Pedro Oliveira', 'company' => 'StartupXYZ', 'content' => 'Já tive problemas com ex-parceiros e hoje me sinto mais a vontade.', 'avatar' => null, 'rating' => 4, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 01:53:29'],
            ['id' => 4, 'name' => 'Ana Costa', 'company' => 'E-commerce Plus', 'content' => 'Excelente ideia! como foi bom contar com vocês', 'avatar' => null, 'rating' => 5, 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 01:54:09']
        ];

        foreach ($data as $row) {
            DB::table('testimonials')->insert($row);
        }
    }
}
