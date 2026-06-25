import React, { useState } from 'react';
import { sanctumApi } from '../axios';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import '../styles/components/Login.css';
import logoInstat from '../assets/logo-instat.png'; 

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const getErrorMessage = (error: any) => {
    const data = error.response?.data;
    if (!data) return 'Erreur de connexion. Vérifiez votre connexion réseau.';
    if (typeof data.message === 'string') return data.message;
    if (data.errors) {
      return Object.values(data.errors).flat()
        .filter((v): v is string => typeof v === 'string').join(' ');
    }
    return 'Email ou mot de passe incorrect.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');

    try {
      const response = await sanctumApi.post('/api/v1/login', { email, password });
      const apiData  = response.data;
      const payload  = apiData?.data ?? apiData;
      const token    = payload?.token ?? apiData?.token;
      const user     = payload?.user  ?? apiData?.user;

      if (!token || !user) throw new Error('Réponse de connexion invalide');

      localStorage.setItem('token', token);
      onLogin(token, user);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo / Titre */}
       <div className="login-brand">
          <img
            src={logoInstat}
            alt="Logo INSTAT"
            className="login-brand-logo"
          />
          <div>
            <h1 className="login-brand-title">SIRH — INSTAT</h1>
            <p className="login-brand-sub">Système d'Information des Ressources Humaines</p>
          </div>
        </div>

        <h2 className="login-title">Connexion</h2>
        <p className="login-subtitle">
          Entrez vos identifiants fournis par l'administrateur
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
              className="form-input"
              placeholder="votre@email.mg"
              autoComplete="email"
            />
          </div>

          <div className="form-group with-margin">
            <label className="form-label">Mot de passe</label>
            <div className="login-pwd-wrapper">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                required
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pwd-eye"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading
              ? <><span className="login-spinner" /> Connexion en cours...</>
              : <><LogIn size={15} /> Se connecter</>
            }
          </button>
        </form>

        <p className="login-footer-note">
          Votre accès et vos permissions sont définis par l'administrateur système.
        </p>
      </div>
    </div>
  );
};