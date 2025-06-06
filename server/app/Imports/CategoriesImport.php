<?php

namespace App\Imports;

use App\Models\Category;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CategoriesImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Category([
            'name'        => $this->validateName($row['name'] ?? ''),
            'description' => $row['description'] ?? null,
            'metadata'    => $this->prepareMetadata($row),
            'is_active'   => $this->parseBooleanStatus($row['status'] ?? true),
        ]);
    }

    private function prepareMetadata(array $row): ?string
    {
        $metadata = [];

        if (!empty($row['note'])) {
            $metadata['notes'] = $row['note'];
        }

        if (!empty($row['tag'])) {
            $metadata['tags'] = $row['tag'];
        }

        return !empty($metadata) ? json_encode($metadata) : null;
    }

    private function parseBooleanStatus($status): bool
    {
        // Handle if value is already boolean
        if (is_bool($status)) {
            return $status;
        }

        // Handle if value is string 'TRUE'/'FALSE'
        if (is_string($status)) {
            return strtoupper($status) === 'TRUE';
        }

        // Handle if value is numeric 1/0
        if (is_numeric($status)) {
            return $status == 1;
        }

        return true; // Default value
    }

    private function validateName(string $name): string
    {
        if (empty(trim($name))) {
            throw new \Exception('Category name cannot be empty');
        }

        return $name;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'note' => 'nullable|string',
            'tag' => 'nullable|string',
            'status' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    $valid = is_bool($value) ||
                        in_array(strtoupper($value), ['TRUE', 'FALSE', '1', '0']);

                    if (!$valid) {
                        $fail('Status format must be boolean (TRUE/FALSE) or 1/0');
                    }
                }
            ],
        ];
    }

    public function customValidationMessages()
    {
        return [
            'name.required' => 'Name column must be filled',
            'status.*' => 'Status column must contain TRUE/FALSE or 1/0',
        ];
    }
}