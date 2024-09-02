import React, { useEffect, useState } from "react";
import axios from "axios";
import UserProfile from "./UserProfile"; // Import UserProfile component

function AdminProfile({ key, model, updateModel }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleUserSelect = (userId) => {
    console.log("Clicked User ID:", userId);
    const selectedUser = users.find((user) => user._id === userId);
    if (!selectedUser) {
      console.error("Selected user not found");
      return;
    }
    console.log("Selected User ID:", selectedUser._id);
    setSelectedUserId(userId); // Set the selected user ID to render UserProfile
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/users")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  const handleUserDelete = (userId) => {
    const user = users.find((user) => user._id === userId);
    if (!user) {
      alert("User not found.");
      return;
    }

    // Check if the user is an admin
    const confirmMessage =
      user.role === "admin"
        ? "Are you sure you want to delete the ADMIN user and all associated content?"
        : "Are you sure you want to delete this user and all associated content?";

    if (window.confirm(confirmMessage)) {
      axios
        .delete(`http://localhost:8000/api/users/${userId}`)
        .then(() => {
          alert("User deleted successfully.");
          const updatedUsers = users.filter((user) => user._id !== userId);
          setUsers(updatedUsers);
        })
        .catch((error) => {
          console.error("Failed to delete user:", error);
          alert("Error deleting user. Please try again.");
        });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (selectedUserId) {
    console.log("About to set selected user ID to:", selectedUserId);
    return <UserProfile model={model} updateModel={updateModel} />;
  }

  
if (users.length === 0) {
  window.alert("There are no users in the database, so if you refresh you will have to register as a new user because you don't exist T-T.");
}

  return (
    <div className="admin-profile">
      <h1>Admin Profile</h1>
      <p>Member since: {formatDate(model.user.memberSince)}</p>
      <p>Reputation: {model.user.reputation}</p>
      <h3>All Users:</h3>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user._id}>
              <p>
                <a href="#" onClick={() => handleUserSelect(user._id)}>
                  {user.username}
                </a>
              </p>
              <button onClick={() => handleUserDelete(user._id)}>Delete</button>
            </li>
          ))
        ) : (
          <h3>THERE IS NOTHING IN THE DATABASE. DO GOOD MARKETING.</h3>
        )}
      </ul>
    </div>
  );
}

export default AdminProfile;
