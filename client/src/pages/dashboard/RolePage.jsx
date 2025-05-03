import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import AddRole from '../../components/form/role/AddRole';
import EditRole from '../../components/form/role/EditRole';

const RolePage = () => {

    const [roles, setRoles] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        fetchRoles();
    }, [token]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/roles');
            setRoles(response.data.data);
        } catch (err) {
            console.error(err);
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

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Role List</h1>

            <div className="mb-3 text-start">
                <button className="btn btn-primary" onClick={handleAddRole}>
                    Add Role
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
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length > 0 ? (
                                    roles.map((role, index) => (
                                        <tr key={role.id}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{role.name}</td>
                                            <td>
                                                <span className={`badge ${role.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {role.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info me-2"
                                                    onClick={() => handleEditRole(role)}
                                                >
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-danger">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No roles found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal AddRole */}
            {showAddModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Role</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <AddRole
                                    onSuccess={() => {
                                        fetchRoles();  // Refresh list
                                        setShowAddModal(false); // Tutup modal
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
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Role</h5>
                                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
                            </div>
                            <div className="modal-body">
                                <EditRole
                                    role={selectedRole}
                                    onSuccess={() => {
                                        fetchRoles();  // Refresh list
                                        handleCloseEditModal(); // Tutup modal
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