"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    razonSocial: "",
    nombre: "",
    email: "",
    correoAsesor: "",
    password: "",
    confirmPassword: "",
    role: "Cliente",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedInduction, setAcceptedInduction] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validations
    if (!formData.email || !formData.password || !formData.role || !formData.confirmPassword) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    if (!formData.razonSocial && !formData.nombre) {
      setError("Debes ingresar una Razón Social o un Nombre de Persona Natural.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!acceptedTerms) {
      setError("Debes aceptar la autorización para el tratamiento de datos personales de Hierros HB.");
      return;
    }

    if (!acceptedInduction) {
      setError("Debes declarar que has leído y aceptado la Inducción SAGRILAFT de Hierros HB.");
      return;
    }

    setIsLoading(true);

    const res = await register({
      razonSocial: formData.razonSocial,
      nombre: formData.nombre,
      email: formData.email,
      correoAsesor: formData.correoAsesor,
      password: formData.password,
      role: formData.role
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } else {
      setError(res.error);
    }

    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .register-container * { box-sizing: border-box; }

        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          padding: 2rem 1rem;
        }

        /* Full Background */
        .register-bg {
          position: absolute;
          inset: 0;
          background-image: url('/login-bg.png');
          background-size: cover;
          background-position: center;
          z-index: 0;
        }
        .register-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(20,0,0,0.85) 0%, rgba(50,10,10,0.7) 100%);
          z-index: 1;
        }

        /* Main Card */
        .register-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          background: #e8ecec; /* Light grey/blue background similar to the image */
          border-radius: 12px;
          display: flex;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: visible; /* Allow the red banner to stick out */
        }

        @media (max-width: 900px) {
          .register-card {
            flex-direction: column;
            overflow: hidden;
          }
        }

        /* ── LEFT PANEL (Visual) ── */
        .register-left {
          flex: 0 0 40%;
          display: flex;
          align-items: center;
          position: relative;
          padding: 3rem 0;
        }
        @media (max-width: 900px) {
          .register-left { display: none; }
        }

        /* The floating red banner */
        .register-banner {
          background: #b11f24; /* Adjusted red to match Hierros HB slightly */
          color: white;
          padding: 3rem 2rem;
          margin-left: -2rem; /* Stick out to the left */
          width: calc(100% + 2rem);
          box-shadow: 0 10px 25px rgba(177, 31, 36, 0.4);
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          position: relative;
        }

        .register-banner h1 {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        /* ── RIGHT PANEL (Form) ── */
        .register-right {
          flex: 1;
          padding: 3.5rem 4rem 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .register-right { padding: 2.5rem 1.5rem; }
        }

        .register-top-links {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 0.85rem;
          color: #6b7280;
        }
        .register-top-links a {
          color: #b11f24;
          font-weight: 700;
          text-decoration: none;
          margin-left: 0.4rem;
          transition: opacity 0.2s;
        }
        .register-top-links a:hover { opacity: 0.75; }

        .register-header {
          margin-bottom: 2rem;
        }
        .register-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        /* ── FORM ── */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .register-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }
        .register-field label .req { color: #dc2626; }
        
        /* Modern solid inputs like the image */
        .register-input-wrap {
          position: relative;
        }
        .register-input-wrap input, .register-input-wrap select {
          width: 100%;
          background: white;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 0.8rem 1rem;
          font-size: 0.95rem;
          font-family: inherit;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .register-input-wrap input::placeholder { color: #d1d5db; font-weight: 300; }
        .register-input-wrap input:focus, .register-input-wrap select:focus {
          border-color: #b11f24;
          box-shadow: 0 0 0 3px rgba(177, 31, 36, 0.1);
        }
        
        .register-eye-btn {
          position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 0.25rem;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .register-eye-btn:hover { color: #b11f24; }

        /* Terms */
        .register-terms {
          display: flex; align-items: flex-start; gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .register-terms input {
          margin-top: 0.25rem;
          accent-color: #b11f24;
          width: 16px; height: 16px;
          min-width: 16px;
          flex-shrink: 0;
        }
        .register-terms label {
          font-size: 0.85rem; color: #4b5563; line-height: 1.5; cursor: pointer;
        }
        .register-terms a {
          color: #b11f24; font-weight: 600; text-decoration: underline;
        }

        /* Buttons */
        .register-btn {
          background: #b11f24;
          color: white;
          border: none;
          padding: 0.9rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 200px;
        }
        .register-btn:hover:not(:disabled) { background: #8a171b; }
        .register-btn:disabled { background: #d1d5db; cursor: not-allowed; }

        .form-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        /* Messages */
        .register-error {
          background: #fef2f2; border-left: 3px solid #dc2626; color: #b91c1c;
          font-size: 0.85rem; padding: 0.75rem 1rem; margin-bottom: 1.5rem;
        }
        .register-success {
          background: #ecfdf5; border-left: 3px solid #10b981; color: #047857;
          font-size: 0.85rem; padding: 0.75rem 1rem; margin-bottom: 1.5rem;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        
        @media (max-width: 900px) {
          .register-top-links { justify-content: flex-start; }
        }
      `}</style>

      <div className="register-container">
        <div className="register-bg" />
        <div className="register-overlay" />

        <div className="register-card">

          {/* ── LEFT PANEL ── */}
          <div className="register-left">
            <div className="register-banner">
              <h1>
                CREZCAMOS<br />
                JUNTOS<br />
                CON HIERROS HB!
              </h1>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="register-right">

            <div className="register-top-links">
              ¿Ya tienes una cuenta? <Link href="/auth/login">Inicia sesión aquí!</Link>
            </div>

            <div className="register-header">
              <h2>Crear Cuenta</h2>
            </div>

            {error && <div className="register-error">{error}</div>}
            {success && <div className="register-success">Registro exitoso. Redirigiendo al inicio de sesión...</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                <div className="register-field">
                  <label htmlFor="role">Tipo de Vinculación <span className="req">*</span></label>
                  <div className="register-input-wrap">
                    <select id="role" name="role" value={formData.role} onChange={handleChange} disabled={isLoading}>
                      <option value="Cliente">Cliente</option>
                      <option value="Proveedor">Proveedor</option>
                      <option value="Empleado">Empleado</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="email">Correo Electrónico <span className="req">*</span></label>
                  <div className="register-input-wrap">
                    <input id="email" name="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={handleChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="correoAsesor">Correo del Asesor <span style={{ fontWeight: 'normal', fontSize: '0.7rem' }}>(Opcional)</span></label>
                  <div className="register-input-wrap">
                    <input id="correoAsesor" name="correoAsesor" type="email" placeholder="asesor@hierroshb.com" value={formData.correoAsesor} onChange={handleChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="razonSocial">Razón Social <span style={{ fontWeight: 'normal', fontSize: '0.7rem' }}>(Jurídicas)</span></label>
                  <div className="register-input-wrap">
                    <input id="razonSocial" name="razonSocial" type="text" placeholder="Ej. Empresa S.A.S" value={formData.razonSocial} onChange={handleChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="nombre">Nombre <span style={{ fontWeight: 'normal', fontSize: '0.7rem' }}>(Personas Naturales)</span></label>
                  <div className="register-input-wrap">
                    <input id="nombre" name="nombre" type="text" placeholder="Ej. Juan Pérez" value={formData.nombre} onChange={handleChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="password">Contraseña <span className="req">*</span></label>
                  <div className="register-input-wrap">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={isLoading} />
                    <button type="button" className="register-eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="confirmPassword">Confirmar Contraseña <span className="req">*</span></label>
                  <div className="register-input-wrap">
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} />
                    <button type="button" className="register-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                      {showConfirmPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <div className="register-terms">
                <input id="terms" name="terms" type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} disabled={isLoading} />
                <label htmlFor="terms">
                  Creando tu cuenta aceptas la{" "}
                  <a href="/Tratamiento_datos_personales.pdf" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    autorización para el tratamiento de datos personales
                  </a>{" "}
                  de Hierros HB. <span className="req text-red-600">*</span>
                </label>
              </div>

              <div className="register-terms" style={{ marginTop: '-1.25rem' }}>
                <input id="induction" name="induction" type="checkbox" checked={acceptedInduction} onChange={(e) => setAcceptedInduction(e.target.checked)} disabled={isLoading} />
                <label htmlFor="induction">
                  Declaro que he leído y acepto la{" "}
                  <a href="/Induccion_SAGRILAFT.pdf" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    Inducción SAGRILAFT
                  </a>{" "}
                  de Hierros HB. <span className="req text-red-600">*</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="register-btn" disabled={isLoading || success}>
                  {isLoading ? (
                    <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : "Crear Cuenta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
