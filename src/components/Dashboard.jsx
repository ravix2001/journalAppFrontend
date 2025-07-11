import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const { token, setToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentJournal, setCurrentJournal] = useState({
    title: "",
    content: "",
    id: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    password: "",
    email: "",
    sentimentAnalysis: false,
  });

  const navigate = useNavigate();

  // Base API URL
  const API_BASE_URL = "https://journalapp-latest.onrender.com";

  // Fetch users
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    const storedUsername = localStorage.getItem("username") || "";
    const storedRole = localStorage.getItem("role") || "";
    setUsername(storedUsername);
    setRole(storedRole);
    setProfile((prev) => ({ ...prev, username: storedUsername }));

    if (token) {
      setLoading(true);
      await axios
        .get(`${API_BASE_URL}/journal`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsersWithJournals(res.data))
        .catch((err) => {
          setFetchError("Failed to fetch users and journals.");
          console.error(err);
        });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentJournal({ title: "", content: "", id: null });
    setShowModal(true);
  };

  const openEditModal = (journal) => {
    setModalMode("edit");
    setCurrentJournal({ ...journal });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentJournal({ title: "", content: "", id: null });
  };

  const handleInputChange = (e) => {
    setCurrentJournal({ ...currentJournal, [e.target.name]: e.target.value });
  };

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === "add") {
        const res = await axios.post(
          `${API_BASE_URL}/journal`,
          {
            title: currentJournal.title,
            content: currentJournal.content,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJournals([res.data, ...journals]);
      } else {
        const res = await axios.put(
          `${API_BASE_URL}/journal/id/${
            currentJournal.id || currentJournal._id
          }`,
          {
            title: currentJournal.title,
            content: currentJournal.content,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJournals(
          journals.map((j) =>
            (j.id || j._id) === (currentJournal.id || currentJournal._id)
              ? res.data
              : j
          )
        );
      }
      handleModalClose();
    } catch (err) {
      alert("Failed to save journal.");
    }
    setSaving(false);
  };

  const handleDeleteJournal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this journal?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/journal/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJournals(journals.filter((j) => (j.id || j._id) !== id));
    } catch (err) {
      alert("Failed to delete journal.");
    }
  };

  const filteredJournals = journals.filter(
    (journal) =>
      journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journal.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Profile Management ---
  const openProfileModal = () => setShowProfileModal(true);
  const closeProfileModal = () => setShowProfileModal(false);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`${API_BASE_URL}/user`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      setUsername(profile.username);
      localStorage.setItem("username", profile.username);
      closeProfileModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleLogout();
    } catch (err) {
      alert("Failed to delete profile.");
    }
  };

  return (
    <div
      className="container-xl py-4 px-5"
      style={{ minHeight: "100vh", background: "#f4f6fb", minWidth: "90vw" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="mb-2 fw-bold">📓 Journal Dashboard</h1>
          <div className="text-muted fs-5">
            Welcome back{username ? `, ${username} ` : ""}!
          </div>
        </div>
        <div className="d-flex gap-2">
          {role === "ROLE_ADMIN" && (
            <button
              className="btn btn-outline-dark me-2"
              onClick={() => navigate("/admin")}
            >
              <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
            </button>
          )}
          <button className="btn btn-outline-info" onClick={openProfileModal}>
            <i className="bi bi-person-circle me-2"></i>Edit Profile
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={handleDeleteProfile}
          >
            <i className="bi bi-person-x me-2"></i>Delete Profile
          </button>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          Your Journals{" "}
          <span className="badge bg-primary fs-6">{journals.length}</span>
        </h4>
        <div>
          <button className="btn btn-success me-2" onClick={openAddModal}>
            <i className="bi bi-plus-lg me-1"></i>Add Journal
          </button>
          <input
            className="form-control d-inline-block"
            style={{ width: 220 }}
            placeholder="Search journals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {fetchError && <div className="alert alert-danger">{fetchError}</div>}

      <div className="row g-4">
        {filteredJournals.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              No journals found.
            </div>
          </div>
        ) : (
          filteredJournals.map((journal) => (
            <div
              className="col-12 col-md-6 col-lg-6"
              key={journal.id || journal._id}
            >
              <div className="card h-100 shadow rounded-4 border-0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-journal-text me-2 text-primary"></i>
                    {journal.title}
                  </h5>
                  <p className="card-text flex-grow-1">{journal.content}</p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(journal)}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleDeleteJournal(journal.id || journal._id)
                        }
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                    {journal.date && (
                      <div className="text-end text-muted small">
                        <i className="bi bi-calendar-event me-1"></i>
                        {new Date(journal.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Journal Modal */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSaveJournal}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalMode === "add" ? "Add Journal" : "Edit Journal"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleModalClose}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        name="title"
                        className="form-control"
                        value={currentJournal.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Content</label>
                      <textarea
                        name="content"
                        className="form-control"
                        rows={4}
                        value={currentJournal.content}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleModalClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Profile</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeProfileModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      name="username"
                      className="form-control"
                      value={profile.username}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={profile.password}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      className="form-control"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="sentimentAnalysis"
                      checked={profile.sentimentAnalysis}
                      onChange={handleProfileChange}
                    />
                    <label className="form-check-label">
                      Enable Sentiment Analysis
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={closeProfileModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
