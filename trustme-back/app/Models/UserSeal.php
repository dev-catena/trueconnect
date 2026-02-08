<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seal_type_id',
        'status',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'expires_at',
        'validation_data'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
        'validation_data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sealType()
    {
        return $this->belongsTo(SealType::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
