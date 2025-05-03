import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../../config/AppConfig';
import Swal from 'sweetalert2';

const EditSupplier = ({ supplier, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        is_active: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Isi form dengan data supplier yang akan diedit
        if (supplier) {
            const contactInfoData = JSON.parse(supplier.contact_info || '{}');

            setFormData({
                name: supplier.name,
                address: contactInfoData.address || '',
                phone: contactInfoData.phone || '',
                is_active: supplier.is_active
            });
        }
    }, [token, supplier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'is_active' ? value === 'true' : value,
        }));

        // Hapus error saat user mengetik
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

        axios.put(`${AppConfig.API_URL}/suppliers/${supplier.id}`, supplierData)
            .then((response) => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Supplier has been updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    onSuccess();
                    onClose();
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong while updating the supplier.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
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
                <label className="form-label">Address</label>
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
                <label className="form-label">Phone</label>
                <input
                    type="text"
                    name="phone"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
            <div className="mb-3">
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
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

export default EditSupplier;