import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const { token, setToken, loading } = useContext(AuthContext);
  const [journals, setJournals] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentJournal, setCurrentJournal] = useState({ title: "", content: "", id: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
    if (token) {
      axios
        .get("http://localhost:8080/journal/journal", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setJournals(res.data))
        .catch((err) => {
          setFetchError("Failed to fetch journals");
          console.error(err);
        });
    }
  }, [token]);

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
          "http://localhost:8080/journal/journal",
          {
            title: currentJournal.title,
            content: currentJournal.content,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJournals([res.data, ...journals]);
      } else {
        const res = await axios.put(
          `http://localhost:8080/journal/journal/id/${currentJournal.id || currentJournal._id}`,
          {
            title: currentJournal.title,
            content: currentJournal.content,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJournals(
          journals.map((j) =>
            (j.id || j._id) === (currentJournal.id || currentJournal._id) ? res.data : j
          )
        );
      }
      setShowModal(false);
      setCurrentJournal({ title: "", content: "", id: null });
    } catch (err) {
      alert("Failed to save journal.");
    }
    setSaving(false);
  };

  const handleDeleteJournal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this journal?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/journal/journal/id/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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


  return (

    <div
      className="container-xl py-4 px-5"
      style={{ minHeight: "100vh", background: "#f4f6fb", minWidth: "90vw" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="mb-2 fw-bold">📓 Journal Dashboard</h1>
          <div className="text-muted fs-5">Welcome back{username ? `, ${username} ` : ""}!</div>
        </div>
        <button
          className="btn btn-outline-danger btn-lg"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          Your Journals <span className="badge bg-primary fs-6">{journals.length}</span>
        </h4>
        <div>
          <button className="btn btn-success me-2" onClick={openAddModal}>
            <i className="bi bi-plus-lg me-1"></i>Add Journal
          </button>
          <input
            className="form-control d-inline-block"
            style={{ width: 220, verticalAlign: "middle" }}
            placeholder="Search journals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {fetchError && (
        <div className="alert alert-danger" role="alert">
          {fetchError}
        </div>
      )}
      <div className="row g-4">
        {filteredJournals.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info text-center">No journals found.</div>
          </div>
        )}
        {filteredJournals.map((journal) => (
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
                      onClick={() => handleDeleteJournal(journal.id || journal._id)}
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
        ))}
      </div>
      {showModal && (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSaveJournal}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === "add" ? "Add Journal" : "Edit Journal"}
                </h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3 text-start">
                  <label className="form-label">Title</label>
                  <input
                    name="title"
                    className="form-control"
                    value={currentJournal.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3 text-start">
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
                <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Modal backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  )}
    </div>
  );
}

export default Dashboard;