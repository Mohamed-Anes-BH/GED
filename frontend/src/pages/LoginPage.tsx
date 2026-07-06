import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();


  return (
    <div className={`login-page ${isDark ? 'dark-mode' : ''}`}>
      {/* ===== LEFT SIDE ===== */}
      <div className="login-left">
        {/* Decorative elements */}
        <div className="login-left-circle login-left-circle-1" />
        <div className="login-left-circle login-left-circle-2" />
        <div className="login-left-arc login-left-arc-1" />
        <div className="login-left-arc login-left-arc-2" />

        {/* Top-left logo */}
        <div className="login-left-header">
          <img
            src="/images/agrodiv-logo-transparent.png"
            alt="AgrOdiv"
            className="login-header-logo"
          />
          <span className="login-header-divider">|</span>
          <span className="login-header-label">GED</span>
        </div>

        {/* Welcome text */}
        <div className="login-welcome">
          <h1 className="login-welcome-title">
            Bienvenue<span className="login-dot">.</span>
          </h1>
          <p className="login-welcome-sub">
            Connectez-vous pour accéder<br />
            à votre espace documentaire.
          </p>
        </div>

        {/* Background image */}
        <div className="login-left-image">
          <img 
            src={isDark ? "/images/dark-office-bg.png" : "/images/office-bg.png"} 
            alt="Bureau" 
          />
        </div>

        {/* Bottom badge */}
        <div className="login-left-badge">
          <div className="login-badge-icon">
            <Shield size={20} />
          </div>
          <div>
            <strong>Sécurisé. Organisé. Fiable.</strong>
            <span>Vos documents, notre priorité.</span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="login-right">
        {/* Theme toggle */}
        <div className="login-theme-toggle">
          <button
            className={`theme-btn ${isDark ? 'active' : ''}`}
            onClick={() => setIsDark(true)}
            aria-label="Mode sombre"
          >
            <Moon size={16} />
          </button>
          <button
            className={`theme-btn ${!isDark ? 'active' : ''}`}
            onClick={() => setIsDark(false)}
            aria-label="Mode clair"
          >
            <Sun size={16} />
          </button>
        </div>

        {/* Login card */}
        <div className="login-card">
          {/* Card logo */}
          <div className="login-card-brand">
            <img
              src="/images/agrodiv-logo-transparent.png"
              alt="AgrOdiv"
              className="login-card-logo"
            />
            <h2 className="login-card-title">
              Gestion Electronique<br />
              des <span className="login-highlight">Documents</span>
            </h2>
          </div>

          {/* Form */}
          <form
            className="login-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg('');
              setLoading(true);
              try {
                const response = await api.post('auth/login/', {
                  email,
                  password
                });
                const { access, refresh } = response.data;
                await auth.login(access, refresh);
                onLogin();
              } catch (err: any) {
                console.error("Login Error:", err);
                setErrorMsg('Identifiants incorrects. Veuillez réessayer.');
              } finally {
                setLoading(false);
              }
            }}
          >
            {errorMsg && (
              <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {errorMsg}
              </div>
            )}
            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Entrez votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Mot de passe</label>
              <div className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="login-options">
              <label className="login-checkbox-wrap" htmlFor="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="login-checkmark" />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="login-forgot">
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              <span className="login-submit-arrow">
                <ArrowRight size={18} />
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>Ou continuer avec</span>
          </div>

          {/* Social Buttons */}
          <div className="login-social-row">
            <button className="login-social-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="login-social-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

          {/* Footer */}
          <p className="login-card-footer">
            Version 2.0.0 &nbsp;•&nbsp; AgrOdiv © 2024 Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}