import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { requestsAPI } from '../api';
import { getAvatarColor, capitalize, formatDate, initDashboardScripts, initProfileDropdown } from '../helpers';
import '../styles/dashboard/admin.css';

const Requests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalDismissed, setTotalDismissed] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const searchTimeoutRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await requestsAPI.getAll();
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.consultations || [];
        setConsultations(list);
        setTotalConsultations(list.length);
        setTotalApproved(list.filter((c) => c.status === 'approved').length);
        setTotalPending(list.filter((c) => c.status === 'pending').length);
        setTotalDismissed(list.filter((c) => c.status === 'dismissed').length);
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
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }
      // For requests, use consultations search
      fetch(`/api/consultations/search?query=${encodeURIComponent(query.trim())}`)
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

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this consultation?`)) return;
    try {
      const res = await requestsAPI.action(id, action);
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayData = searchResults !== null ? searchResults : consultations;

  const filteredData = displayData.filter((item) => {
    if (statusFilter === 'all') return true;
    return (item.status || 'pending').toLowerCase() === statusFilter;
  });

  const username = user?.username || '';
  const role = user?.role || '';

  const highlight = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
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
          <li className="menu-item active">
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
            <h1 className="page-title">Requests</h1>
          </div>

          <div className="top-bar-right">
            {/* Search Bar */}
            <div className="search-container">
              <button className="search-toggle" style={{ display: 'none' }} id="searchToggle">
                <i className="fas fa-search"></i>
              </button>
              <div className="search-wrapper" id="searchWrapper">
                <div className="search-input-container">
                  <input
                    type="text"
                    id="searchInput"
                    className="search-input"
                    placeholder="Search..."
                    onChange={onSearchInput}
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
                <button className="search-close" style={{ display: 'none' }} id="searchClose">
                  <i className="fas fa-times"></i>
                </button>
              </div>
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
                  <p className="widget-value">{totalApproved}</p>
                  <span className="widget-change positive">
                    <i className="fas fa-arrow-up"></i>
                    approved recently
                  </span>
                </div>
              </div>

              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Pending Requests</h3>
                  <p className="widget-value">{totalPending}</p>
                  <span className="widget-change neutral" style={{ color: '#d8bd0d' }}>
                    <i className="fas fa-hourglass-half"></i>
                    currently waiting
                  </span>
                </div>
              </div>

              <div className="widget-card">
                <div className="widget-icon">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="widget-content">
                  <h3 className="widget-title">Dismissed Requests</h3>
                  <p className="widget-value">{totalDismissed}</p>
                  <span className="widget-change negative">
                    <i className="fas fa-arrow-down"></i>
                    dismissed recently
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Requests Table */}
          <section className="table-section">
            <div className="table-card">
              <div className="table-header">
                <h3>Requests ({totalConsultations})</h3>
                <div className="table-actions" style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ marginRight: '8px' }}>Filter Status:</label>
                  <select
                    id="statusFilter"
                    className="btn btn-secondary"
                    value={statusFilter}
                    onChange={handleStatusFilter}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table" id="requestsTable">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th className="hide-mobile">Service Type</th>
                      <th className="hide-mobile">Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="requestsBody">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'red' }}>
                          No matching records.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr key={item.id} data-status={(item.status || 'pending').toLowerCase()}>
                          <td>
                            <div className="client-info">
                              <div className={`client-avatar ${getAvatarColor(item.first_name)}`}>
                                {item.first_name?.charAt(0).toUpperCase()}
                              </div>
                              <span>
                                {searchQuery
                                  ? highlight(item.first_name, searchQuery)
                                  : item.first_name}{' '}
                                {searchQuery
                                  ? highlight(item.last_name, searchQuery)
                                  : item.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="hide-mobile">
                            {searchQuery
                              ? highlight(item.service, searchQuery)
                              : item.service}
                          </td>
                          <td className="hide-mobile">
                            {searchQuery
                              ? highlight(formatDate(item.submitted_at), searchQuery)
                              : formatDate(item.submitted_at)}
                          </td>
                          <td>
                            <span className={`status ${item.status || 'pending'}`}>
                              {capitalize(item.status || 'pending')}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <div className="dropdown">
                                <button className="btn-icon dropdown-toggle">
                                  Actions <i className="fas fa-caret-down"></i>
                                </button>
                                <div className="dropdown-menu">
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAction(item.id, 'approve');
                                    }}
                                  >
                                    Approve
                                  </a>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAction(item.id, 'dismiss');
                                    }}
                                  >
                                    Dismiss
                                  </a>
                                </div>
                              </div>
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
                  There is {totalConsultations} Total Requests
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal container for edit consultation */}
        <div className="modal-overlay" id="mobileOverlay1">
          <div className="modal-content-fullscreen" id="modalFormContainer">
            {/* Form will be inserted here via JS */}
          </div>
        </div>

        {/* Modal container for add new */}
        <div className="modal-overlay2" id="mobileOverlay2">
          <div className="modal-content-fullscreen2" id="modalFormContainer2">
            {/* Form will be inserted here via JS */}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" id="mobileOverlay"></div>
    </>
  );
};

export default Requests;
