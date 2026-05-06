"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: "Por favor ingresa tu correo.", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/reset-password-request", { email });
      setMessage({ text: res.data.message, type: "success" });
    } catch (error) {
      setMessage({ text: "Error al solicitar la recuperación.", type: "error" });
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "La contraseña debe tener al menos 6 caracteres.", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { token, newPassword });
      setMessage({ text: res.data.message + " Ya puedes iniciar sesión.", type: "success" });
    } catch (error) {
      setMessage({ text: error.response?.data?.error || "Error al restablecer contraseña.", type: "error" });
    }
    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .login-page * { box-sizing: border-box; }

        .login-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', system-ui, sans-serif;
          background: #f5f5f5;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          flex: 1;
          position: relative;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 992px) { .login-left { display: block; } }

        .login-left-bg {
          position: absolute;
          inset: 0;
          background-image: url('/login-bg.png');
          background-size: cover;
          background-position: center;
        }
        .login-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139,0,0,0.82) 0%, rgba(30,0,0,0.65) 100%);
        }
        .login-left-content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem 2.5rem 2rem;
          color: white;
        }
        
        .login-hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-hero-text h1 {
          font-size: 3.4rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 0.8rem;
          letter-spacing: -1px;
          text-shadow: 0 2px 16px rgba(0,0,0,0.5);
        }
        .login-hero-text p {
          font-size: 0.95rem;
          font-weight: 400;
          opacity: 0.9;
          line-height: 1.65;
          max-width: 360px;
        }

        /* stats */
        .login-stats {
          display: flex; flex-wrap: wrap; gap: 0.6rem;
          margin-top: 1.4rem;
        }
        .login-stat {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          padding: 0.38rem 0.9rem;
          font-size: 0.8rem; font-weight: 600;
          color: white;
        }
        .login-stat-icon { font-size: 0.95rem; }

        /* website link */
        .login-website-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: white;
          color: #8b0000;
          border: none; border-radius: 8px;
          padding: 0.55rem 1.15rem;
          font-size: 0.84rem; font-weight: 700;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          transition: transform 0.15s, box-shadow 0.15s;
          width: fit-content;
        }
        .login-website-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(0,0,0,0.28);
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          width: 100%;
          max-width: 580px;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 3.5rem;
          position: relative;
          box-shadow: -8px 0 40px rgba(0,0,0,0.08);
          overflow-y: auto;
        }
        @media (max-width: 767px) {
          .login-right { max-width: 100%; padding: 2rem 1.5rem; }
        }

        .login-mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 992px) { .login-mobile-logo { display: none; } }
        .login-mobile-logo img { height: 40px; width: auto; object-fit: contain; }

        .login-form-header { margin-bottom: 2.2rem; }
        .login-form-header h2 {
          font-size: 2rem; font-weight: 800;
          color: #1a1a1a; margin: 0 0 0.4rem;
          letter-spacing: -0.3px;
        }
        .login-form-header p {
          font-size: 0.9rem; color: #6b7280;
          margin: 0;
        }

        /* ── INPUT GROUP ── */
        .login-field { margin-bottom: 1.5rem; }
        .login-field label {
          display: block;
          font-size: 0.78rem; font-weight: 600;
          color: #9ca3af; text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 0.5rem;
        }
        .login-input-wrap {
          position: relative;
          border-bottom: 2px solid #e5e7eb;
          transition: border-color 0.2s;
        }
        .login-input-wrap:focus-within { border-color: #8b0000; }
        .login-input-wrap input {
          width: 100%;
          border: none; outline: none;
          background: transparent;
          font-size: 0.95rem; font-weight: 400;
          color: #1a1a1a;
          padding: 0.6rem 2.2rem 0.6rem 0;
          font-family: inherit;
        }
        .login-input-wrap input::placeholder { color: #d1d5db; }
        .login-input-wrap input:disabled { opacity: 0.5; }
        
        .login-eye-btn {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 0.25rem;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .login-eye-btn:hover { color: #8b0000; }

        .login-error {
          background: #fef2f2; border-left: 3px solid #dc2626;
          color: #b91c1c; font-size: 0.84rem;
          padding: 0.75rem 1rem; border-radius: 6px;
          margin-bottom: 1.2rem;
        }
        .login-success {
          background: #ecfdf5; border-left: 3px solid #10b981;
          color: #047857; font-size: 0.84rem;
          padding: 0.75rem 1rem; border-radius: 6px;
          margin-bottom: 1.2rem;
        }

        /* ── SUBMIT BUTTON ── */
        .login-btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #8b0000 0%, #a80000 100%);
          color: white; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          margin-top: 2rem;
          box-shadow: 0 4px 15px rgba(139,0,0,0.35);
          transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
          letter-spacing: 0.03em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139,0,0,0.45);
          background: linear-gradient(135deg, #7a0000 0%, #960000 100%);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { background: #d1d5db; box-shadow: none; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        .login-register {
          text-align: center; margin-top: 1.8rem;
          font-size: 0.88rem; color: #6b7280;
        }
        .login-register a {
          color: #8b0000; font-weight: 700; text-decoration: none;
          transition: opacity 0.2s;
        }
        .login-register a:hover { opacity: 0.75; }
      `}</style>

      <div className="login-page">
        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-left-bg" />
          <div className="login-left-overlay" />
          <div className="login-left-content">
            <div className="login-hero-text">
              <h1>Bienvenidos a<br />SAGRILAFT</h1>
              <p>
                Plataforma oficial de cumplimiento normativo de <strong>Hierros HB S.A.</strong> — Líderes en comercialización de materiales para la construcción en Colombia.
              </p>
              <div className="login-stats">
                <span className="login-stat"><span className="login-stat-icon">🏆</span> Líderes del sector</span>
                <span className="login-stat"><span className="login-stat-icon">📦</span> Portafolio amplio</span>
                <span className="login-stat"><span className="login-stat-icon">🤝</span> Atención personalizada</span>
              </div>
            </div>
            
            <a href="https://www.hierroshb.com/" target="_blank" rel="noopener noreferrer" className="login-website-btn">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visita nuestra página web
            </a>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-mobile-logo">
            <Image src="/logo.png" alt="Hierros HB" width={120} height={40} style={{ height: 40, width: 'auto' }} />
          </div>

          <div className="login-form-header">
            <h2>{token ? "Nueva Contraseña" : "Recuperar Contraseña"}</h2>
            <p>{token ? "Ingresa tu nueva contraseña segura" : "Te enviaremos las instrucciones a tu correo"}</p>
          </div>

          {message.text && (
            <div className={message.type === 'error' ? 'login-error' : 'login-success'}>
              {message.text}
            </div>
          )}

          {!token ? (
            <form onSubmit={handleRequestReset}>
              <div className="login-field">
                <label>Correo Electrónico</label>
                <div className="login-input-wrap">
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || message.type === 'success'}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading || message.type === 'success'} className="login-btn">
                {isLoading ? (
                  <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    Enviar Instrucciones
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="login-field">
                <label>Nueva Contraseña</label>
                <div className="login-input-wrap">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading || message.type === 'success'}
                    autoComplete="new-password"
                  />
                  <button type="button" className="login-eye-btn" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                    {showNewPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label>Confirmar Nueva Contraseña</label>
                <div className="login-input-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || message.type === 'success'}
                    autoComplete="new-password"
                  />
                  <button type="button" className="login-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                    {showConfirmPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading || message.type === 'success'} className="login-btn">
                {isLoading ? (
                  <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    Restablecer Contraseña
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {message.type === 'success' && token && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/auth/login" className="login-website-btn" style={{ background: '#8b0000', color: 'white', display: 'inline-flex' }}>
                Ir a Iniciar Sesión
              </Link>
            </div>
          )}

          <p className="login-register">
            <Link href="/auth/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
