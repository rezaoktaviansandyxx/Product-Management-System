import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import AppConfig from '../../../config/AppConfig';

const EditProduct = ({ product, onSuccess, onClose }) => {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serial_number: '',
        tags: '',
        supplier_id: '',
        category_id: '',
        price: '',
        stock: '',
        newAttachment: null,
        existingAttachment: null,
        is_active: true
    });

    // Additional states
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [filePreview, setFilePreview] = useState(null);

    const token = localStorage.getItem("token");

    // Initialize component
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch suppliers and categories
        const fetchData = async () => {
            try {
                const [suppliersRes, categoriesRes] = await Promise.all([
                    axios.get(AppConfig.API_URL + '/suppliers'),
                    axios.get(AppConfig.API_URL + '/categories')
                ]);
                setSuppliers(suppliersRes.data.data);
                setCategories(categoriesRes.data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();

        // Set initial form data when product prop changes
        if (product) {
            const specs = product.specifications ? JSON.parse(product.specifications) : {};
            setFormData({
                name: product.name,
                description: product.description,
                serial_number: specs.serial_number || '',
                tags: specs.tags || '',
                supplier_id: product.supplier?.id || '',
                category_id: product.category?.id || '',
                price: product.price,
                stock: product.stock,
                newAttachment: null,
                existingAttachment: product.attachments?.[0] || null,
                is_active: product.is_active
            });
        }
    }, [token, product]);

    // Validate form
    useEffect(() => {
        const hasErrors = Object.values(errors).some(error => error);
        const requiredFieldsFilled =
            formData.name.trim() &&
            formData.supplier_id &&
            formData.category_id &&
            formData.price && !isNaN(formData.price) &&
            formData.stock && !isNaN(formData.stock);
        setIsFormValid(requiredFieldsFilled && !hasErrors);
    }, [formData, errors]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'is_active' ? value === 'true' : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setFormData(prev => ({
                ...prev,
                newAttachment: null
            }));
            setFilePreview(null);
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            setErrors(prev => ({
                ...prev,
                newAttachment: 'Only PDF files are allowed.',
            }));
            setFormData(prev => ({
                ...prev,
                newAttachment: null,
            }));
            setFilePreview(null);
            return;
        }

        // Validate file size (100KB - 500KB)
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB < 100 || fileSizeKB > 500) {
            setErrors(prev => ({
                ...prev,
                newAttachment: 'File size must be between 100 KB and 500 KB.',
            }));
            setFormData(prev => ({
                ...prev,
                newAttachment: null,
            }));
            setFilePreview(null);
            return;
        }

        // If validations pass
        setErrors(prev => ({
            ...prev,
            newAttachment: '',
        }));

        setFormData(prev => ({
            ...prev,
            newAttachment: file,
        }));

        setFilePreview(file.name);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // Validate form
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.supplier_id) newErrors.supplier_id = "Supplier is required.";
        if (!formData.category_id) newErrors.category_id = "Category is required.";
        if (!formData.price || isNaN(formData.price)) newErrors.price = "Valid price is required.";
        if (!formData.stock || isNaN(formData.stock)) newErrors.stock = "Valid stock is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // 1. Prepare product data
            const productData = {
                name: formData.name,
                description: formData.description,
                specifications: {
                    serial_number: formData.serial_number,
                    tags: formData.tags,
                },
                supplier_id: formData.supplier_id,
                category_id: formData.category_id,
                price: formData.price,
                stock: formData.stock,
                is_active: formData.is_active,
            };

            // 2. Update product
            await axios.put(`${AppConfig.API_URL}/products/${product.id}`, productData);

            // 3. Handle attachments
            if (formData.newAttachment) {
                // Delete existing attachment if it exists
                if (formData.existingAttachment) {
                    try {
                        await axios.delete(
                            `${AppConfig.API_URL}/products/${product.id}/attachments/${formData.existingAttachment.id}`
                        );
                    } catch (error) {
                        console.error('Error deleting old attachment:', error);
                        // Continue even if deletion fails
                    }
                }

                // Upload new attachment
                const attachmentForm = new FormData();
                attachmentForm.append('file', formData.newAttachment);

                await axios.post(
                    `${AppConfig.API_URL}/products/${product.id}/attachments`,
                    attachmentForm,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            }

            // Show success message
            await Swal.fire({
                title: "Success",
                text: "Product updated successfully.",
                icon: "success",
                confirmButtonText: "OK"
            });

            // Refresh and close
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating product:", error);
            await Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Failed to update product.",
                icon: "error",
                confirmButtonText: "OK"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Product Name */}
            <div className="mb-3">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Description */}
            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            {/* Specifications */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Serial Number</label>
                    <input
                        type="text"
                        name="serial_number"
                        className="form-control"
                        value={formData.serial_number}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Tags</label>
                    <input
                        type="text"
                        name="tags"
                        className="form-control"
                        value={formData.tags}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Supplier and Category */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Supplier <span className="text-danger">*</span></label>
                    <select
                        name="supplier_id"
                        className={`form-control ${errors.supplier_id ? 'is-invalid' : ''}`}
                        value={formData.supplier_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Supplier --</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                    </select>
                    {errors.supplier_id && <div className="invalid-feedback">{errors.supplier_id}</div>}
                </div>
                <div className="col-md-6">
                    <label className="form-label">Category <span className="text-danger">*</span></label>
                    <select
                        name="category_id"
                        className={`form-control ${errors.category_id ? 'is-invalid' : ''}`}
                        value={formData.category_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
                </div>
            </div>

            {/* Price and Stock */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Price (Rp) <span className="text-danger">*</span></label>
                    <input
                        type="number"
                        name="price"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        value={formData.price}
                        onChange={handleChange}
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
                <div className="col-md-6">
                    <label className="form-label">Stock <span className="text-danger">*</span></label>
                    <input
                        type="number"
                        name="stock"
                        className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                        value={formData.stock}
                        onChange={handleChange}
                    />
                    {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>
            </div>

            {/* Current Attachment */}
            <div className="mb-3">
                <label className="form-label">Current Attachment</label>
                {formData.existingAttachment ? (
                    <div className="alert alert-info p-2 d-flex align-items-center">
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        {formData.existingAttachment.file_name}
                    </div>
                ) : (
                    <div className="alert alert-warning p-2">No attachment</div>
                )}
            </div>

            {/* New Attachment */}
            <div className="mb-3">
                <label className="form-label">
                    {formData.existingAttachment ? 'Replace Attachment' : 'Add Attachment'}
                </label>
                <input
                    type="file"
                    name="newAttachment"
                    className={`form-control ${errors.newAttachment ? 'is-invalid' : ''}`}
                    accept="application/pdf"
                    onChange={handleFileChange}
                />
                {filePreview && (
                    <div className="mt-2 text-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Selected file: {filePreview}
                    </div>
                )}
                {errors.newAttachment && <div className="invalid-feedback">{errors.newAttachment}</div>}
                <small className="text-muted">
                    {formData.existingAttachment
                        ? 'Leave empty to keep current attachment'
                        : 'PDF only (100KB-500KB)'}
                </small>
            </div>

            {/* Status */}
            <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                    name="is_active"
                    className="form-control"
                    value={formData.is_active.toString()}
                    onChange={handleChange}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Form Actions */}
            <div className="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !isFormValid}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Updating...
                        </>
                    ) : (
                        'Update'
                    )}
                </button>
            </div>
        </form>
    );
};

export default EditProduct;