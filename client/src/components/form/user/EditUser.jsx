import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppConfig from '../../../config/AppConfig';
import AuditLogTable from '../../AuditLogTable';

const EditUser = ({ user, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        role_id: '',
        is_active: true,
        change_password: false
    });

    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchRoles();
        }

        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                confirm_password: '',
                role_id: user.role_id,
                is_active: user.is_active,
                change_password: false
            });
        }
    }, [token, user]);

    useEffect(() => {
        // Validate form whenever formData or errors change
        const hasErrors = Object.values(errors).some(error => error);
        const requiredFieldsFilled = 
            formData.username.trim() && 
            formData.email.trim() && 
            formData.role_id;
        
        const isEmailValid = /^\S+@\S+\.\S+$/.test(formData.email);
        let passwordValid = true;
        
        if (formData.change_password) {
            passwordValid = formData.password && formData.password === formData.confirm_password;
        }
        
        setIsFormValid(requiredFieldsFilled && !hasErrors && isEmailValid && passwordValid);
    }, [formData, errors]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/roles');
            setRoles(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : (name === 'is_active' ? value === 'true' : value)
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (formData.change_password) {
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
        }

        if (!formData.role_id) newErrors.role_id = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                role_id: formData.role_id,
                is_active: formData.is_active
            };

            // Only include password if change_password is checked
            if (formData.change_password) {
                userData.password = formData.password;
            }

            await axios.put(`${AppConfig.API_URL}/users/${user.id}`, userData);

            Swal.fire({
                title: 'Success!',
                text: 'User has been updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                onSuccess();
                onClose();
            });
        } catch (error) {
            console.error('Error updating user:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update user',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='d-flex gap-4' style={{ height: '100%' }}>
            <div className="flex-fill" style={{ height: '100%', overflow: 'auto' }}>
                <div className="card h-100">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Username <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="username"
                                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email <span className="text-danger">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    name="change_password"
                                    className="form-check-input"
                                    checked={formData.change_password}
                                    onChange={handleChange}
                                    id="changePasswordCheck"
                                />
                                <label className="form-check-label" htmlFor="changePasswordCheck">
                                    Change Password
                                </label>
                            </div>

                            {formData.change_password && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">New Password <span className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            name="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                        />
                                        {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Role <span className="text-danger">*</span></label>
                                <select
                                    name="role_id"
                                    className={`form-control ${errors.role_id ? 'is-invalid' : ''}`}
                                    value={formData.role_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                {errors.role_id && <div className="invalid-feedback">{errors.role_id}</div>}
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
                                    ) : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Audit Log Table Section */}
            <div className="flex-fill" style={{ height: '100%' }}>
                <AuditLogTable tableName={"users"} />
            </div>
        </div>
    );
};

export default EditUser;