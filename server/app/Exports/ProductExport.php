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
            'No',
            'Name',
            'Description',
            'Serial Number',
            'Tag',
            'Price',
            'Stock',
            'Category ID',
            'Supplier ID',
            'Is Active'
        ];
    }

    public function map($product): array
    {
        // Parse metadata jika ada
        $specifications = json_decode($product->specifications, true);

        return [
            $product->id, // atau nomor urut jika lebih prefer
            $product->name,
            $product->description,
            $specifications['serial_number'] ?? '',
            $specifications['tags'] ?? '',
            $product->price,
            $product->stock,
            $product->category_id,
            $product->supplier_id,
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
