// src/OrdersView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, authHeaders } from '../api/apiConfig';

const OrdersView = ({ token, isLoggedIn, userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({});
  const [fetchingDetails, setFetchingDetails] = useState({});
  const [cancelReasons, setCancelReasons] = useState({});
  
  const navigate = useNavigate();

  const LIST_ORDERS_URL = getApiUrl('api-list-order.php');
  const ORDER_DETAILS_URL = getApiUrl('api-list-order-detail.php');
  const CANCEL_ORDER_URL = getApiUrl('api-order-cancel.php');

  // 1. Fetch Primary Order History Ledger
  const fetchOrderLog = async () => {
    if (!isLoggedIn || !userId) {
      alert("Authentication required. Redirecting to login session...");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_id', userId);

      const res = await axios.post(LIST_ORDERS_URL, payload, {
        headers: authHeaders(token)
      });

      if (res.data && String(res.data.flag) === "1") {
        setOrders(res.data.order_list || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Order tracking allocation fault:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchOrderLog();
    }
  }, [isLoggedIn, userId]);

  // 2. Fetch Detailed Line-Items payload on Expansion
  const toggleOrderExpansion = async (orderId) => {
    if (selectedOrderDetails[orderId]) {
      const updatedDetails = { ...selectedOrderDetails };
      delete updatedDetails[orderId];
      setSelectedOrderDetails(updatedDetails);
      return;
    }

    setFetchingDetails(prev => ({ ...prev, [orderId]: true }));
    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('order_id', orderId);

      const res = await axios.post(ORDER_DETAILS_URL, payload, {
        headers: authHeaders(token)
      });

      // 🟢 FIXED ATTRIBUTE ACCESS: Reads 'order_details' array key directly from Postman schema
      if (res.data && String(res.data.flag) === "1") {
        setSelectedOrderDetails(prev => ({
          ...prev,
          [orderId]: res.data.order_details || [] 
        }));
      } else {
        alert(res.data.message || "Failed to parse itemized details.");
      }
    } catch (err) {
      console.error("Nested item detail pipeline breakdown:", err);
    } finally {
      setFetchingDetails(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // 3. Cancel Active Order
  const handleCancelTransaction = async (orderId) => {
    const reason = cancelReasons[orderId]?.trim();
    if (!reason) {
      alert("Please provide a cancellation reason.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('order_id', orderId);
      payload.append('cancel_reason', reason);

      const res = await axios.post(CANCEL_ORDER_URL, payload, {
        headers: authHeaders(token)
      });

      if (res.data && String(res.data.flag) === "1") {
        alert(res.data.message || "Order successfully cancelled.");
        setCancelReasons(prev => {
          const freshReasons = { ...prev };
          delete freshReasons[orderId];
          return freshReasons;
        });
        fetchOrderLog(); 
      } else {
        alert(res.data.message || "Cancellation request rejected by remote service.");
      }
    } catch (err) {
      console.error("Cancellation transmission pipeline fault:", err);
    }
  };

  const handleReasonTextChange = (orderId, val) => {
    setCancelReasons(prev => ({ ...prev, [orderId]: val }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        Order Tracking Ledger
      </h2>

      {loading ? (
        <p style={{ color: '#64748b' }}>Querying transaction history databases...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#64748b' }}>No active or historical order channels discovered.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {orders.map((order) => {
            const isExpanded = !!selectedOrderDetails[order.order_id];
            const items = selectedOrderDetails[order.order_id] || [];
            
            const displayTotal = order.order_total || order.order_amount || '0.00';

            return (
              <div 
                key={order.order_id} 
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f8fafc'
                }}
              >
                {/* Master Order Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <div>
                    <strong>Order Ref:</strong> #{order.order_id} <br />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Date: {order.order_date || 'N/A'}</span>
                  </div>
                  <div>
                    <strong>Total Amount:</strong> ₹{displayTotal}
                  </div>
                  <div>
                    <strong>Status:</strong> <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: order.order_status?.toLowerCase() === 'cancelled' ? '#fee2e2' : '#dcfce7',
                      color: order.order_status?.toLowerCase() === 'cancelled' ? '#ef4444' : '#15803d'
                    }}>{order.order_status || 'Pending'}</span>
                  </div>
                  <div>
                    <button 
                      onClick={() => toggleOrderExpansion(order.order_id)}
                      style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', fontWeight: '500' }}
                    >
                      {fetchingDetails[order.order_id] ? 'Loading Metrics...' : isExpanded ? 'Hide Items' : 'Track & View Details'}
                    </button>
                  </div>
                </div>

                {/* Sub-Itemized Layout (Triggered via Postman response payload structural mapping) */}
                {isExpanded && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155' }}>Line Items Profile</h4>
                    {items.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No details returned for this transaction bundle.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                            <th style={{ padding: '6px 0', width: '90px' }}>Preview</th>
                            <th>Product Asset Name</th>
                            <th>Quantity</th>
                            <th>Unit Pricing</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => {
                            // 🟢 MAP ATTRIBUTES DIRECTLY TO POSTMAN BACKEND LOG CODES
                            const productName = item.product_name || 'Unknown Product Asset';
                            const imageUrl = item.product_image;
                            const qty = parseInt(item.product_qty || 1, 10);
                            const price = parseFloat(item.product_price || 0);
                            
                            // Support safe parsing fallback for key variations ("sub total" vs "sub_total")
                            const subtotalValue = item["sub total"] || item["sub_total"] || (price * qty);

                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                                {/* 🟢 NEW: Product Image Thumbnail View column rendering */}
                                <td style={{ padding: '8px 0' }}>
                                  {imageUrl ? (
                                    <img 
                                      src={imageUrl} 
                                      alt={productName} 
                                      style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                      onError={(e) => { e.target.style.display = 'none'; }} // Fallback if image path is broken
                                    />
                                  ) : (
                                    <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
                                  )}
                                </td>
                                <td style={{ padding: '8px 4px', fontWeight: '500', color: '#1e293b', maxWidth: '350px' }}>
                                  {productName}
                                </td>
                                <td style={{ color: '#334155', padding: '8px 4px' }}>{qty}</td>
                                <td style={{ color: '#334155', padding: '8px 4px' }}>₹{price.toLocaleString('en-IN')}</td>
                                <td style={{ fontWeight: '600', color: '#0f172a', padding: '8px 4px' }}>
                                  ₹{parseFloat(subtotalValue).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}

                    {/* Operational Cancel Flow */}
                    {order.order_status?.toLowerCase() !== 'cancelled' && (
                      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          placeholder="Provide cancellation justification..."
                          value={cancelReasons[order.order_id] || ''}
                          onChange={(e) => handleReasonTextChange(order.order_id, e.target.value)}
                          style={{ flex: '1', minWidth: '200px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <button 
                          onClick={() => handleCancelTransaction(order.order_id)}
                          style={{ padding: '7px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersView;