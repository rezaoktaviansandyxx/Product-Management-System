<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesTableSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'Administrator', 'is_active' => true],
            ['name' => 'Manager', 'is_active' => true],
            ['name' => 'Staff', 'is_active' => true],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}