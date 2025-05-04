<?php

namespace App\Exports;

use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;

class SupplierExport implements FromCollection, WithHeadings, WithMapping
{
    private $index = 0;

    public function collection()
    {
        return Supplier::all();
    }

    public function headings(): array
    {
        return [
            'Id',
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
            $supplier->id,
            $supplier->name,
            $contact_info['address'] ?? '', // asumsi note ada di contact_info
            $contact_info['phone'] ?? '',   // asumsi tag ada di contact_info
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
