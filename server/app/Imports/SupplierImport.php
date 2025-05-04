<?php

namespace App\Imports;

use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class SupplierImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Supplier([
            'name'         => $this->validateName($row['name'] ?? ''),
            'contact_info' => $this->prepareContactInfo($row),
            'is_active'    => $this->parseBooleanStatus($row['is_active'] ?? true),
        ]);
    }

    private function prepareContactInfo(array $row): string
    {
        $contactInfo = [
            'phone' => $this->validatePhone($row['phone'] ?? ''),
            'address' => $this->validateAddress($row['address'] ?? '')
        ];

        return json_encode($contactInfo);
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
        $name = trim($name);
        if (empty($name)) {
            throw new \Exception('Supplier name cannot be empty');
        }

        return $name;
    }

    private function validatePhone(string $phone): string
    {
        $phone = trim($phone);
        if (empty($phone)) {
            throw new \Exception('Phone number cannot be empty');
        }

        return $phone;
    }

    private function validateAddress(string $address): string
    {
        $address = trim($address);
        if (empty($address)) {
            throw new \Exception('Address cannot be empty');
        }

        return $address;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
            'address' => 'required|string',
            'is_active' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    $valid = is_bool($value) ||
                        in_array(strtoupper($value), ['TRUE', 'FALSE', '1', '0',]);
                    if (!$valid) {
                        $fail('The status must be a boolean (TRUE/FALSE) or 1/0');
                    }
                }
            ],
        ];
    }

    public function customValidationMessages()
    {
        return [
            'name.required' => 'Supplier name is required',
            'phone.required' => 'Phone number is required',
            'address.required' => 'Address is required',
            'is_active.*' => 'The status must be a boolean (TRUE/FALSE) or 1/0'
        ];
    }
}