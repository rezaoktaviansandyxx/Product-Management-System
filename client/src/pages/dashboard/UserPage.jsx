import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import axios from 'axios';
import AddUser from '../../components/form/user/AddUser';
import EditUser from '../../components/form/user/EditUser';
import Swal from 'sweetalert2';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'username',
        direction: 'ascending'
    });
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        fetchUsers();
    }, [token]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.role_name && user.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    useEffect(() => {
        let sortedUsers = [...users];

        if (sortConfig.key) {
            sortedUsers.sort((a, b) => {
                // Handle role_name separately
                if (sortConfig.key === 'role_name') {
                    const aRole = a.role_name || '';
                    const bRole = b.role_name || '';
                    return aRole.localeCompare(bRole);
                }

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
                sortedUsers.reverse();
            }
        }

        // Apply search filter to sorted users
        if (searchTerm) {
            sortedUsers = sortedUsers.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.role_name && user.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredUsers(sortedUsers);
    }, [sortConfig, users, searchTerm]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true); // start loading
            const response = await axios.get(AppConfig.API_URL + '/users');
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false); // stop loading
        }
    };

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async (user) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${user.username}". This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(AppConfig.API_URL + `/users/${user.id}`);
                Swal.fire(
                    'Deleted!',
                    'The user has been deleted.',
                    'success'
                );
                fetchUsers();
            } catch (err) {
                Swal.fire(
                    'Error!',
                    'Failed to delete user.',
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
            <h1 className="mb-4">User List</h1>

            <div className="row mb-3">
                <div className="col-md-6">
                    <button className="btn btn-primary" onClick={handleAddUser} disabled={isLoading}>
                        Add User
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
                            placeholder="Search by name, email or role..."
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
                                        onClick={() => requestSort('username')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Name {getSortIndicator('username')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('email')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Email {getSortIndicator('email')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('role_name')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Role {getSortIndicator('role_name')}
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
                                { isLoading ? (
                                    <tr>    
                                        <td colSpan="6" className="text-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <tr key={user.id}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role_name ? user.role_name : '-'}</td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info me-2"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            {searchTerm ? 'No users matching your search criteria.' : 'No users found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length > 0 && (
                        <div className="d-flex justify-content-end mt-3">
                            <p>Showing {filteredUsers.length} of {users.length} users</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New User</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <AddUser
                                    onSuccess={() => {
                                        fetchUsers();
                                        handleCloseModal();
                                    }}
                                    onClose={handleCloseModal}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <EditUser
                                    user={selectedUser}
                                    onSuccess={() => {
                                        fetchUsers();
                                        handleCloseModal();
                                    }}
                                    onClose={handleCloseModal}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;