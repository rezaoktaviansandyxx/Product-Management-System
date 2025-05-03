import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import AddSupplier from '../../components/form/AddSupplier';

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleAddSupplier = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Supplier List</h1>

      <div className="mb-3 text-start">
        <button className="btn btn-primary" onClick={handleAddSupplier}>
          Add Supplier
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
                  <th scope="col">Address</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length > 0 ? (
                  suppliers.map((supplier, index) => {
                    const parsedContactInfo = (() => {
                      try {
                        return JSON.parse(supplier.contact_info || '{}');
                      } catch {
                        return {};
                      }
                    })();

                    return (
                      <tr key={supplier.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{supplier.name}</td>
                        <td>{parsedContactInfo.address || '-'}</td>
                        <td>{parsedContactInfo.phone || '-'}</td>
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
                    );

                  })
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

      {/* Modal AddSuplier */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Supplier</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <AddSupplier
                  onSuccess={() => {
                    fetchSuppliers();  // Refresh list
                    setShowAddModal(false); // Tutup modal
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

export default SupplierPage;