import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';

const RolePage = () => {
    const [roles, setRoles] = useState([]);
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

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Role List</h1>

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
                                {roles.length > 0 ? (roles.map((role, index) => (
                                    <tr key={role.id}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{role.name}</td>
                                        <td>
                                            <span className={`badge ${role.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                {role.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-info me-2">Edit</button>
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
        </div>
    );
};

export default RolePage;