<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Product([
            'name'        => $this->validateName($row['name'] ?? ''),
            'description' => $row['description'] ?? null,
            'specifications' => $this->prepareSpecifications($row),
            'price'       => $this->validatePrice($row['price'] ?? ''),
            'stock'       => $this->validateStock($row['stock'] ?? ''),
            'category_id' => $this->validateCategoryId($row['category_id'] ?? ''),
            'supplier_id' => $this->validateSupplierId($row['supplier_id'] ?? ''),
            'is_active'   => $this->parseBooleanStatus($row['status'] ?? true),
        ]);
    }

    private function prepareSpecifications(array $row): ?string
    {
        $specifications = [];

        if (!empty($row['serial_number'])) {
            $specifications['serial_number'] = $row['serial_number'];
        }

        if (!empty($row['tag'])) {
            $specifications['tags'] = $row['tag'];
        }

        return !empty($specifications) ? json_encode($specifications) : null;
    }

    private function parseBooleanStatus($status): bool
    {
        if (is_bool($status)) {
            return $status;
        }

        if (is_string($status)) {
            return strtoupper($status) === 'TRUE';
        }

        if (is_numeric($status)) {
            return $status == 1;
        }

        return true;
    }

    private function validateName(string $name): string
    {
        if (empty(trim($name))) {
            throw new \Exception('Product name cannot be empty');
        }

        return $name;
    }

    private function validatePrice($price): float
    {
        // Handle jika nilai sudah numeric (misal dari Excel langsung sebagai float)
        if (is_numeric($price)) {
            return (float) $price;
        }

        // Handle jika berupa string (misal "300000" atau "300000.00")
        $price = trim($price);
        if (empty($price)) {
            throw new \Exception('Price cannot be empty');
        }

        // Bersihkan karakter selain digit dan titik desimal
        $cleanedPrice = preg_replace('/[^0-9.]/', '', $price);

        // Pastikan tidak ada lebih dari satu titik desimal
        if (substr_count($cleanedPrice, '.') > 1) {
            throw new \Exception('Invalid price format: multiple decimal points');
        }

        return (float) $cleanedPrice;
    }

    private function validateStock(string $stock): int
    {
        if (empty(trim($stock))) {
            throw new \Exception('Stock cannot be empty');
        }

        // Remove any non-numeric characters
        $stock = preg_replace('/[^0-9]/', '', $stock);

        return (int) $stock;
    }

    private function validateCategoryId(string $categoryId): string
    {
        if (empty(trim($categoryId))) {
            throw new \Exception('Category ID cannot be empty');
        }

        return $categoryId;
    }

    private function validateSupplierId(string $supplierId): string
    {
        if (empty(trim($supplierId))) {
            throw new \Exception('Supplier ID cannot be empty');
        }

        return $supplierId;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'tag' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|string|exists:categories,id',
            'supplier_id' => 'required|string|exists:suppliers,id',
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
            'price.required' => 'Price column must be filled',
            'stock.required' => 'Stock column must be filled',
            'category_id.required' => 'Category ID column must be filled',
            'supplier_id.required' => 'Supplier ID column must be filled',
            'status.*' => 'Status column must contain TRUE/FALSE or 1/0',
        ];
    }
}
