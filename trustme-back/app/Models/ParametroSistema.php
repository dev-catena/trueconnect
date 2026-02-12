<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametroSistema extends Model
{
    protected $table = 'parametros_sistema';

    protected $fillable = ['chave', 'valor', 'descricao'];

    public static function getValor(string $chave, $default = null)
    {
        $p = self::where('chave', $chave)->first();
        return $p ? $p->valor : $default;
    }

    public static function getValorInt(string $chave, int $default = 0): int
    {
        $v = self::getValor($chave, (string) $default);
        return (int) $v;
    }

    public static function setValor(string $chave, string $valor, ?string $descricao = null): self
    {
        return self::updateOrCreate(
            ['chave' => $chave],
            ['valor' => $valor, 'descricao' => $descricao]
        );
    }
}
