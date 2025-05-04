<?php

namespace App\Http\Controllers;

use App\Exports\SupplierExport;
use App\Imports\SupplierImport;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::with(['products', 'deletedBy']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $suppliers = $query->paginate($request->per_page ?? 20);

        return response()->json($suppliers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'contact_info' => 'required',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $contact_info = $request->contact_info;
        if (is_array($contact_info)) {
            $contact_info = json_encode($contact_info);
        }

        try {
            $supplier = Supplier::create([
                'name' => $request->name,
                'contact_info' => $contact_info,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully!',
                'data' => $supplier
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        return response()->json($supplier->load(['products', 'deletedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'contact_info' => 'sometimes|required',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only(['name', 'is_active']);

            // Handle contact_info update
            if ($request->has('contact_info')) {
                $contact_info = $request->contact_info;
                if (is_array($contact_info)) {
                    $contact_info = json_encode($contact_info);
                }
                $updateData['contact_info'] = $contact_info;
            }

            $supplier->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully!',
                'data' => $supplier
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        if ($supplier->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete supplier with associated products.'
            ], 422);
        }

        $supplier->delete();
        $supplier->deleted_by = auth()->user()->id;
        $supplier->save();

        return response()->json([
            'message' => 'Supplier deleted successfully!'
        ]);
    }

    public function restore($id)
    {
        try {
            $supplier = Supplier::withTrashed()->findOrFail($id);

            if (!$supplier->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Supplier is not deleted and cannot be restored.'
                ], 400);
            }

            $supplier->restore();

            return response()->json([
                'success' => true,
                'message' => 'Supplier has been successfully restored.',
                'data' => $supplier
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import suppliers from Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:2048'
        ]);

        try {
            $import = new SupplierImport();
            Excel::import($import, $request->file('file'));

            return response()->json([
                'message' => 'Suppliers imported successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error importing suppliers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export suppliers to Excel
     */
    public function export(): BinaryFileResponse
    {
        $datetime = now()->format('Ymd_His');
        return Excel::download(new SupplierExport(), "{$datetime}_suppliers.xlsx");
    }
}
