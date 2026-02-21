<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Ordem respeita dependências de chaves estrangeiras.
     */
    public function run(): void
    {
        $this->call([
            // Dados base (sem FKs)
            UsersSeeder::class,
            PlansSeeder::class,
            ContratoTiposSeeder::class,
            SelosSeeder::class,
            SealTypesSeeder::class,
            ParametrosSistemaSeeder::class,
            AdditionalPurchasePricesSeeder::class,
            FaqsSeeder::class,
            TestimonialsSeeder::class,
            SiteSettingsSeeder::class,
            ContactsSeeder::class,
            LoginHistorySeeder::class,
            // Usuários e relacionamentos
            UsuarioConexoesSeeder::class,
            ClausulasSeeder::class,
            ContratosSeeder::class,
            ContratoLogsSeeder::class,
            ContratoUsuariosSeeder::class,
            ContratoClausulasSeeder::class,
            ContratoUsuarioClausulasSeeder::class,
            ClausulaTipoContratoSeeder::class,
            PerguntasSeeder::class,
            ContratoUsuarioPerguntasSeeder::class,
            UsuarioSelosSeeder::class,
            UsuarioChaveSeeder::class,
            SubscriptionsSeeder::class,
            AdditionalPurchasesSeeder::class,
            SealRequestsSeeder::class,
            SealDocumentsSeeder::class,
            UserSealsSeeder::class,
        ]);
    }
}
