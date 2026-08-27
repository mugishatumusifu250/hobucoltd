import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { consultationsAPI, usersAPI, authAPI } from '../api';
import { getAvatarColor, capitalize, formatDate, formatDateTime, initDashboardScripts, initProfileDropdown, goBack } from '../helpers';
import '../styles/dashboard-admin/users.css';

const ROLE_OPTIONS = ['admin', 'manager', 'client'];

const emptyUserForm = {
  username: '',
  email: '',
  role: '',
  password: '',
};

const UsersManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalManagers, setTotalManagers] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  // View modal
  const [viewModal, setViewModal] = useState(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyUserForm);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // Add new user modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyUserForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await usersAPI.getAll();
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setUsers(list);
        const a = list.filter((u) => u.role === 'admin');
        const c = list.filter((u) => u.role === 'client');
        const m = list.filter((u) => u.role === 'manager');
        setAdmins(a);
        setClients(c);
        setManagers(m);
        setTotalAdmins(a.length);
        setTotalClients(c.length);
        setTotalManagers(m.length);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
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
    usersAPI
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
  const openViewModal = (userItem) => {
    setViewModal(userItem);
  };

  const closeViewModal = () => {
    setViewModal(null);
  };

  // Edit modal handlers
  const openEditModal = async (id) => {
    try {
      const res = await usersAPI.getById(id);
      if (res.ok) {
        const data = await res.json();
        setEditId(data.id);
        setEditForm({
          username: data.username || '',
          email: data.email || '',
          role: data.role || '',
          password: '',
        });
        setEditMessage(null);
        setEditModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditId(null);
    setEditForm(emptyUserForm);
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
      const payload = {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }
      const res = await usersAPI.update(editId, payload);
      const data = await res.json();
      if (data.success) {
        closeEditModal();
        fetchData();
      } else {
        setEditMessage(data.message || 'Failed to update user');
      }
    } catch (err) {
      setEditMessage('Network error. Please try again later.');
    } finally {
      setEditLoading(false);
    }
  };

  // Add modal handlers
  const openAddModal = () => {
    setAddForm(emptyUserForm);
    setAddMessage(null);
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddForm(emptyUserForm);
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
      const res = await authAPI.signup({
        username: addForm.username,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role,
      });
      const data = await res.json();
      if (data.success) {
        closeAddModal();
        fetchData();
      } else {
        setAddMessage(data.message || 'Failed to create user');
      }
    } catch (err) {
      setAddMessage('Network error. Please try again later.');
    } finally {
      setAddLoading(false);
    }
  };

  // Delete handler
  const deleteUser = (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    usersAPI
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
        alert('Failed to delete user: ' + error.message);
      });
  };

  // Export handlers
  const exportAdmins = () => {
    const confirmed = confirm('Are you sure you want to export the list of users?');
    if (confirmed) {
      window.open(usersAPI.exportExcel('admin'));
    }
  };

  const exportClients = () => {
    const confirmed = confirm('Are you sure you want to export the list of users?');
    if (confirmed) {
      window.open(usersAPI.exportExcel('client'));
    }
  };

  const exportManagers = () => {
    const confirmed = confirm('Are you sure you want to export the list of users?');
    if (confirmed) {
      window.open(usersAPI.exportExcel('manager'));
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

  const getRoleLabel = (userItem) => {
    if (userItem.role === 'admin') return 'Admin User Details';
    if (userItem.role === 'client') return 'Client User Details';
    if (userItem.role === 'manager') return 'Manager User Details';
    return 'User Details';
  };

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
          <li className="menu-item active">
            <Link to="/admin/users" className="menu-link">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="menu-item">
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
            <h1 className="page-title">Users</h1>
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
          {/* Dashboard Widgets */}
          <section className="widgets-section">
            <div className="widget-grid">
              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fa-duotone fa-solid fa-user-tie"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Total Admins</h3>
                  <p className="widget-value">{totalAdmins}</p>
                  <span className="widget-change positive">
                    <i className="fas fa-arrow-up"></i>
                    +1 from last month
                  </span>
                </div>
              </div>

              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Total Managers</h3>
                  <p className="widget-value">{totalManagers}</p>
                  <span className="widget-change positive">
                    <i className="fas fa-arrow-up"></i>
                    in this week
                  </span>
                </div>
              </div>

              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Total Clients</h3>
                  <p className="widget-value">{totalClients}</p>
                  <span className="widget-change positive">
                    <i className="fas fa-arrow-up"></i>
                    in this week
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Admins Table */}
          <section className="table-section">
            <div className="table-card">
              <div className="table-header">
                <h3>Admins ({isSearching ? searchResults.filter((u) => u.role === 'admin').length : totalAdmins})</h3>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    Add New
                  </button>
                  <button className="btn btn-secondary" onClick={exportAdmins}>
                    <i className="fas fa-download"></i>
                    Export Admins
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table" id="consultationsTable">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="tableBody">
                    {isSearching && searchResults.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'red' }}>
                          No matching users found.
                        </td>
                      </tr>
                    ) : isSearching ? (
                      searchResults.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(userItem.username)}`}>
                                {userItem.username ? userItem.username.charAt(0).toUpperCase() : ''}
                              </div>
                              <span>{searchQuery ? highlight(userItem.username || '', searchQuery) : userItem.username}</span>
                            </div>
                          </td>
                          <td className="email">{searchQuery ? highlight(userItem.email || '', searchQuery) : userItem.email}</td>
                          <td>{searchQuery ? highlight(userItem.role ? userItem.role.toUpperCase() : '', searchQuery) : userItem.role ? userItem.role.toUpperCase() : ''}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(userItem)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(userItem.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteUser(userItem.id)}>
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      admins.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(userItem.username)}`}>
                                {userItem.username.charAt(0).toUpperCase()}
                              </div>
                              <span>{userItem.username}</span>
                            </div>
                          </td>
                          <td className="email">{userItem.email}</td>
                          <td>{userItem.role.toUpperCase()}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(userItem)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(userItem.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteUser(userItem.id)}>
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
                  There is {isSearching ? searchResults.filter((u) => u.role === 'admin').length : totalAdmins} Total Admins
                </div>
              </div>
            </div>

            {/* Clients Table */}
            <div className="table-card" style={{ marginTop: '50px' }}>
              <div className="table-header">
                <h3>Clients ({isSearching ? searchResults.filter((u) => u.role === 'client').length : totalClients})</h3>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    Add New
                  </button>
                  <button className="btn btn-secondary" onClick={exportClients}>
                    <i className="fas fa-download"></i>
                    Export Clients
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table" id="consultationsTable">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="tableBody">
                    {isSearching && searchResults.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'red' }}>
                          No matching users found.
                        </td>
                      </tr>
                    ) : isSearching ? (
                      searchResults.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(userItem.username)}`}>
                                {userItem.username ? userItem.username.charAt(0).toUpperCase() : ''}
                              </div>
                              <span>{searchQuery ? highlight(userItem.username || '', searchQuery) : userItem.username}</span>
                            </div>
                          </td>
                          <td className="email">{searchQuery ? highlight(userItem.email || '', searchQuery) : userItem.email}</td>
                          <td>{searchQuery ? highlight(userItem.role ? userItem.role.toUpperCase() : '', searchQuery) : userItem.role ? userItem.role.toUpperCase() : ''}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(userItem)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(userItem.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteUser(userItem.id)}>
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      clients.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(userItem.username)}`}>
                                {userItem.username.charAt(0).toUpperCase()}
                              </div>
                              <span>{userItem.username}</span>
                            </div>
                          </td>
                          <td className="email">{userItem.email}</td>
                          <td>{userItem.role.toUpperCase()}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(userItem)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(userItem.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteUser(userItem.id)}>
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
                  There is {isSearching ? searchResults.filter((u) => u.role === 'client').length : totalClients} Total Clients
                </div>
              </div>
            </div>

            {/* Managers Table */}
            <div className="table-card" style={{ marginTop: '50px', marginBottom: '70px' }}>
              <div className="table-header">
                <h3>Managers ({isSearching ? searchResults.filter((u) => u.role === 'manager').length : totalManagers})</h3>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    Add New
                  </button>
                  <button className="btn btn-secondary" onClick={exportManagers}>
                    <i className="fas fa-download"></i>
                    Export Managers
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table" id="consultationsTable">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="tableBody">
                    {isSearching && searchResults.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'red' }}>
                          No matching users found.
                        </td>
                      </tr>
                    ) : isSearching ? (
                      searchResults.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(userItem.username)}`}>
                                {userItem.username ? userItem.username.charAt(0).toUpperCase() : ''}
                              </div>
                              <span>{searchQuery ? highlight(userItem.username || '', searchQuery) : userItem.username}</span>
                            </div>
                          </td>
                          <td className="email">{searchQuery ? highlight(userItem.email || '', searchQuery) : userItem.email}</td>
                          <td>{searchQuery ? highlight(userItem.role ? userItem.role.toUpperCase() : '', searchQuery) : userItem.role ? userItem.role.toUpperCase() : ''}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(userItem)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(userItem.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteUser(userItem.id)}>
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      managers.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(userItem.username)}`}>
                                {userItem.username.charAt(0).toUpperCase()}
                              </div>
                              <span>{userItem.username}</span>
                            </div>
                          </td>
                          <td className="email">{userItem.email}</td>
                          <td>{userItem.role.toUpperCase()}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View" onClick={() => openViewModal(userItem)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon" onClick={() => openEditModal(userItem.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => deleteUser(userItem.id)}>
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
                  There is {isSearching ? searchResults.filter((u) => u.role === 'manager').length : totalManagers} Total Managers
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
              <h2>{getRoleLabel(viewModal)}</h2>
              <p><strong>Username:</strong> {capitalize(viewModal.username)}</p>
              <p><strong>Email:</strong> {viewModal.email}</p>
              <p><strong>Role:</strong> {capitalize(viewModal.role)}</p>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="modal-overlay active" id="mobileOverlay1">
            <div className="modal-content-fullscreen" id="modalFormContainer">
              <form id="updateUserForm" onSubmit={handleEditSubmit}>
                <button type="button" className="close-btn" onClick={closeEditModal}>
                  ×
                </button>
                <h2>Edit User</h2>

                <label>Username</label>
                <input type="text" name="username" value={editForm.username} onChange={handleEditFormChange} required />

                <label>Email</label>
                <input type="email" name="email" value={editForm.email} onChange={handleEditFormChange} required />

                <label>Role</label>
                <select name="role" value={editForm.role} onChange={handleEditFormChange} required>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {capitalize(r)}
                    </option>
                  ))}
                </select>

                <label>New Password (leave blank to keep current)</label>
                <input type="password" name="password" value={editForm.password} onChange={handleEditFormChange} />

                <p id="updateMessage" style={{ color: 'red', marginTop: '5px' }}>{editMessage}</p>

                <button type="submit" disabled={editLoading}>
                  {editLoading ? 'Updating...' : 'Update User'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add New User Modal */}
        {addModalOpen && (
          <div className="modal-overlay2 active" id="mobileOverlay2">
            <div className="modal-content-fullscreen2" id="modalFormContainer2">
              <form id="signupForm" onSubmit={handleAddSubmit}>
                <button type="button" className="close-btn" onClick={closeAddModal}>
                  ×
                </button>
                <h2>Create New User</h2>

                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={addForm.username} onChange={handleAddFormChange} required />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={addForm.email} onChange={handleAddFormChange} required />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={addForm.password} onChange={handleAddFormChange} required />
                </div>

                <div className="form-group">
                  <label>User Role</label>
                  <select name="role" value={addForm.role} onChange={handleAddFormChange} required>
                    <option value="">Select Role</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {capitalize(r)}
                      </option>
                    ))}
                  </select>
                </div>

                <div id="signupErrorMessage" className="error-message" style={{ display: addMessage ? 'block' : 'none', color: 'red', margin: '10px 0' }}>{addMessage}</div>

                <button type="submit" disabled={addLoading}>
                  {addLoading ? 'Creating...' : 'Create User'}
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

export default UsersManager;
