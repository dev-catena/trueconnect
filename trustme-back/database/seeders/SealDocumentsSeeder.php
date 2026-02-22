<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SealDocumentsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 62, 'seal_request_id' => 40, 'document_type' => 'frente', 'file_path' => 'seal_documents/4ZviWNdDMhB5AbQQYkG3ISzXNrje1bAfEiDBkxjK.jpg', 'file_name' => 'A9EB83A5-4AAC-45F5-91E6-FC463518FAD9.jpg', 'mime_type' => 'image/jpeg', 'file_size' => 380126, 'notes' => null, 'created_at' => '2026-02-21 15:23:16', 'updated_at' => '2026-02-21 15:23:16'],
            ['id' => 63, 'seal_request_id' => 40, 'document_type' => 'verso', 'file_path' => 'seal_documents/FRSibF4fg5mGH0HLOhCyXFYGJ3luBw9ROVqv1UYA.jpg', 'file_name' => '852097FF-DF4C-4037-930A-B76E7F93FFC4.jpg', 'mime_type' => 'image/jpeg', 'file_size' => 669412, 'notes' => null, 'created_at' => '2026-02-21 15:23:16', 'updated_at' => '2026-02-21 15:23:16'],
            ['id' => 64, 'seal_request_id' => 40, 'document_type' => 'tras', 'file_path' => 'seal_documents/cMonG5CpsYBJvxMUylC4I8HMRl04OLfUzd62P5ci.png', 'file_name' => 'Imagem%20PNG%202.png', 'mime_type' => 'image/png', 'file_size' => 1526955, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 15:56:05', 'updated_at' => '2026-02-21 15:56:05'],
            ['id' => 65, 'seal_request_id' => 40, 'document_type' => 'frente', 'file_path' => 'seal_documents/kkNS0jm3H1VB9sYSXGgux0JuqHXlQcdppQ8pxVbs.pdf', 'file_name' => 'eb00002a.pdf', 'mime_type' => 'application/pdf', 'file_size' => 1797156, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 16:00:30', 'updated_at' => '2026-02-21 16:00:30'],
            ['id' => 66, 'seal_request_id' => 40, 'document_type' => 'frente', 'file_path' => 'seal_documents/EPCziy75BWP0crnOzMmldlpr6hLxgroywRP8zJAV.pdf', 'file_name' => 'Dede%CC%81.pdf.pdf', 'mime_type' => 'application/pdf', 'file_size' => 1714, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 16:01:53', 'updated_at' => '2026-02-21 16:01:53'],
            ['id' => 67, 'seal_request_id' => 41, 'document_type' => 'carteira_de_trabalho', 'file_path' => 'seal_documents/c21jDvInzrp5MSbKF9WdE4S7b9xNJPDMj69ratGB.pdf', 'file_name' => 'Folha2.pdf', 'mime_type' => 'application/pdf', 'file_size' => 696901, 'notes' => null, 'created_at' => '2026-02-21 16:05:54', 'updated_at' => '2026-02-21 16:05:54'],
            ['id' => 68, 'seal_request_id' => 41, 'document_type' => 'registro_profissional(oab,_cfm,etc)', 'file_path' => 'seal_documents/e4vNBE386SSmyw9sFZknKSHYIvBAFEOPbuIxL7a6.pdf', 'file_name' => 'Folha1.pdf', 'mime_type' => 'application/pdf', 'file_size' => 650337, 'notes' => null, 'created_at' => '2026-02-21 16:05:54', 'updated_at' => '2026-02-21 16:05:54'],
            ['id' => 69, 'seal_request_id' => 42, 'document_type' => 'carteira_de_trabalho', 'file_path' => 'seal_documents/CFRrV5FtFwwGvpuH7rPXI1rkRvXUMtGX5L4ELM5F.pdf', 'file_name' => 'Folha1.pdf', 'mime_type' => 'application/pdf', 'file_size' => 650337, 'notes' => null, 'created_at' => '2026-02-21 16:08:33', 'updated_at' => '2026-02-21 16:08:33'],
            ['id' => 70, 'seal_request_id' => 42, 'document_type' => 'registro_profissional(oab,_cfm,etc)', 'file_path' => 'seal_documents/7ppAIvwZcHjWootkjpGbKTnhqVmFxgJrtG6yBghG.jpg', 'file_name' => 'EB2D8746-CBFB-443E-9008-D6355A815B87.jpg', 'mime_type' => 'image/jpeg', 'file_size' => 629048, 'notes' => null, 'created_at' => '2026-02-21 16:08:33', 'updated_at' => '2026-02-21 16:08:33'],
            ['id' => 71, 'seal_request_id' => 42, 'document_type' => 'frente', 'file_path' => 'seal_documents/mpP4RHQwuTTD55YfQzMIF1vuYWX4nQBWEQemXQYu.png', 'file_name' => 'Imagem%20PNG.png', 'mime_type' => 'image/png', 'file_size' => 1416526, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 16:09:54', 'updated_at' => '2026-02-21 16:09:54'],
            ['id' => 72, 'seal_request_id' => 43, 'document_type' => 'certidão_de_nascimento', 'file_path' => 'seal_documents/ZKRAF9MOzmZXHhNRog4rGXLp5uw5HVjnxhz9qHok.jpg', 'file_name' => 'DCBD9039-358C-4B74-AF44-21056052AD4F.jpg', 'mime_type' => 'image/jpeg', 'file_size' => 915546, 'notes' => null, 'created_at' => '2026-02-21 16:23:08', 'updated_at' => '2026-02-21 16:23:08'],
            ['id' => 73, 'seal_request_id' => 43, 'document_type' => 'frente', 'file_path' => 'seal_documents/LUS7KpN6aUNhPCdxf9BCdVN4xlqoSCkmKZ420h9L.png', 'file_name' => 'Imagem%20PNG.png', 'mime_type' => 'image/png', 'file_size' => 1416526, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 16:33:45', 'updated_at' => '2026-02-21 16:33:45'],
            ['id' => 74, 'seal_request_id' => 43, 'document_type' => 'tras', 'file_path' => 'seal_documents/khEHxixQyBSdpGXMm5tp9ziTxVwonk0KGdzwXs1K.png', 'file_name' => 'Imagem%20PNG%202.png', 'mime_type' => 'image/png', 'file_size' => 1526955, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 16:33:45', 'updated_at' => '2026-02-21 16:33:45'],
            ['id' => 75, 'seal_request_id' => 44, 'document_type' => 'certidão_de_casamento', 'file_path' => 'seal_documents/ycjTWpeybKQyinDwIg02dfwyk8TMGpdXgFTPrQcO.jpg', 'file_name' => '2659e0d7-d517-4016-a2ff-d5f6831e2984.jpeg', 'mime_type' => 'image/jpeg', 'file_size' => 48256, 'notes' => null, 'created_at' => '2026-02-21 16:39:13', 'updated_at' => '2026-02-21 16:39:13'],
            ['id' => 76, 'seal_request_id' => 44, 'document_type' => 'tras', 'file_path' => 'seal_documents/1f1WjwAXrE99urgFcZDJJYya2SCQjKSaWgrtvdnk.jpg', 'file_name' => 'Screenshot_2026-02-17-20-20-17-055_host.exp.exponent.jpg', 'mime_type' => 'image/jpeg', 'file_size' => 259272, 'notes' => 'Complemento enviado pelo solicitante', 'created_at' => '2026-02-21 16:40:01', 'updated_at' => '2026-02-21 16:40:01'],
            ['id' => 77, 'seal_request_id' => 45, 'document_type' => 'declaração_pública_registrada', 'file_path' => 'seal_documents/oNLl78JN5SWcjwxRAfkdRgX0N4br4fq6jfOxN0d6.png', 'file_name' => '5a49274e-29b4-4ef4-9b61-85dcf0a13a96.png', 'mime_type' => 'image/png', 'file_size' => 1298073, 'notes' => null, 'created_at' => '2026-02-21 16:40:35', 'updated_at' => '2026-02-21 16:40:35'],
            ['id' => 78, 'seal_request_id' => 46, 'document_type' => 'certidão_de_nascimento', 'file_path' => 'seal_documents/nuUMvN5GE9DDoPb6HUbLqX3ZFcd912t7h8dp8al7.pdf', 'file_name' => 'ResultadodaProva-PSU2021-20201223144750.pdf', 'mime_type' => 'application/pdf', 'file_size' => 1199769, 'notes' => null, 'created_at' => '2026-02-21 16:41:46', 'updated_at' => '2026-02-21 16:41:46'],
            ['id' => 79, 'seal_request_id' => 47, 'document_type' => 'declaração_pública_registrada', 'file_path' => 'seal_documents/YuqbewAKPHSi1tQgxJWZOUZ6Jlh8yhNuunOZ3wZ0.pdf', 'file_name' => 'ROSANA.pdf', 'mime_type' => 'application/pdf', 'file_size' => 967757, 'notes' => null, 'created_at' => '2026-02-21 16:44:31', 'updated_at' => '2026-02-21 16:44:31']
        ];

        foreach ($data as $row) {
            DB::table('seal_documents')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
