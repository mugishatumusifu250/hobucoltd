import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { consultationsAPI, usersAPI, authAPI } from '../api';
import { getAvatarColor, capitalize, formatDate, formatDateTime, initDashboardScripts, initProfileDropdown, goBack } from '../helpers';
import '../styles/dashboard-admin/consultations.css';

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

const ConsultationsManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  // View modal
  const [viewModal, setViewModal] = useState(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // Add new consultation modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await consultationsAPI.getAll();
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.consultations || [];
        setConsultations(list);
        setTotalConsultations(list.length);
      }
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
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

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
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
  }, []);

  const onSearchInput = (e) => {
    const val = e.target.value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => handleSearch(val), 300);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // View modal handlers
  const openViewModal = (item) => {
    setViewModal(item);
  };

  const closeViewModal = () => {
    setViewModal(null);
  };

  // Edit modal handlers
  const openEditModal = async (id) => {
    try {
      const res = await consultationsAPI.getById(id);
      if (res.ok) {
        const data = await res.json();
        setEditId(data.id);
        setEditForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          subject: data.subject || '',
          company_org: data.company_org || '',
          service: data.service || '',
          message: data.message || '',
        });
        setEditMessage(null);
        setEditModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch consultation:', err);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditId(null);
    setEditForm(emptyForm);
    setEditMessage(null);
    document.body.classList.remove('modal-open');
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage(null);
    try {
      const res = await consultationsAPI.update(editId, editForm);
      const data = await res.json();
      if (data.success) {
        setEditMessage(null);
        setTimeout(() => {
          closeEditModal();
          fetchData();
        }, 1000);
        setEditMessage({ text: 'Consultation updated successfully!', color: 'rgb(8, 165, 13)' });
      } else {
        setEditMessage({ text: data.message || 'Unknown error occurred', color: 'rgb(255, 0, 0)' });
      }
    } catch (err) {
      setEditMessage({
        text: 'Network error: Unable to connect to server',
        color: '#721c24',
        bg: '#f8d7da',
        border: '1px solid #f5c6cb',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Add modal handlers
  const openAddModal = () => {
    setAddForm(emptyForm);
    setAddMessage(null);
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddForm(emptyForm);
    setAddMessage(null);
    document.body.classList.remove('modal-open');
  };

  const handleAddFormChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMessage(null);
    try {
      const res = await consultationsAPI.book(addForm);
      const data = await res.json();
      if (data.success) {
        closeAddModal();
        fetchData();
      } else {
        setAddMessage(data.message || 'Failed to create consultation');
      }
    } catch (err) {
      setAddMessage('Network error. Please try again later.');
    } finally {
      setAddLoading(false);
    }
  };

  // Delete handler
  const deleteConsultation = (id) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return;
    consultationsAPI
      .delete(id)
      .then((res) => {
        if (res.ok) {
          fetchData();
        } else {
          return res.text().then((text) => {
            throw new Error(text);
          });
        }
      })
      .catch((error) => {
        alert('Failed to delete: ' + error.message);
      });
  };

  // Export handler
  const confirmExport = () => {
    const confirmed = confirm('Are you sure you want to export the list of consultations?');
    if (confirmed) {
      window.open(consultationsAPI.exportExcel());
    }
  };

  const highlight = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  const username = user?.username || '';
  const role = user?.role || '';

  const isSearching = searchResults !== null;
  const displayData = isSearching ? searchResults : consultations;

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
          <li className="menu-item">
            <Link to="/dashboard" className="menu-link">
              <i className="fa-solid fa-chart-simple"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/requests" className="menu-link">
              <i className="fas fa-paper-plane"></i>
              <span>Requests</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/users" className="menu-link">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="menu-item active">
            <Link to="/consultations" className="menu-link">
              <i className="fas fa-handshake"></i>
              <span>Consultations</span>
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
                <div className="profile-circle profile-avatar">{username.charAt(0).toUpperCase()}</div>
                <span className="profile-name">{capitalize(username)}</span>
                <i className="fas fa-chevron-down profile-arrow"></i>
              </button>
              <div className="profile-dropdown" id="profileDropdown">
                <div className="profile-info">
                  <div className="profile-circle profile-avatar profile-avatar-large">{username.charAt(0).toUpperCase()}</div>
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
          {/* Consultations Table */}
          <section className="table-section">
            <div className="table-card">
              <div className="table-header">
                <h3>Consultations ({isSearching ? searchResults.length : totalConsultations})</h3>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    Add New
                  </button>
                  <button className="btn btn-secondary" onClick={confirmExport}>
                    <i className="fas fa-download"></i>
                    Export
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table" id="consultationsTable">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Service Type</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="tableBody">
                    {isSearching && searchResults.length === 0 ? (
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
                              <span>
                                {searchQuery
                                  ? highlight(item.first_name || '', searchQuery)
                                  : item.first_name}
                              </span>
                            </div>
                          </td>
                          <td className="email">
                            {searchQuery
                              ? highlight(item.email || '', searchQuery)
                              : item.email}
                          </td>
                          <td>
                            {searchQuery
                              ? highlight(item.service || '', searchQuery)
                              : item.service}
                          </td>
                          <td>
                            {searchQuery
                              ? highlight(formatDate(item.submitted_at), searchQuery)
                              : formatDate(item.submitted_at)}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(item)}>
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
                  There is {isSearching ? searchResults.length : totalConsultations} Total Consultations
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* View Modal */}
        {viewModal && (
          <div className="modal-overlay show" id={`modal-${viewModal.id}`}>
            <div className="modal-content">
              <button className="modal-close" onClick={closeViewModal}>&times;</button>
              <h2>Consultation Details</h2>
              <p><strong>Names:</strong> {capitalize(viewModal.first_name)} {capitalize(viewModal.last_name)}</p>
              <p><strong>Email:</strong> {viewModal.email}</p>
              <p><strong>Phone:</strong> {viewModal.phone}</p>
              <p><strong>Company / Organization:</strong> {viewModal.company_org}</p>
              <p><strong>Subject:</strong> {viewModal.subject}</p>
              <p><strong>Service:</strong> {viewModal.service}</p>
              <p><strong>Message:</strong> {viewModal.message}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${viewModal.status || 'pending'}`}>
                  {capitalize(viewModal.status || 'pending')}
                </span>
              </p>
              <p><strong>Submitted At:</strong> {formatDateTime(viewModal.submitted_at)}</p>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="modal-overlay active" id="mobileOverlay1">
            <div className="modal-content-fullscreen" id="modalFormContainer">
              <form id="editConsultationForm" onSubmit={handleEditSubmit}>
                <button type="button" className="close-btn" onClick={closeEditModal}>
                  ×
                </button>
                <h2>Edit Consultation</h2>

                <label>First Name</label>
                <input type="text" name="first_name" value={editForm.first_name} onChange={handleEditFormChange} required />

                <label>Last Name</label>
                <input type="text" name="last_name" value={editForm.last_name} onChange={handleEditFormChange} required />

                <label>Email</label>
                <input type="email" name="email" value={editForm.email} onChange={handleEditFormChange} required />

                <label>Phone</label>
                <input type="text" name="phone" value={editForm.phone} onChange={handleEditFormChange} />

                <label>Company / Organization</label>
                <input type="text" name="company_org" value={editForm.company_org} onChange={handleEditFormChange} />

                <label>Subject</label>
                <select name="subject" value={editForm.subject} onChange={handleEditFormChange}>
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label>Service</label>
                <select name="service" value={editForm.service} onChange={handleEditFormChange}>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label>Message</label>
                <textarea name="message" value={editForm.message} onChange={handleEditFormChange}></textarea>

                {editMessage && (
                  <div
                    id="modalMessage"
                    style={{
                      display: 'block',
                      padding: '10px',
                      marginBottom: '10px',
                      borderRadius: '4px',
                      color: editMessage.color,
                      backgroundColor: editMessage.bg || 'transparent',
                      border: editMessage.border || 'none',
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
        )}

        {/* Add New Consultation Modal */}
        {addModalOpen && (
          <div className="modal-overlay2 active" id="mobileOverlay2">
            <div className="modal-content-fullscreen2" id="modalFormContainer2">
              <form id="addConsultationForm" onSubmit={handleAddSubmit}>
                <button type="button" className="close-btn" onClick={closeAddModal}>
                  ×
                </button>
                <h2>Add New Consultation</h2>

                <label>First Name</label>
                <input type="text" name="first_name" value={addForm.first_name} onChange={handleAddFormChange} required />

                <label>Last Name</label>
                <input type="text" name="last_name" value={addForm.last_name} onChange={handleAddFormChange} required />

                <label>Email</label>
                <input type="email" name="email" value={addForm.email} onChange={handleAddFormChange} required />

                <label>Phone</label>
                <input type="text" name="phone" value={addForm.phone} onChange={handleAddFormChange} />

                <label>Company / Organization</label>
                <input type="text" name="company_org" value={addForm.company_org} onChange={handleAddFormChange} />

                <label>Subject</label>
                <select name="subject" value={addForm.subject} onChange={handleAddFormChange}>
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label>Service</label>
                <select name="service" value={addForm.service} onChange={handleAddFormChange}>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label>Message</label>
                <textarea name="message" value={addForm.message} onChange={handleAddFormChange}></textarea>

                {addMessage && (
                  <div id="addModalMessage" style={{ color: 'red', margin: '10px 0' }}>
                    {addMessage}
                  </div>
                )}

                <button type="submit" disabled={addLoading}>
                  <i className="fas fa-plus"></i>{' '}
                  {addLoading ? 'Adding...' : 'Add New'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" id="mobileOverlay"></div>
    </>
  );
};

export default ConsultationsManager;
