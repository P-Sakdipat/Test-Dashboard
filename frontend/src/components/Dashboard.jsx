import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pencil, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import api from '../api';

const Dashboard = ({ isAdmin }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    dlDate: '',
    FKDAT: '',
    VBELN: '',
    POSNR: '',
    MATNR: '',
    ARKTX: '',
    Quantity: '',
    NetValue: '',
    SoldToName1: '',
    EmpName: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('sales/');
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = String(item.ARKTX || '').toLowerCase().includes(search.toLowerCase()) || 
                          String(item.SoldToName1 || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(item.VBELN || '').includes(search);
      return matchSearch;
    });
  }, [data, search]);

  // Aggregations for KPI
  const kpi = useMemo(() => {
    let totalRevenue = 0;
    let totalQuantity = 0;
    filteredData.forEach(d => {
      totalRevenue += Number(d.NetValue || 0);
      totalQuantity += Number(d.Quantity || 0);
    });
    return {
      revenue: totalRevenue.toLocaleString(),
      quantity: totalQuantity.toLocaleString(),
      orders: filteredData.length
    }
  }, [filteredData]);

  // Handle crud
  const handleSave = async () => {
    try {
      if (modalMode === 'add') {
        await api.post('sales/', formData);
      } else {
        await api.put(`sales/${formData.VBELN}/${formData.POSNR}/`, formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error saving data");
      console.error(error);
    }
  };

  const handleDelete = async (vbeln, posnr) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`sales/${vbeln}/${posnr}/`);
        fetchData();
      } catch (error) {
        alert("Error deleting data");
      }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      dlDate: '20250101', FKDAT: '45300', VBELN: '', POSNR: '10', 
      MATNR: '', ARKTX: '', Quantity: 1, NetValue: 0, 
      SoldToName1: '', EmpName: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convert dates for chart grouping (Simple strategy, get first 100 max)
  const chartData = useMemo(() => {
    // Just slice some for demo chart
    const sliced = [...filteredData].slice(0, 50).reverse();
    return sliced.map(d => ({
      name: String(d.VBELN),
      Revenue: Number(d.NetValue || 0)
    }));
  }, [filteredData]);

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Sales Overview</h1>
        <button className="btn btn-icon" onClick={fetchData} title="Refresh Data">
          <RefreshCw size={20} className={loading ? "spin" : ""} />
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title">Total Revenue</span>
          <span className="kpi-value">฿ {kpi.revenue}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-title">Total Sales Quantity</span>
          <span className="kpi-value">{kpi.quantity} Units</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-title">Total Orders</span>
          <span className="kpi-value">{kpi.orders}</span>
        </div>
      </div>

      <div className="chart-container">
        <h3 style={{ marginBottom: '1rem' }}>Revenue Chart (Sample)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}/>
            <Area type="monotone" dataKey="Revenue" stroke="var(--primary-color)" fill="rgba(59, 130, 246, 0.2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
        <div className="table-header-controls">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by Product, Customer or DoC ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add New
            </button>
          )}
        </div>
        
        <div className="table-scroll">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data from Excel...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doc ID (VBELN)</th>
                  <th>Item (POSNR)</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                  {isAdmin && <th style={{textAlign: 'right'}}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 100).map((row, i) => (
                  <tr key={`${row.VBELN}-${row.POSNR}-${i}`}>
                    <td>{row.VBELN}</td>
                    <td>{row.POSNR}</td>
                    <td>{row.ARKTX} <br/><small className="text-secondary">{row.MATNR}</small></td>
                    <td>{row.SoldToName1}</td>
                    <td>{row.Quantity}</td>
                    <td>{Number(row.NetValue).toLocaleString()}</td>
                    {isAdmin && (
                      <td style={{textAlign: 'right'}}>
                        <button className="btn-icon" onClick={() => openEditModal(row)}><Pencil size={18} /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(row.VBELN, row.POSNR)}><Trash2 size={18} /></button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredData.length > 100 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Showing 100 of {filteredData.length} records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>{modalMode === 'add' ? 'Add New Record' : 'Edit Record'}</span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                 <label className="form-label">Doc ID (VBELN)</label>
                 <input type="text" className="form-input" name="VBELN" value={formData.VBELN} onChange={handleChange} disabled={modalMode === 'edit'} />
              </div>
              <div className="form-group">
                 <label className="form-label">Item No (POSNR)</label>
                 <input type="text" className="form-input" name="POSNR" value={formData.POSNR} onChange={handleChange} disabled={modalMode === 'edit'} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                 <label className="form-label">Product Name (ARKTX)</label>
                 <input type="text" className="form-input" name="ARKTX" value={formData.ARKTX} onChange={handleChange} />
              </div>
              <div className="form-group">
                 <label className="form-label">Quantity</label>
                 <input type="number" className="form-input" name="Quantity" value={formData.Quantity} onChange={handleChange} />
              </div>
              <div className="form-group">
                 <label className="form-label">Net Value</label>
                 <input type="number" className="form-input" name="NetValue" value={formData.NetValue} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                 <label className="form-label">Customer Name</label>
                 <input type="text" className="form-input" name="SoldToName1" value={formData.SoldToName1} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
