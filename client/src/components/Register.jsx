import React, { useState } from "react";
import axios from "axios";

function Register({ onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!name || !email || !password || !passwordConfirm) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return false;
    }
    if (
      password.includes(name.split(" ")[0]) ||
      password.includes(name.split(" ")[1]) ||
      password.includes(email)
    ) {
      setError("Password should not contain your name or email.");
      return false;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return false;
    }
    return true; // Validation passed
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear any previous errors
    if (!validateForm()) return; // Stop the form submission if validation fails

    try {
      const response = await axios.post("http://localhost:8000/register", {
        username: name,
        email,
        password,
      });

      if (response.status === 201) {
        alert("Registration successful!");
        onRegisterSuccess(); // Switch to another component upon successful registration
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError("Email already in use."); // Handle email already in use error
      } else {
        setError(
          "Registration error: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </label>
        <button type="submit">Register</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
