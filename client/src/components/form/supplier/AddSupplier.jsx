import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../../config/AppConfig';
import Swal from 'sweetalert2';
import AuditLogTable from '../../AuditLogTable';

const AddSupplier = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
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
        const requiredFieldsFilled = 
            formData.name.trim() && 
            formData.address.trim() && 
            formData.phone.trim();
        
        const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,10}$/;
        const isPhoneValid = phoneRegex.test(formData.phone);
        
        setIsFormValid(requiredFieldsFilled && !hasErrors && isPhoneValid);
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

        if (!formData.address.trim()) {
            newErrors.address = "Address is required.";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required.";
        } else {
            const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,10}$/;
            if (!phoneRegex.test(formData.phone)) {
                newErrors.phone = "Phone number is invalid.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const supplierData = {
            name: formData.name,
            contact_info: {
                address: formData.address,
                phone: formData.phone,
            },
            is_active: formData.is_active,
        };

        setLoading(true);

        axios.post(AppConfig.API_URL + '/suppliers', supplierData)
            .then((response) => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Supplier has been added successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    onSuccess();
                    onClose();
                });

                // Reset form
                setFormData({
                    name: '',
                    address: '',
                    phone: '',
                    is_active: true
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Something went wrong while saving the supplier.',
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
                                <label className="form-label">
                                    Address <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    Phone <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
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
                <AuditLogTable tableName={"suppliers"} />
            </div>
        </div>
    );
};

export default AddSupplier;