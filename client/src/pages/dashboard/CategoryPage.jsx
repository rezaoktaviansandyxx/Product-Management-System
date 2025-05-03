import React, { useEffect, useState } from 'react';

import axios from 'axios';
import AppConfig from '../../config/AppConfig';
import AddCategory from '../../components/form/AddCategory';

const CategoryPage = () => {

  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Category List</h1>

      <div className="mb-3 text-start">
        <button className="btn btn-primary" onClick={handleAddCategory}>
          Add Category
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
                  <th scope="col">Description</th>
                  <th scope="col">Note</th>
                  <th scope="col">Tag</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category, index) => {
                    const parsedMetadata = (() => {
                      try {
                        return JSON.parse(category.metadata || '{}');
                      } catch {
                        return {};
                      }
                    })();

                    return (
                      <tr key={category.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td>{parsedMetadata.notes || '-'}</td>
                        <td>{parsedMetadata.tags || '-'}</td>
                        <td>
                          <span className={`badge ${category.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
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
                    <td colSpan="7" className="text-center">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal AddCategory */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Category</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <AddCategory
                  onSuccess={() => {
                    fetchCategories();  // Refresh list
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

export default CategoryPage;