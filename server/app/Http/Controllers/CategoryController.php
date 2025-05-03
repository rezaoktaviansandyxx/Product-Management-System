<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::with(['deletedBy']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $categories = $query->paginate($request->per_page ?? 20);

        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $metadata = $request->metadata;
        if (is_array($metadata)) {
            $metadata = json_encode($metadata);
        }

        $category = Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'metadata' => $metadata,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'message' => 'Category created successfully!',
            'data' => $category
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category->load(['deletedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Prepare data for update
        $updateData = $request->only(['name', 'description', 'is_active']);

        // Handle metadata update
        if ($request->has('metadata')) {
            $metadata = $request->metadata;
            if (is_array($metadata)) {
                $metadata = json_encode($metadata);
            }
            $updateData['metadata'] = $metadata;
        }

        // Update category
        $category->update($updateData);

        // Return success message along with updated category data
        return response()->json([
            'message' => 'Category updated successfully!',
            'data' => $category->fresh() // fresh() untuk mengambil data terbaru dari database
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        $category->delete_by = auth()->user()->id;
        $category->save();

        return response()->json([
            'message' => 'Category deleted successfully!'
        ]);
    }

    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return response()->json([
            'message' => 'Category restored successfully!',
            'data' => $category
        ]);
    }
}
