<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier', 'attachments', 'deletedBy']);

        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $products = $query->paginate($request->per_page ?? 20);

        return response()->json($products);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'specifications' => 'nullable|json',
            'price' => 'required|numeric|min:0',
            'stock' => 'integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'is_available' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'specifications' => json_decode($request->specifications, true) ?? [],
            'price' => $request->price,
            'stock' => $request->stock ?? 0,
            'category_id' => $request->category_id,
            'supplier_id' => $request->supplier_id,
            'is_available' => $request->is_available ?? true
        ]);

        return response()->json([
            'message' => 'Product created successfully!',
            'data' => $product->load(['category', 'supplier'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'supplier', 'attachments', 'deletedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'specifications' => 'nullable|json',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'is_available' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only([
            'name',
            'description',
            'price',
            'stock',
            'category_id',
            'supplier_id',
            'is_available'
        ]);

        if ($request->has('specifications')) {
            $updateData['specifications'] = json_decode($request->specifications, true);
        }

        $product->update($updateData);

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $product->load(['category', 'supplier'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        $product->deleted_by = auth()->user()->id;
        $product->save();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return response()->json([
            'message' => 'Product restored successfully!',
            'data' => $product->load(['category', 'supplier'])
        ]);
    }
}
