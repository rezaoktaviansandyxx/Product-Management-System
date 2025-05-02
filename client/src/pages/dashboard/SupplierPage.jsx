import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    fetchSuppliers();
  }, [token]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/suppliers');
      setSuppliers(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Supplier List</h1>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">No</th>
                  <th scope="col">Name</th>
                  <th scope="col">Contact Info</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length > 0 ? (suppliers.map((supplier, index) => (
                  <tr key={supplier.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{supplier.name}</td>
                    <td>
                      <ul>
                        {supplier.contact_info?.map((contact, index) => (
                          <li key={index}>{contact}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <span className={`badge ${supplier.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
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
                    <td colSpan="6" className="text-center">No supplier found</td>
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

export default SupplierPage;