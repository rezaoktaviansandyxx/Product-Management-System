import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';
import AddProduct from '../../components/form/product/AddProduct';
import EditProduct from '../../components/form/product/EditProduct';
import Swal from 'sweetalert2';

const ProductPage = () => {

  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/products');
      setProducts(response.data.data);
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

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Product List</h1>

      <div className="mb-3 text-start">
        <button className="btn btn-primary" onClick={handleAddCategory}>
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Specification</th>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Price (Rp)</th>
                  <th>Stock</th>
                  <th>Attachment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
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
                      <td>{product.supplier ? product.supplier.name : '-'}</td>
                      <td>{product.category ? product.category.name : '-'}</td>
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
                    <td colSpan="10" className="text-center">No products available.</td>
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
          <div className="modal-dialog modal-lg">
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