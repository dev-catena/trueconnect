<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SealRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seal_type_id',
        'status',
        'notes',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'analyst_feedback',
        'analyst_feedback_at',
        'user_response',
        'user_response_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'analyst_feedback_at' => 'datetime',
        'user_response_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sealType()
    {
        return $this->belongsTo(SealType::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function documents()
    {
        return $this->hasMany(SealDocument::class);
    }
}
