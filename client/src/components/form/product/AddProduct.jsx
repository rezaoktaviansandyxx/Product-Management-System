import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import AppConfig from '../../../config/AppConfig';

const AddProduct = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serial_number: '',
        tags: '',
        supplier_id: '',
        category_id: '',
        price: '',
        stock: '',
        attachments: null,
        is_active: true
    });

    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch suppliers and categories
        axios.get(AppConfig.API_URL + '/suppliers').then(res => setSuppliers(res.data.data));
        axios.get(AppConfig.API_URL + '/categories').then(res => setCategories(res.data.data));
    }, [token]);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validasi tipe file
        if (file.type !== 'application/pdf') {
            setErrors(prev => ({
                ...prev,
                attachments: 'Only PDF files are allowed.',
            }));
            setFormData(prev => ({
                ...prev,
                attachments: null,
            }));
            return;
        }

        // Validasi ukuran file (antara 100 KB - 500 KB)
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB < 100 || fileSizeKB > 500) {
            setErrors(prev => ({
                ...prev,
                attachments: 'File size must be between 100 KB and 500 KB.',
            }));
            setFormData(prev => ({
                ...prev,
                attachments: null,
            }));
            return;
        }

        // Jika lolos semua validasi
        setErrors(prev => ({
            ...prev,
            attachments: '',
        }));

        setFormData(prev => ({
            ...prev,
            attachments: file,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.supplier_id) newErrors.supplier_id = "Supplier is required.";
        if (!formData.category_id) newErrors.category_id = "Category is required.";
        if (!formData.price || isNaN(formData.price)) newErrors.price = "Price is required.";
        if (!formData.stock || isNaN(formData.stock)) newErrors.stock = "Stock is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
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
            const response = await axios.post(AppConfig.API_URL + '/products', productData);

            // Pastikan `response.data` memiliki `id`
            if (!response.data.data.id) {
                throw new Error("Product ID not found.");
            }

            const productId = response.data.data.id;

            // 2. Upload attachment jika ada
            if (formData.attachments) {
                try {
                    const attachmentForm = new FormData();
                    attachmentForm.append('file', formData.attachments);

                    await axios.post(
                        `${AppConfig.API_URL}/products/${productId}/attachments`,
                        attachmentForm,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                } catch (attachmentError) {
                    console.error("Failed to upload attachment:", attachmentError);
                    throw new Error("Failed to upload attachment.");
                }
            }

            Swal.fire("Success", "Product and attachments added successfully.", "success").then(() => {
                onSuccess();
                onClose();
            });
        } catch (error) {
            console.error("Error when creating product:", error);
            Swal.fire(
                "Error",
                error.message || "Failed to add product or attachments.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} />
            </div>

            <div className="mb-3">
                <label className="form-label">Serial Number</label>
                <input name="serial_number" className="form-control" value={formData.serial_number} onChange={handleChange} />
            </div>

            <div className="mb-3">
                <label className="form-label">Tags</label>
                <input name="tags" className="form-control" value={formData.tags} onChange={handleChange} />
            </div>

            <div className="mb-3">
                <label className="form-label">Supplier</label>
                <select name="supplier_id" className={`form-control ${errors.supplier_id ? 'is-invalid' : ''}`} value={formData.supplier_id} onChange={handleChange}>
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                {errors.supplier_id && <div className="invalid-feedback">{errors.supplier_id}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Category</label>
                <select name="category_id" className={`form-control ${errors.category_id ? 'is-invalid' : ''}`} value={formData.category_id} onChange={handleChange}>
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Price</label>
                <input
                    type="number"
                    name="price"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    value={formData.price}
                    onChange={handleChange}
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Stock</label>
                <input
                    type="number"
                    name="stock"
                    className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                    value={formData.stock}
                    onChange={handleChange}
                />
                {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Attachments</label>
                <input
                    type="file"
                    name="attachments"
                    className="form-control"
                    accept="application/pdf"
                    onChange={handleFileChange}
                />
                {errors.attachments && <div className="text-danger">{errors.attachments}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Status</label>
                <select name="is_active" className="form-control" value={formData.is_active.toString()} onChange={handleChange}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <button type="submit" className="btn btn-success" disabled={loading || !isFormValid}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Loading...</> : 'Submit'}
            </button>
        </form>
    );
};

export default AddProduct;