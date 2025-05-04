import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../../config/AppConfig';
import Swal from 'sweetalert2';
import AuditLogTable from '../../AuditLogTable';

const EditRole = ({ role, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
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

        // Isi form dengan data role yang akan diedit
        if (role) {
            setFormData({
                name: role.name,
                is_active: role.is_active
            });
        }
    }, [role, token]);

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

        const roleData = {
            name: formData.name,
            is_active: formData.is_active,
        };

        setLoading(true);

        axios.put(AppConfig.API_URL + `/roles/${role.id}`, roleData)
            .then((response) => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Role has been updated successfully.',
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
                    text: error.response?.data?.message || 'Something went wrong while updating the role.',
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
                                            Updating...
                                        </>
                                    ) : (
                                        'Update'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Audit Log Table Section */}
            <div className="flex-fill" style={{ height: '100%' }}>
                <AuditLogTable tableName={"roles"} />
            </div>
        </div>
    );
};

export default EditRole;