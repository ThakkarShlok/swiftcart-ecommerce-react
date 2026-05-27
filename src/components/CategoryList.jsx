// CategoryList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // FIX: Corrected import package source
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const CategoryList = ({ onViewSubcategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = getApiUrl('api-list-category.php');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const formData = new FormData();
        const res = await axios.post(API_URL, formData, {
          headers: authHeaders(API_TOKEN)
        });
        if (res.data.flag === "1") {
          setCategories(res.data.category_list || []);
        }
      } catch (err) {
        console.error("Categories lookup error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);


  return (
    <div>
      {categories.map((cat) => (
        <div key={cat.category_id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <img src={cat.category_image} alt={cat.category_name} width="80" />
          <h4>{cat.category_name}</h4>
          <button onClick={() => onViewSubcategory(cat.category_id, cat.category_name)}>
            View Subcategory
          </button>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;