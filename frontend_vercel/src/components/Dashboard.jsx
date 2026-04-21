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
    fkdat: '',
    vbeln: '',
    posnr: '',
    matnr: '',
    arktx: '',
    quantity: '',
    netValue: '',
    soldToName1: '',
    empName: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('sheet1');
      if (response.data && response.data.sheet1) {
        setData(response.data.sheet1);
      } else {
        setData([]);
      }
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
      const matchSearch = String(item.arktx || '').toLowerCase().includes(search.toLowerCase()) || 
                          String(item.soldToName1 || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(item.vbeln || '').includes(search);
      return matchSearch;
    });
  }, [data, search]);

  // Aggregations for KPI
  const kpi = useMemo(() => {
    let totalRevenue = 0;
    let totalQuantity = 0;
    filteredData.forEach(d => {
      totalRevenue += Number(d.netValue || 0);
      totalQuantity += Number(d.quantity || 0);
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
        const payload = { sheet1: formData };
        await api.post('sheet1', payload);
      } else {
        const payload = { sheet1: formData };
        await api.put(`sheet1/${formData.id}`, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error saving data");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`sheet1/${id}`);
        fetchData();
      } catch (error) {
        alert("Error deleting data");
      }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      dlDate: 20250101, fkdat: 45300, vbeln: '', posnr: 10, 
      matnr: '', arktx: '', quantity: 1, netValue: 0, 
      soldToName1: '', empName: ''
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

  // Convert dates for chart grouping
  const chartData = useMemo(() => {
    const sliced = [...filteredData].slice(0, 50).reverse();
    return sliced.map(d => ({
      name: String(d.vbeln),
      Revenue: Number(d.netValue || 0)
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
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data from Sheety API...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doc ID (vbeln)</th>
                  <th>Item (posnr)</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                  {isAdmin && <th style={{textAlign: 'right'}}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 100).map((row, i) => (
                  <tr key={row.id || `${row.vbeln}-${row.posnr}-${i}`}>
                    <td>{row.vbeln}</td>
                    <td>{row.posnr}</td>
                    <td>{row.arktx} <br/><small className="text-secondary">{row.matnr}</small></td>
                    <td>{row.soldToName1}</td>
                    <td>{row.quantity}</td>
                    <td>{Number(row.netValue).toLocaleString()}</td>
                    {isAdmin && (
                      <td style={{textAlign: 'right'}}>
                        <button className="btn-icon" onClick={() => openEditModal(row)}><Pencil size={18} /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></button>
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
                 <label className="form-label">Doc ID (vbeln)</label>
                 <input type="text" className="form-input" name="vbeln" value={formData.vbeln} onChange={handleChange} />
              </div>
              <div className="form-group">
                 <label className="form-label">Item No (posnr)</label>
                 <input type="text" className="form-input" name="posnr" value={formData.posnr} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                 <label className="form-label">Product Name (arktx)</label>
                 <input type="text" className="form-input" name="arktx" value={formData.arktx} onChange={handleChange} />
              </div>
              <div className="form-group">
                 <label className="form-label">Quantity</label>
                 <input type="number" className="form-input" name="quantity" value={formData.quantity} onChange={handleChange} />
              </div>
              <div className="form-group">
                 <label className="form-label">Net Value</label>
                 <input type="number" className="form-input" name="netValue" value={formData.netValue} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                 <label className="form-label">Customer Name</label>
                 <input type="text" className="form-input" name="soldToName1" value={formData.soldToName1} onChange={handleChange} />
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
