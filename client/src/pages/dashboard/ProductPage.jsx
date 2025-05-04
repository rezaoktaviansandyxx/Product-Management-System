import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import AddProduct from '../../components/form/product/AddProduct';
import EditProduct from '../../components/form/product/EditProduct';
import Swal from 'sweetalert2';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

    fetchProducts();
  }, [token]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplier && product.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    let sortedProducts = [...products];

    if (sortConfig.key) {
      sortedProducts.sort((a, b) => {
        // Handle null values
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;

        // Handle nested objects (supplier, category)
        if (sortConfig.key === 'supplier' && a.supplier && b.supplier) {
          return a.supplier.name.localeCompare(b.supplier.name);
        }

        if (sortConfig.key === 'category' && a.category && b.category) {
          return a.category.name.localeCompare(b.category.name);
        }

        // Handle numeric values
        if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
          return parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key]);
        }

        // Default string comparison
        if (typeof a[sortConfig.key] === 'string') {
          return a[sortConfig.key].localeCompare(b[sortConfig.key]);
        }

        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      });

      if (sortConfig.direction === 'descending') {
        sortedProducts.reverse();
      }
    }

    // Apply search filter to sorted products
    if (searchTerm) {
      sortedProducts = sortedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.supplier && product.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(sortedProducts);
  }, [sortConfig, products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/products');
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = (product) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${product.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${AppConfig.API_URL}/products/${product.id}`);

          Swal.fire(
            'Deleted!',
            'Your product has been deleted.',
            'success'
          );

          // Refresh product list
          fetchProducts();
        } catch (error) {
          console.error(error);
          Swal.fire(
            'Error!',
            'Failed to delete product.',
            'error'
          );
        }
      }
    });
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleExport = () => {
    axios.get(AppConfig.API_URL + '/products/export', {
      responseType: 'blob'
    }).then((response) => {
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const datetime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${datetime}_products.xlsx`);
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
      await axios.post(`${AppConfig.API_URL}/products/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire('Success', 'Data imported successfully!', 'success', { timer: 2000 });
      await fetchProducts(); // Refresh data
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
      <h1 className="mb-4">Product List</h1>

      <div className="row mb-3">
        <div className="col-md-6">
          <button className="btn btn-primary me-2" onClick={handleAddCategory}>
            Add Product
          </button>

          <button className="btn btn-success me-2" onClick={handleExport}>
            Export
          </button>

          <label htmlFor="import" className="btn btn-info me-2">
            Import
            <input
              id="import"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => handleImport(e)}
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
              placeholder="Search by name, description, supplier or category..."
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
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>No</th>
                  <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                    Name {getSortIndicator('name')}
                  </th>
                  <th onClick={() => requestSort('description')} style={{ cursor: 'pointer' }}>
                    Description {getSortIndicator('description')}
                  </th>
                  <th>Specification</th>
                  <th onClick={() => requestSort('supplier')} style={{ cursor: 'pointer' }}>
                    Supplier {getSortIndicator('supplier')}
                  </th>
                  <th onClick={() => requestSort('category')} style={{ cursor: 'pointer' }}>
                    Category {getSortIndicator('category')}
                  </th>
                  <th onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                    Price (Rp) {getSortIndicator('price')}
                  </th>
                  <th onClick={() => requestSort('stock')} style={{ cursor: 'pointer' }}>
                    Stock {getSortIndicator('stock')}
                  </th>
                  <th>Attachment</th>
                  <th onClick={() => requestSort('is_active')} style={{ cursor: 'pointer' }}>
                    Status {getSortIndicator('is_active')}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{product.name}</td>
                      <td>{product.description}</td>
                      <td>
                        <ul className="mb-0">
                          {product.specifications && (() => {
                            const specs = JSON.parse(product.specifications);
                            return (
                              <>
                                {specs.serial_number && <li>Serial Number : {specs.serial_number}</li>}
                                {specs.tags && <li>Tag : {specs.tags}</li>}
                              </>
                            );
                          })()}
                        </ul>
                      </td>
                      <td>{product.supplier.is_active ? product.supplier.name : '-'}</td>
                      <td>{product.category.is_active ? product.category.name : '-'}</td>
                      <td>{parseFloat(product.price).toLocaleString('id-ID')}</td>
                      <td>{product.stock}</td>
                      <td>
                        <ul>
                          {product.attachments?.map((file, index) => (
                            <li key={index}>{file.file_name}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <span className={`badge ${product.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      {searchTerm ? 'No products matching your search criteria.' : 'No products available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredProducts.length > 0 && (
            <div className="d-flex justify-content-end mt-3">
              <p>Showing {filteredProducts.length} of {products.length} products</p>
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
                <h5 className="modal-title">Add Product</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <AddProduct
                  onSuccess={() => {
                    fetchProducts();  // Refresh list
                    setShowAddModal(false); // Tutup modal
                  }}
                  onClose={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
              </div>
              <div className="modal-body">
                <EditProduct
                  product={selectedProduct}
                  onSuccess={() => {
                    fetchProducts();  // Refresh list
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

export default ProductPage;