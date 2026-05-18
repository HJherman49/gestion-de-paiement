import React, { useState } from 'react';
import { sanctumApi } from '../axios';
import '../styles/components/Login.css';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (error: any) => {
    const responseData = error.response?.data;
    if (!responseData) {
      return 'Erreur de connexion';
    }

    if (typeof responseData.message === 'string') {
      return responseData.message;
    }

    if (responseData.errors) {
      return Object.values(responseData.errors)
        .flat()
        .filter((value): value is string => typeof value === 'string')
        .join(' ');
    }

    return 'Erreur de connexion';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login directly (CSRF not required for this endpoint)
      const response = await sanctumApi.post('/api/v1/login', { email, password });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      onLogin(token, user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Connexion</h2>
        <p className="login-subtitle">Connectez-vous à votre compte</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group with-margin">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Votre mot de passe"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--instat-gray-50)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--instat-gray-400)'
        }}>
          <strong>Compte de test:</strong><br />
          Email: test@example.com<br />
          Mot de passe: password
        </div>
      </div>
    </div>
  );
};