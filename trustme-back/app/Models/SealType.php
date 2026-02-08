<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SealType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'requires_manual_approval',
        'is_active'
    ];

    protected $casts = [
        'requires_manual_approval' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function userSeals()
    {
        return $this->hasMany(UserSeal::class);
    }

    public function sealRequests()
    {
        return $this->hasMany(SealRequest::class);
    }
}
