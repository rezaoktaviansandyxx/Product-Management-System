<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductAttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Product $product)
    {
        $attachments = $product->attachments()->with('uploadedBy')->get();
        return response()->json($attachments);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf|min:100|max:500',
            'is_primary' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $file = $request->file('file');
        $path = $file->store('product_attachments');

        $attachment = ProductAttachment::create([
            'product_id' => $product->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
            'is_primary' => $request->is_primary ?? false,
            'uploaded_by' => auth()->id()
        ]);

        return response()->json([
            'message' => 'File uploaded successfully.',
            'data' => $attachment->load('uploadedBy')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product, ProductAttachment $attachment)
    {
        if ($attachment->product_id !== $product->id) {
            return response()->json(['message' => 'Attachment not found for this product'], 404);
        }

        return response()->json($attachment->load('uploadedBy'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product, ProductAttachment $attachment)
    {
        if ($attachment->product_id !== $product->id) {
            return response()->json([
                'message' => 'The specified attachment does not belong to this product.'
            ], 404);
        }

        Storage::delete($attachment->file_path);
        $attachment->delete();

        return response()->json([
            'message' => 'Attachment deleted successfully.'
        ]);
    }

    public function download(Product $product, ProductAttachment $attachment)
    {
        if ($attachment->product_id !== $product->id) {
            return response()->json(['message' => 'Attachment not found for this product'], 404);
        }

        if (!Storage::exists($attachment->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::download($attachment->file_path, $attachment->file_name);
    }
}
