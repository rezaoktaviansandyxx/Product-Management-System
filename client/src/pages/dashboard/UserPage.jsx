import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import axios from 'axios';
import AddUser from '../../components/form/user/AddUser';
import EditUser from '../../components/form/user/EditUser';
import Swal from 'sweetalert2';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/users');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
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
        // Menampilkan konfirmasi SweetAlert2
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
                // Mengirim request DELETE untuk menghapus user
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

    return (
        <div className="container mt-4">
            <h1 className="mb-4">User List</h1>

            <div className="mb-3 text-start">
                <button className="btn btn-primary" onClick={handleAddUser}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add User
                </button>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">No</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (users.map((user, index) => (
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
                                                onClick={() => handleDeleteUser(user)} // Panggil fungsi delete
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
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
                    <div className="modal-dialog">
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