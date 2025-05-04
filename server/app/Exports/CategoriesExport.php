<?php

namespace App\Exports;

use App\Models\Category;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;

class CategoriesExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Category::all();
    }

    public function headings(): array
    {
        return [
            'Id',
            'Name',
            'Description',
            'Note',
            'Tag',
            'Status'
        ];
    }

    public function map($category): array
    {
        // Parse metadata jika ada
        $metadata = json_decode($category->metadata, true);

        return [
            $category->id,
            $category->name,
            $category->description,
            $metadata['note'] ?? '',
            $metadata['tags'] ?? '',
            $category->is_active ? 'Active' : 'Inactive'
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
