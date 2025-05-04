import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import AddRole from '../../components/form/role/AddRole';
import EditRole from '../../components/form/role/EditRole';
import Swal from 'sweetalert2';

const RolePage = () => {
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'ascending'
    });
    const [userRoleName, setUserRoleName] = useState('');
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserRole();
        }

        fetchRoles();
    }, [token]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredRoles(roles);
            return;
        }

        const filtered = roles.filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredRoles(filtered);
    }, [searchTerm, roles]);

    useEffect(() => {
        let sortedRoles = [...roles];

        if (sortConfig.key) {
            sortedRoles.sort((a, b) => {
                // Handle boolean values (is_active)
                if (sortConfig.key === 'is_active') {
                    return a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1;
                }

                // Default string comparison
                if (typeof a[sortConfig.key] === 'string') {
                    return a[sortConfig.key].localeCompare(b[sortConfig.key]);
                }

                return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
            });

            if (sortConfig.direction === 'descending') {
                sortedRoles.reverse();
            }
        }

        // Apply search filter to sorted roles
        if (searchTerm) {
            sortedRoles = sortedRoles.filter(role =>
                role.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRoles(sortedRoles);
    }, [sortConfig, roles, searchTerm]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/roles');
            setRoles(response.data.data);
            setFilteredRoles(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserRole = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/me');
            console.log(response);
            setUserRoleName(response.data.role_name);
        } catch (err) {
            console.error("Failed to fetch user role", err);
        }
    };

    const handleAddRole = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedRole(null);
    };

    const handleDeleteRole = async (role) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${role.name}". This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(AppConfig.API_URL + `/roles/${role.id}`);
                Swal.fire(
                    'Deleted!',
                    'The role has been deleted.',
                    'success'
                );
                fetchRoles();
            } catch (err) {
                Swal.fire(
                    'Error!',
                    'Failed to delete role.',
                    'error'
                );
            }
        }
    };

    // Sorting functionality
    const requestSort = (key) => {
        let direction = 'ascending';

        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({ key, direction });
    };

    // Search functionality
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Helper function to get sort indicator
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return '';
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Role List</h1>

            <div className="row mb-3">
                <div className="col-md-6">
                    <button className="btn btn-primary" onClick={handleAddRole}>
                        Add Role
                    </button>
                </div>
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => setSearchTerm('')}
                            >
                                <span>Clear</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">No</th>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('name')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Name {getSortIndicator('name')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('is_active')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Status {getSortIndicator('is_active')}
                                    </th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoles.length > 0 ? (
                                    filteredRoles.map((role, index) => (
                                        <tr key={role.id}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{role.name}</td>
                                            <td>
                                                <span className={`badge ${role.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {role.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {(role.name !== 'Administrator' || userRoleName === 'Administrator') && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-info me-2"
                                                            onClick={() => handleEditRole(role)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteRole(role)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            {searchTerm ? 'No roles matching your search criteria.' : 'No roles found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredRoles.length > 0 && (
                        <div className="d-flex justify-content-end mt-3">
                            <p>Showing {filteredRoles.length} of {roles.length} roles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal AddRole */}
            {showAddModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Role</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <AddRole
                                    onSuccess={() => {
                                        fetchRoles();
                                        setShowAddModal(false);
                                    }}
                                    onClose={handleCloseModal}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedRole && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Role</h5>
                                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
                            </div>
                            <div className="modal-body">
                                <EditRole
                                    role={selectedRole}
                                    onSuccess={() => {
                                        fetchRoles();
                                        handleCloseEditModal();
                                    }}
                                    onClose={handleCloseEditModal}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolePage;