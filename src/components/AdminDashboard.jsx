import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const { token, setToken, loading } = useContext(AuthContext);
  const [usersWithJournals, setUsersWithJournals] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = () => {
    if (token) {
      axios
        .get("http://localhost:8080/journal/admin/all-users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsersWithJournals(res.data))
        .catch((err) => {
          setFetchError("Failed to fetch users and journals.");
          console.error(err);
        });
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handlePromoteToAdmin = (userId) => {
    if (!window.confirm("Are you sure you want to make this user an admin?"))
      return;
    axios
      .post(
        `http://localhost:8080/journal/admin/create-admin/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        alert("Failed to create admin.");
        console.error(err);
      });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/journal/admin/delete-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user.");
      console.error(err);
    }
  };

  // const handleDeleteJournal = async (journalId) => {
  //   if (!window.confirm("Delete this journal entry?")) return;
  //   try {
  //     await axios.delete(`http://localhost:8080/journal/admin/delete-journal/${journalId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     fetchUsers();
  //   } catch (err) {
  //     alert("Failed to delete journal.");
  //     console.error(err);
  //   }
  // };

  const filteredUsers = usersWithJournals.filter((user) =>
    user.username?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div
      className="container px-5 py-4 border-0 shadow rounded-4"
      style={{ minHeight: "100vh", minWidth: "90vw", background: "#f4f6fb" }}
    >
      <h2 className="mb-3 text-primary">🛡️ Admin Dashboard</h2>
      <p className="text-muted">Manage all users and their journals.</p>

      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-success me-2"
          onClick={() => navigate("/dashboard")}
        >
          <i className="bi bi-person-circle me-1"></i>My Dashboard
        </button>
        <button
          className="btn btn-outline-danger btn-lg"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>

      <div className="mb-4" style={{ maxWidth: "500px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search users..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
      </div>

      {fetchError && <div className="alert alert-danger">{fetchError}</div>}

      {filteredUsers.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <div className="g-4">
          {filteredUsers.map((user) => (
            <div className="col-12" key={user.id}>
              <div className="card border-0 shadow rounded-4 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="mb-1">
                      👤 {user.username}
                      {user.email && (
                        <span className="text-muted small ms-2">
                          ({user.email})
                        </span>
                      )}
                    </h5>
                    <div className="small d-flex flex align-items-start">
                      {user.roles.map((role, i) => (
                        <span
                          key={i}
                          className={`badge bg-${
                            role === "ADMIN" ? "danger" : "secondary"
                          } me-2`}
                        >
                          {role}
                        </span>
                      ))}
                      {user.sentimentAnalysis && (
                        <span className="badge bg-info">Sentiment ON</span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <span className="text-muted small">
                      🆔 {user.id.slice(-6)}
                    </span>
                    {!user.roles.includes("ADMIN") && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handlePromoteToAdmin(user.id)}
                      >
                        👑 Create Admin
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      🗑️ Delete User
                    </button>
                  </div>
                </div>

                {user.journalEntries && user.journalEntries.length > 0 ? (
                  <div className="row g-3">
                    {user.journalEntries.map((journal) => (
                      <div className="col-md-6 col-lg-4" key={journal.id}>
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title text-primary">
                              📝 {journal.title}
                            </h6>
                            <p className="card-text flex-grow-1">
                              {journal.content}
                            </p>
                            <p className="text-muted small">
                              📅 {new Date(journal.date).toLocaleDateString()}
                            </p>
                            {/* <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteJournal(journal.id)}
                            >
                              🗑️ Delete Journal
                            </button> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted fst-italic ms-2">
                    No journal entries.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
