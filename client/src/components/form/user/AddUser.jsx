import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppConfig from '../../../config/AppConfig';

const AddUser = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '', // akan tetap dipakai untuk hardcode
        role_id: '',
        is_active: true
    });

    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchRoles();
        }
    }, [token]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/roles');
            setRoles(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'password') {
            setFormData({
                ...formData,
                password: value,
                confirm_password: value // hardcode confirm_password agar selalu sama
            });
        } else {
            setFormData({
                ...formData,
                [name]: name === 'is_active' ? value === 'true' : value
            });
        }

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
        if (!formData.password) newErrors.password = 'Password is required';
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
                password: formData.password,
                role_id: formData.role_id,
                is_active: formData.is_active
            };

            await axios.post(AppConfig.API_URL + '/users', userData);

            Swal.fire({
                title: 'Success!',
                text: 'User has been created successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                onSuccess();
                onClose();
            });
        } catch (error) {
            console.error('Error creating user:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to create user',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
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

            <div className="mb-3">
                <label className="form-label">Password <span className="text-danger">*</span></label>
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
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating...
                        </>
                    ) : 'Create'}
                </button>
            </div>
        </form>
    );
};

export default AddUser;