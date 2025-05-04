import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import AddSupplier from '../../components/form/supplier/AddSupplier';
import EditSupplier from '../../components/form/supplier/EditSupplier';
import Swal from 'sweetalert2';

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    fetchSuppliers();
  }, [token]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact_info && supplier.contact_info.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  useEffect(() => {
    let sortedSuppliers = [...suppliers];

    if (sortConfig.key) {
      sortedSuppliers.sort((a, b) => {
        // Handle contact_info separately as it's JSON
        if (sortConfig.key === 'address' || sortConfig.key === 'phone') {
          const aContact = parseContactInfo(a.contact_info);
          const bContact = parseContactInfo(b.contact_info);

          const aValue = aContact[sortConfig.key] || '';
          const bValue = bContact[sortConfig.key] || '';

          return aValue.toString().localeCompare(bValue.toString());
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
        sortedSuppliers.reverse();
      }
    }

    // Apply search filter to sorted suppliers
    if (searchTerm) {
      sortedSuppliers = sortedSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact_info && supplier.contact_info.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSuppliers(sortedSuppliers);
  }, [sortConfig, suppliers, searchTerm]);

  const parseContactInfo = (contactInfo) => {
    try {
      return JSON.parse(contactInfo || '{}');
    } catch {
      return {};
    }
  };

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true); // start loading
      const response = await axios.get(AppConfig.API_URL + '/suppliers');
      setSuppliers(response.data.data);
      setFilteredSuppliers(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false); // stop loading
    }
  };

  const handleAddSupplier = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = async (supplier) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${supplier.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(AppConfig.API_URL + `/suppliers/${supplier.id}`);
        Swal.fire(
          'Deleted!',
          'The supplier has been deleted.',
          'success'
        );
        fetchSuppliers();
      } catch (err) {
        Swal.fire(
          'Error!',
          'Failed to delete supplier.',
          'error'
        );
      }
    }
  };

  const handleExport = () => {
    axios.get(AppConfig.API_URL + '/suppliers/export', {
      responseType: 'blob'
    }).then((response) => {
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const datetime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${datetime}_suppliers.xlsx`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${AppConfig.API_URL}/suppliers/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire('Success', 'Data imported successfully!', 'success', { timer: 2000 });
      await fetchSuppliers(); // Refresh data
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        let htmlError = '';
        Object.entries(validationErrors).forEach(([row, errors]) => {
          htmlError += `<strong>Row ${row}:</strong><ul>`;
          errors.forEach(err => {
            htmlError += `<li>${err}</li>`;
          });
          htmlError += '</ul>';
        });

        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: htmlError,
          width: '600px',
        });
      } else {
        Swal.fire('Error', 'Failed to import data.', 'error');
      }
    } finally {
      e.target.value = ''; // Reset input file agar bisa upload file yang sama lagi
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
      <h1 className="mb-4">Supplier List</h1>

      <div className="row mb-3">
        <div className="col-md-6">
          <button className="btn btn-primary me-2" onClick={handleAddSupplier} disabled={isLoading}>
            Add Supplier
          </button>

          <button className="btn btn-success me-2" onClick={handleExport} disabled={isLoading}>
            Export
          </button>

          <label htmlFor="import" className={`btn btn-info me-2 ${isLoading ? 'disabled' : ''}`}>
            Import
            <input
              id="import"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => handleImport(e)}
              disabled={isLoading}
            />
          </label>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or contact info..."
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
                    onClick={() => requestSort('address')}
                    style={{ cursor: 'pointer' }}
                  >
                    Address {getSortIndicator('address')}
                  </th>
                  <th
                    scope="col"
                    onClick={() => requestSort('phone')}
                    style={{ cursor: 'pointer' }}
                  >
                    Phone {getSortIndicator('phone')}
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
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier, index) => {
                    const contactInfo = parseContactInfo(supplier.contact_info);
                    return (
                      <tr key={supplier.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{supplier.name}</td>
                        <td>{contactInfo.address || '-'}</td>
                        <td>{contactInfo.phone || '-'}</td>
                        <td>
                          <span className={`badge ${supplier.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {supplier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteSupplier(supplier)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      {searchTerm ? 'No suppliers matching your search criteria.' : 'No suppliers found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredSuppliers.length > 0 && (
            <div className="d-flex justify-content-end mt-3">
              <p>Showing {filteredSuppliers.length} of {suppliers.length} suppliers</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal AddSupplier */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Supplier</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <AddSupplier
                  onSuccess={() => {
                    fetchSuppliers();
                    setShowAddModal(false);
                  }}
                  onClose={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedSupplier && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Supplier</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
              </div>
              <div className="modal-body">
                <EditSupplier
                  supplier={selectedSupplier}
                  onSuccess={() => {
                    fetchSuppliers();
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

export default SupplierPage;