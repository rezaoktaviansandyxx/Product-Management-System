<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, UsesUuid, Auditable;

    protected $fillable = [
        'name', 'description', 'specifications', 'price', 'stock', 
        'category_id', 'supplier_id', 'is_active'
    ];

    protected $casts = [
        'specifications' => 'array',
        'is_active' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function attachments()
    {
        return $this->hasMany(ProductAttachment::class);
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
