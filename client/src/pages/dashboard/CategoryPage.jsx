import React, { useEffect, useState } from 'react';

import axios from 'axios';
import AppConfig from '../../config/AppConfig';

const CategoryPage = () => {

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      fetchCategories();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/categories');
      setCategories(response.data.data);
      console.log(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Category List</h1>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">No</th>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Subcategory</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (categories.map((category, index) => (
                  <tr key={category.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <ul>
                        {category.subcategories?.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </td>
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
                ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No categories found</td>
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

export default CategoryPage;