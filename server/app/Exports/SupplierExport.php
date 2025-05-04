<?php

namespace App\Exports;

use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;

class SupplierExport implements FromCollection, WithHeadings, WithMapping
{

    public function collection()
    {
        return Supplier::all();
    }

    public function headings(): array
    {
        return [
            'No',
            'Name',
            'Address',
            'Phone',
            'Status'
        ];
    }

    public function map($supplier): array
    {
        // Parse contact_info jika ada
        $contact_info = json_decode($supplier->contact_info, true);
        return [
            $supplier->id, // atau nomor urut jika lebih prefer
            $supplier->name,
            $metadata['address'] ?? '', // asumsi note ada di metadata
            $metadata['phone'] ?? '',   // asumsi tag ada di metadata
            $supplier->is_active ? 'Active' : 'Inactive'
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
