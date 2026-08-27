import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { consultationsAPI } from '../api';
import { getAvatarColor, capitalize, formatDate, formatDateTime, initDashboardScripts, initProfileDropdown } from '../helpers';
import '../styles/dashboard/admin.css';

const SERVICE_OPTIONS = [
  'Research',
  'Business-Strategy',
  'Capacity-Building',
  'Policy-Formulation',
  'Monitoring-and-Evaluation',
  'Project-Management',
  'Training',
  'Organizational-Development',
  'Environmental-and-Social-Assessment',
  'Data-Management',
  'Proposal-Development',
  'Other',
];

const SUBJECT_OPTIONS = ['Consultation', 'Proposal', 'DevOps', 'Help'];

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  subject: '',
  company_org: '',
  service: '',
  message: '',
};

const DashboardClient = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [searchResults, setSearchResults] = useState(null);

  // View modal
  const [viewModal, setViewModal] = useState(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // Add modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

  const searchTimeoutRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await consultationsAPI.getAll();
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.consultations || [];
        setConsultations(list);
        setTotalConsultations(list.length);
        setApprovedCount(list.filter((c) => c.status === 'approved').length);
        setDismissedCount(list.filter((c) => c.status === 'dismissed').length);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const cleanupDashboard = initDashboardScripts();
    const cleanupProfile = initProfileDropdown();
    return () => {
      if (typeof cleanupDashboard === 'function') cleanupDashboard();
      if (typeof cleanupProfile === 'function') cleanupProfile();
    };
  }, []);

  const handleSearch = useCallback(
    (query) => {
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }
      consultationsAPI
        .search(query.trim())
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setSearchResults(list);
        })
        .catch(() => setSearchResults([]));
    },
    []
  );

  const onSearchInput = (e) => {
    const val = e.target.value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => handleSearch(val), 300);
  };

  const openViewModal = (item) => {
    setViewModal(item);
  };

  const closeViewModal = () => {
    setViewModal(null);
  };

  const openEditModal = async (id) => {
    setEditId(id);
    setEditLoading(true);
    setEditMessage(null);
    try {
      const res = await consultationsAPI.getById(id);
      if (res.ok) {
        const data = await res.json();
        const item = data.consultation || data;
        setEditForm({
          first_name: item.first_name || '',
          last_name: item.last_name || '',
          email: item.email || '',
          phone: item.phone || '',
          subject: item.subject || '',
          company_org: item.company_org || '',
          service: item.service || '',
          message: item.message || '',
        });
        setEditModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load consultation:', err);
    }
    setEditLoading(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditForm(emptyForm);
    setEditId(null);
    setEditMessage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage(null);
    try {
      const res = await consultationsAPI.update(editId, editForm);
      const data = await res.json();
      if (res.ok && data.success) {
        setEditMessage({ type: 'success', text: 'Consultation updated successfully!' });
        setTimeout(() => {
          closeEditModal();
          fetchData();
        }, 1500);
      } else {
        setEditMessage({ type: 'error', text: data.message || 'Unknown error occurred' });
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: 'Network error: Unable to connect to server' });
    }
    setEditLoading(false);
  };

  const openAddModal = () => {
    setAddForm(emptyForm);
    setAddMessage(null);
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddForm(emptyForm);
    setAddMessage(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMessage(null);
    try {
      const res = await consultationsAPI.book(addForm);
      const data = await res.json();
      if (res.ok && data.success) {
        setAddMessage({ type: 'success', text: 'Consultation added successfully!' });
        setTimeout(() => {
          closeAddModal();
          fetchData();
        }, 1500);
      } else {
        setAddMessage({ type: 'error', text: data.message || 'Unknown error occurred' });
      }
    } catch (err) {
      setAddMessage({ type: 'error', text: 'Network error: Unable to connect to server' });
    }
    setAddLoading(false);
  };

  const deleteConsultation = async (id) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return;
    try {
      const res = await consultationsAPI.delete(id);
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.text();
        alert('Failed to delete: ' + data);
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayData = searchResults !== null ? searchResults : consultations;
  const username = user?.username || '';
  const role = user?.role || '';

  return (
    <>
      {/* Sidebar Navigation */}
      <nav className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/favicon/favicon-96x96.png" alt="" />
            <span>HOBUCO</span>
          </div>
          <button className="sidebar-toggle" id="sidebarToggle">
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-item active">
            <Link to="/client" className="menu-link">
              <i className="fas fa-handshake"></i>
              <span>Consultations</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/help" className="menu-link">
              <i className="fas fa-question-circle"></i>
              <span>Help</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-toggle" id="mobileMenuToggle">
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">Consultations</h1>
          </div>

          <div className="top-bar-right">
            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                id="searchInput"
                className="search-input"
                placeholder="Search..."
                onChange={onSearchInput}
              />
              <i className="fas fa-search search-icon"></i>
            </div>

            {/* User Profile */}
            <div className="profile-container">
              <button className="profile-btn" id="profileBtn">
                <div className="profile-circle profile-avatar">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="profile-name">
                  {capitalize(username)}
                </span>
                <i className="fas fa-chevron-down profile-arrow"></i>
              </button>
              <div className="profile-dropdown" id="profileDropdown">
                <div className="profile-info">
                  <div className="profile-circle profile-avatar profile-avatar-large">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-details">
                    <h4>{capitalize(username)}</h4>
                    <p>{capitalize(role)}</p>
                  </div>
                </div>
                <div className="profile-menu">
                  <Link to="/help" className="profile-menu-item">
                    <i className="fas fa-question-circle"></i>
                    <span>Help</span>
                  </Link>
                  <hr className="profile-divider" />
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <section className="widgets-section">
            <div className="widget-grid">
              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Approved Requests</h3>
                  <p className="widget-value">{approvedCount}</p>
                </div>
              </div>

              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Dismissed Requests</h3>
                  <p className="widget-value">{dismissedCount}</p>
                </div>
              </div>

              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-list"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Total Requests</h3>
                  <p className="widget-value">{totalConsultations}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Client Inquiries Table */}
          <section className="table-section">
            <div className="table-card">
              <div className="table-header">
                <h3>Consultations ({totalConsultations})</h3>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    Add New
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table" id="consultationsTable">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th className="hide-mobile">Email</th>
                      <th style={{ display: 'flex' }}>Status</th>
                      <th className="hide-mobile">Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="tableBody">
                    {displayData.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'red' }}>
                          No matching records.
                        </td>
                      </tr>
                    ) : (
                      displayData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(item.first_name)}`}>
                                {item.first_name?.charAt(0).toUpperCase()}
                              </div>
                              <span>{capitalize(item.first_name)}</span>
                            </div>
                          </td>
                          <td className="hide-mobile email">{item.email}</td>
                          <td style={{ display: 'flex' }}>
                            <span className={`status ${item.status || 'pending'}`}>
                              {capitalize(item.status || 'pending')}
                            </span>
                          </td>
                          <td className="hide-mobile">{formatDate(item.submitted_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon"
                                title="View"
                                onClick={() => openViewModal(item)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(item.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteConsultation(item.id)}>
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <div className="pagination-info">
                  There is {totalConsultations} Total Consultations
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* View Modal */}
        {viewModal && (
          <div className="modal-overlay show" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeViewModal}>
                &times;
              </button>
              <h2>Consultation Details</h2>
              <p>
                <strong>Names:</strong> {capitalize(viewModal.first_name)}{' '}
                {capitalize(viewModal.last_name)}
              </p>
              <p>
                <strong>Email:</strong> {viewModal.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewModal.phone}
              </p>
              <p>
                <strong>Company / Organization:</strong> {viewModal.company_org}
              </p>
              <p>
                <strong>Subject:</strong> {viewModal.subject}
              </p>
              <p>
                <strong>Service:</strong> {viewModal.service}
              </p>
              <p>
                <strong>Message:</strong> {viewModal.message}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${viewModal.status || 'pending'}`}>
                  {capitalize(viewModal.status || 'pending')}
                </span>
              </p>
              <p>
                <strong>Submitted At:</strong>{' '}
                {formatDateTime(viewModal.submitted_at)}
              </p>
            </div>
          </div>
        )}

        {/* Edit Modal (mobileOverlay1) */}
        <div
          className={`modal-overlay${editModalOpen ? ' active' : ''}`}
          id="mobileOverlay1"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="modal-content-fullscreen" id="modalFormContainer">
            <form id="editConsultationForm" onSubmit={handleEditSubmit}>
              <button type="button" className="close-btn" onClick={closeEditModal}>
                ×
              </button>
              <h2>Edit Consultation</h2>

              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={editForm.first_name}
                required
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              />

              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={editForm.last_name}
                required
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                required
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />

              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />

              <label>Company / Organization</label>
              <input
                type="text"
                name="company_org"
                value={editForm.company_org}
                onChange={(e) => setEditForm({ ...editForm, company_org: e.target.value })}
              />

              <label>Subject</label>
              <select
                name="subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
              >
                <option value="">Select Subject</option>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <label>Service</label>
              <select
                name="service"
                value={editForm.service}
                onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
              >
                <option value="">Select Service</option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <label>Message</label>
              <textarea
                name="message"
                value={editForm.message}
                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
              ></textarea>

              {editMessage && (
                <div
                  id="modalMessage"
                  style={{
                    display: 'block',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    color: editMessage.type === 'success' ? 'rgb(8, 165, 13)' : 'rgb(255, 0, 0)',
                  }}
                >
                  {editMessage.text}
                </div>
              )}

              <button type="submit" id="updateBtn" disabled={editLoading}>
                {editLoading ? 'Updating...' : 'Update'}
              </button>
            </form>
          </div>
        </div>

        {/* Add Modal (mobileOverlay2) */}
        <div
          className={`modal-overlay2${addModalOpen ? ' active' : ''}`}
          id="mobileOverlay2"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="modal-content-fullscreen2" id="modalFormContainer2">
            <form onSubmit={handleAddSubmit}>
              <button type="button" className="close-btn" onClick={closeAddModal}>
                ×
              </button>
              <h2>Add New Consultation</h2>

              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={addForm.first_name}
                onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />

              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              />

              <label>Company / Organization</label>
              <input
                type="text"
                name="companyOrg"
                value={addForm.company_org}
                onChange={(e) => setAddForm({ ...addForm, company_org: e.target.value })}
              />

              <label>Subject</label>
              <select
                name="subject"
                value={addForm.subject}
                onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
              >
                <option value="">Select Subject</option>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <label>Service</label>
              <select
                name="service"
                value={addForm.service}
                onChange={(e) => setAddForm({ ...addForm, service: e.target.value })}
              >
                <option value="">Select Service</option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <label>Message</label>
              <textarea
                name="message"
                value={addForm.message}
                onChange={(e) => setAddForm({ ...addForm, message: e.target.value })}
              ></textarea>

              {addMessage && (
                <div
                  style={{
                    display: 'block',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    color: addMessage.type === 'success' ? 'rgb(8, 165, 13)' : 'rgb(255, 0, 0)',
                  }}
                >
                  {addMessage.text}
                </div>
              )}

              <button type="submit" disabled={addLoading}>
                <i className="fas fa-plus"></i>{' '}
                {addLoading ? 'Adding...' : 'Add New'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* WhatsApp Floating Button */}
      <div className="whatsapp-float" id="whatsappFloat">
        <a
          href="https://wa.me/250788696388?text=Hello%20there%2C%20I%20need%20assistance%20with%20your%20services."
          target="_blank"
          className="whatsapp-btn"
        >
          <i className="fab fa-whatsapp"></i>
        </a>
        <div className="whatsapp-tooltip">Need help? Chat with us!</div>
      </div>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" id="mobileOverlay"></div>
    </>
  );
};

export default DashboardClient;
