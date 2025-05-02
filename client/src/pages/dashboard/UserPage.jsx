import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import axios from 'axios';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        fetchRoles();
    }, [token]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(AppConfig.API_URL + '/users');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">User List</h1>

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
                                        <td>{user.role_name}</td>
                                        <td>
                                            <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
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
                                        <td colSpan="6" className="text-center">No users found</td>
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

export default UserPage;