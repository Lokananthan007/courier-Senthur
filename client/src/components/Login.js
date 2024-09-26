import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/login`, {
        username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setError('');
      navigate('/Weight'); // Redirect after successful login
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login">
      <div className="login-wrapper">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-field">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Username</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>
          <button type="submit" className="login-button">Login</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
