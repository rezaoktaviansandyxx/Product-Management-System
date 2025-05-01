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
            'subcategories' => 'nullable|json',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'subcategories' => $request->subcategories,
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
            'subcategories' => 'nullable|json',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Update category
        $category->update($request->only(['name', 'description', 'subcategories', 'is_active']));

        // Return success message along with updated category data
        return response()->json([
            'message' => 'Category updated successfully!',
            'data' => $category
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
