import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppConfig from '../../config/AppConfig';
import AddCategory from '../../components/form/category/AddCategory';
import EditCategory from '../../components/form/category/EditCategory';
import Swal from 'sweetalert2';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  useEffect(() => {
    let sortedCategories = [...categories];

    if (sortConfig.key) {
      sortedCategories.sort((a, b) => {
        // Handle null values
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;

        // Handle metadata parsing for notes and tags
        if (sortConfig.key === 'metadata') {
          const aData = a.metadata ? JSON.parse(a.metadata) : {};
          const bData = b.metadata ? JSON.parse(b.metadata) : {};

          const aValue = aData.notes || aData.tags || '';
          const bValue = bData.notes || bData.tags || '';

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
        sortedCategories.reverse();
      }
    }

    // Apply search filter to sorted categories
    if (searchTerm) {
      sortedCategories = sortedCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCategories(sortedCategories);
  }, [sortConfig, categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/categories');
      setCategories(response.data.data);
      setFilteredCategories(response.data.data);
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

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${category.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(AppConfig.API_URL + `/categories/${category.id}`);
        Swal.fire(
          'Deleted!',
          'Your category has been deleted.',
          'success'
        );
        fetchCategories();
      } catch (err) {
        Swal.fire(
          'Error!',
          'Failed to delete category.',
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
      <h1 className="mb-4">Category List</h1>

      <div className="row mb-3">
        <div className="col-md-6">
          <button className="btn btn-primary" onClick={handleAddCategory}>
            Add Category
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
              placeholder="Search by name or description..."
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
                    onClick={() => requestSort('description')}
                    style={{ cursor: 'pointer' }}
                  >
                    Description {getSortIndicator('description')}
                  </th>
                  <th
                    scope="col"
                    onClick={() => requestSort('metadata')}
                    style={{ cursor: 'pointer' }}
                  >
                    Attribute {getSortIndicator('metadata')}
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
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <tr key={category.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{category.name}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <ul className="mb-0">
                          {category.metadata && (() => {
                            const categoryData = JSON.parse(category.metadata);
                            return (
                              <>
                                {categoryData.notes && <li>Note : {categoryData.notes}</li>}
                                {categoryData.tags && <li>Tag : {categoryData.tags}</li>}
                              </>
                            );
                          })()}
                        </ul>
                      </td>
                      <td>
                        <span className={`badge ${category.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      {searchTerm ? 'No categories matching your search criteria.' : 'No categories found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredCategories.length > 0 && (
            <div className="d-flex justify-content-end mt-3">
              <p>Showing {filteredCategories.length} of {categories.length} categories</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal AddCategory */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Category</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <AddCategory
                  onSuccess={() => {
                    fetchCategories();
                    setShowAddModal(false);
                  }}
                  onClose={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedCategory && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <EditCategory
                  category={selectedCategory}
                  onSuccess={() => {
                    fetchCategories();
                    setShowEditModal(false);
                  }}
                  onClose={() => setShowEditModal(false)}
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