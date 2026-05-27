// src/SubcategoryList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const SubcategoryList = ({ onSubcategoryClick }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = getApiUrl('api-subcategory-list.php');

  useEffect(() => {
    const fetchAllSubcategories = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        const res = await axios.post(API_URL, formData, {
          headers: authHeaders(API_TOKEN)
        });
        
        if (res.data && res.data.flag === "1") {
          setSubcategories(res.data.subcategory_list || []);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error("API Fetching error:", err);
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSubcategories();
  }, []);

  if (loading) return <div>Loading All Subcategories...</div>;
  if (subcategories.length === 0) return <div>No subcategories found in database records.</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {subcategories.map((sub) => (
        <div 
          key={sub.sub_category_id} 
          onClick={() => onSubcategoryClick(sub.sub_category_id)}
          style={{ border: '1px solid #000', padding: '15px', width: '180px', cursor: 'pointer', borderRadius: '6px', textAlign: 'center' }}
        >
          <img src={sub.sub_category_image} alt={sub.sub_category_name} style={{ width: '100%', height: '120px', objectFit: 'contain' }} />
          <h4>{sub.sub_category_name}</h4>
        </div>
      ))}
    </div>
  );
};

export default SubcategoryList;