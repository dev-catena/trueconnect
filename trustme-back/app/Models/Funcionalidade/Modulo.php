<?php

namespace App\Models\Funcionalidade;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Modulo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'modulo';
    protected $fillable = ['URL', 'caminho_img', 'ordem', 'nome'];
    protected $casts = ['deleted_at' => 'datetime'];

    public function funcionalidades(): HasMany
    {
        return $this->hasMany(Funcionalidade::class, 'modulo_id', 'id');
    }
}
