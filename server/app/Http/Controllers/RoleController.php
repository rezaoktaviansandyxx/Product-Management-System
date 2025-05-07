<?php

namespace App\Http\Controllers;

use App\Exports\RoleExport;
use App\Imports\RoleImport;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Role::with(['users']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $roles = $query->paginate($request->per_page ?? 20);

        return response()->json($roles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:roles',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::create([
            'name' => $request->name,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully!',
            'data' => $role
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        return response()->json($role->load(['users', 'deletedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100|unique:roles,name,' . $role->id,
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $role->update($request->only(['name', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully!',
            'data' => $role
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete role with associated users'
            ], 422);
        }

        $role->delete();
        $role->deleted_by = auth()->user()->id;
        $role->save();

        return response()->json([
            'message' => 'Role deleted successfully!'
        ]);
    }

    public function restore($id)
    {
        $role = Role::withTrashed()->findOrFail($id);
        $role->restore();

        return response()->json([
            'success' => true,
            'message' => 'Role restored successfully!',
            'data' => $role
        ]);
    }

    public function deleted()
    {
        $deleteRoles = Role::onlyTrashed()->get();
        return response()->json($deleteRoles);
    }

    /**
     * Import roles from Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:2048'
        ]);

        try {
            $import = new RoleImport();
            Excel::import($import, $request->file('file'));

            return response()->json([
                'message' => 'Roles imported successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error importing roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export roles to Excel
     */
    public function export(): BinaryFileResponse
    {
        $datetime = now()->format('Ymd_His');
        return Excel::download(new RoleExport(), "{$datetime}_roles.xlsx");
    }
}
