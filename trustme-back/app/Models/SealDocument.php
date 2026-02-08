<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SealDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'seal_request_id',
        'document_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'notes'
    ];

    public function sealRequest()
    {
        return $this->belongsTo(SealRequest::class);
    }
}
