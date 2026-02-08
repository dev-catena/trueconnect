<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    protected $preferenceClient;

    public function __construct()
    {
        // Configuração do Mercado Pago
        MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));
        $this->preferenceClient = new PreferenceClient();
    }

    public function createPreference($data)
    {
        try {
            $preference = $this->preferenceClient->create($data);
            return $preference;
        } catch (MPApiException $e) {
            // Handle the API exception
            echo "Mercado Pago API Error: " . $e->getMessage();
            echo "Status Code: " . $e->getStatusCode();
            // You can also access other details like error details from the API response:
            Log::debug(\json_encode($e->getApiResponse()));
            throw new \Exception("Erro ao criar preferência no Mercado Pago: " . $e->getMessage() . json_encode($e->getApiResponse()->getContent()));
        } catch (\Exception $e) {
            echo "An unexpected error occurred: " . $e->getMessage();
            throw new \Exception("Erro ao criar preferência no Mercado Pago: " . $e->getMessage());
        }

        return null;
    }

    public function getPreference($id)
    {
        return $this->preferenceClient->get($id);
    }
}
