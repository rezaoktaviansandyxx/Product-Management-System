<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;

class ProductExport implements FromCollection, WithHeadings, WithMapping
{

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Product::with(['category', 'supplier'])->get();
    }

    public function headings(): array
    {
        return [
            'Id',
            'Name',
            'Description',
            'Serial Number',
            'Tag',
            'Price',
            'Stock',
            'Category ID',
            'Category Name',
            'Supplier ID',
            'Supplier Name',
            'Is Active'
        ];
    }

    public function map($product): array
    {
        // Parse specifications jika ada
        $specifications = json_decode($product->specifications, true);

        return [
            $product->id,
            $product->name,
            $product->description,
            $specifications['serial_number'] ?? '',
            $specifications['tags'] ?? '',
            $product->price,
            $product->stock,
            $product->category->is_active == true ? $product->category_id : '',
            $product->category->is_active == true ? $product->category->name : '',
            $product->supplier->is_active == true ? $product->supplier_id : '',
            $product->supplier->is_active == true ? $product->supplier->name : '',
            $product->is_active ? 'Active' : 'Inactive'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet->getStyle('A1:' . $event->sheet->getHighestColumn() . '1')->applyFromArray([
                    'font' => [
                        'bold' => true
                    ]
                ]);
            }
        ];
    }
}
