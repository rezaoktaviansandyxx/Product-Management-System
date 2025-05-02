import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AppConfig from '../../config/AppConfig';

const ProductPage = () => {

  const [products, setProducts] = useState([]);
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

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Product List</h1>

      <div className="card">
        <div className="card-body">
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
                      <ul>
                        {product.specifications?.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{product.supplier.name}</td>
                    <td>{product.category.name}</td>
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
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-primary">Edit</button>
                        <button className="btn btn-sm btn-danger ms-2">Delete</button>
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
  );
};

export default ProductPage;