import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../../config/AppConfig';
import Swal from 'sweetalert2';
import AuditLogTable from '../../AuditLogTable';

const AddCategory = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        notes: '',
        tags: '',
        is_active: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    useEffect(() => {
        // Validate form whenever formData or errors change
        const hasErrors = Object.values(errors).some(error => error);
        const requiredFieldsFilled = formData.name.trim();
        setIsFormValid(requiredFieldsFilled && !hasErrors);
    }, [formData, errors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'is_active' ? value === 'true' : value,
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const categoryData = {
            name: formData.name,
            description: formData.description,
            metadata: {
                notes: formData.notes,
                tags: formData.tags,
            },
            is_active: formData.is_active,
        };

        setLoading(true);

        axios.post(AppConfig.API_URL + '/categories', categoryData)
            .then((response) => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Category has been added successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    onSuccess();
                    onClose();
                });

                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    notes: '',
                    tags: '',
                    is_active: true
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Something went wrong while saving the category.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className='d-flex gap-4' style={{ height: '100%' }}>
            <div className="flex-fill" style={{ height: '100%', overflow: 'auto' }}>
                <div className="card h-100">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    Name <span className="text-danger">*</span>
                                </label>
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
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Note</label>
                                <input
                                    type="text"
                                    name="notes"
                                    className="form-control"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    className="form-control"
                                    value={formData.tags}
                                    onChange={handleChange}
                                />
                            </div>
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
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Audit Log Table Section */}
            <div className="flex-fill" style={{ height: '100%' }}>
                <AuditLogTable tableName={"categories"} />
            </div>
        </div>
    );
};

export default AddCategory;