<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('specifications')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('stock')->default(0);
            $table->uuid('category_id');
            $table->uuid('supplier_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->uuid('deleted_by')->nullable();
            
            $table->foreign('category_id')->references('id')->on('categories')
                ->onUpdate('restrict')->onDelete('restrict');
            $table->foreign('supplier_id')->references('id')->on('suppliers')
                ->onUpdate('restrict')->onDelete('restrict');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
