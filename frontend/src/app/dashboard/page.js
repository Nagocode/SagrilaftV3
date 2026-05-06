"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import api from "@/lib/api";

const DOC_META = {
  Cedula:         { label: "Cédula",             icon: "🪪", color: "#3b82f6" },
  CamaraComercio: { label: "Cámara de Comercio", icon: "🏢", color: "#8b5cf6" },
  Formulario:     { label: "Formulario SAGRILAFT",icon: "📋", color: "#10b981" },
  Rut:            { label: "RUT",                 icon: "📄", color: "#f59e0b" },
  CertificacionBancaria: { label: "Certificación Bancaria", icon: "🏦", color: "#0ea5e9" },
  BalanceGeneral: { label: "Balance General", icon: "📊", color: "#6366f1" },
  EstadoResultados: { label: "Estado de Resultados", icon: "📈", color: "#f43f5e" },
  EstadoFlujoEfectivo: { label: "Estado de Flujo de Efectivo", icon: "💸", color: "#10b981" },
  NotasEstadosFinancieros: { label: "Notas Estados Financieros", icon: "📝", color: "#64748b" },
  ReferenciaComercial1: { label: "Referencia Comercial 1", icon: "📎", color: "#8b5cf6" },
  ReferenciaComercial2: { label: "Referencia Comercial 2", icon: "📎", color: "#8b5cf6" },
  DeclaracionRenta: { label: "Declaración de Renta", icon: "🏛️", color: "#f59e0b" },
};

const REQUIRED_DOCS = ["Cedula", "CamaraComercio", "Formulario", "Rut", "CertificacionBancaria"];

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState([]);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [activeTab, setActiveTab] = useState("docs");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role === 'Admin') {
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  const fetchDocuments = async () => {
    setFetchingDocs(true);
    try {
      const res = await api.get("/uploads");
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error("Error fetching docs", error);
    }
    setFetchingDocs(false);
  };

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #8b0000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  const handleDownloadForm = () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/download-form`;
    window.open(url, '_blank');
  };

  const validDocs         = documents.filter(d => d.status !== 'rechazado' && d.status !== 'rejected');
  const uploadedTypes     = validDocs.map(d => d.type);
  const completedCount    = REQUIRED_DOCS.filter(t => uploadedTypes.includes(t)).length;
  const progressPercent   = Math.round((completedCount / REQUIRED_DOCS.length) * 100);
  const isComplete        = completedCount === REQUIRED_DOCS.length;
  const displayName       = user.razonSocial || user.nombre || user.email;

  const getStatusColor = (status) => {
    if (!status) return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
    const s = status.toLowerCase();
    if (s === "aprobado" || s === "approved") return { bg: "#dcfce7", text: "#14532d", dot: "#22c55e" };
    if (s === "rechazado" || s === "rejected") return { bg: "#fee2e2", text: "#7f1d1d", dot: "#ef4444" };
    return { bg: "#dbeafe", text: "#1e3a5f", dot: "#3b82f6" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .dash-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── TOP NAV ── */
        .dash-nav {
          background: #ffffff;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 0 #e2e8f0;
        }

        .dash-nav-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .dash-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dash-brand img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .dash-brand-divider {
          width: 1px;
          height: 28px;
          background: #e2e8f0;
        }

        .dash-brand-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dash-nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dash-user-chip {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          padding: 0.35rem 0.9rem 0.35rem 0.5rem;
        }

        .dash-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b0000, #dc2626);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .dash-user-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: #1e293b;
          max-width: 160px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .dash-logout-btn:hover {
          color: #8b0000;
          background: #fef2f2;
        }

        /* ── HERO BANNER ── */
        .dash-hero-container {
          max-width: 1200px;
          margin: 1.5rem auto 0;
          padding: 0 2rem;
          width: 100%;
        }

        .dash-hero {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem 2.5rem;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .dash-hero-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .dash-hero-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #8b0000;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.4rem;
        }

        .dash-hero-name {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .dash-hero-sub {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .dash-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #8b0000;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          margin-top: 1rem;
        }

        /* ── PROGRESS CARD in hero ── */
        .dash-progress-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem 1.75rem;
          min-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .dash-progress-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .dash-progress-pct {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
        }

        .dash-progress-bar-wrap {
          background: #e2e8f0;
          border-radius: 9999px;
          height: 8px;
          overflow: hidden;
        }

        .dash-progress-bar {
          height: 100%;
          border-radius: 9999px;
          background: #8b0000;
          transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .dash-progress-dots {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .dash-progress-dot {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748b;
        }

        .dash-progress-dot-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* ── MAIN CONTENT ── */
        .dash-content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem 2rem 2rem;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .dash-content {
            grid-template-columns: 1fr;
          }
        }

        /* ── SIDEBAR (left) ── */
        .dash-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dash-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .dash-card-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .dash-card-header-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #fef2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .dash-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .dash-card-body {
          padding: 1.25rem;
        }

        /* Profile fields */
        .dash-profile-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid #f8fafc;
        }

        .dash-profile-row:last-child { border-bottom: none; }

        .dash-profile-icon {
          font-size: 0.85rem;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
          color: #94a3b8;
        }

        .dash-profile-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          min-width: 80px;
        }

        .dash-profile-value {
          font-size: 0.82rem;
          font-weight: 500;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Download button */
        .dash-download-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 2px solid #8b0000;
          border-radius: 8px;
          color: #8b0000;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .dash-download-btn:hover {
          background: #8b0000;
          color: white;
        }

        /* ── MAIN PANEL (right) ── */
        .dash-main {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dash-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0;
        }

        .dash-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .dash-section-sub {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 0.15rem;
        }

        .dash-doc-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 0.2rem 0.65rem;
        }

        /* Doc rows */
        .dash-doc-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.15s;
        }
        .dash-doc-row:last-child { border-bottom: none; }
        .dash-doc-row:hover { background: #f8fafc; }

        .dash-doc-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .dash-doc-info { flex: 1; min-width: 0; }

        .dash-doc-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.2rem;
        }

        .dash-doc-meta {
          font-size: 0.73rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-doc-status {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 6px;
          padding: 0.28rem 0.7rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .dash-doc-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* Empty state */
        .dash-empty {
          text-align: center;
          padding: 3.5rem 1.5rem;
        }

        .dash-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.75rem;
        }

        .dash-empty-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.4rem;
        }

        .dash-empty-sub {
          font-size: 0.82rem;
          color: #94a3b8;
          max-width: 280px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Skeleton */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .dash-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="dash-root">

        {/* ── TOP NAV ── */}
        <nav className="dash-nav">
          <div className="dash-nav-left">
            <div className="dash-brand">
              <img src="/logo.png" alt="Hierros HB" />
              <div className="dash-brand-divider" />
              <span className="dash-brand-text">SAGRILAFT</span>
            </div>
          </div>
          <div className="dash-nav-right">
            <div className="dash-user-chip">
              <div className="dash-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="dash-user-name">{displayName}</span>
            </div>
            <button className="dash-logout-btn" onClick={logout}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
        </nav>

        {/* ── HERO BANNER ── */}
        <div className="dash-hero-container">
          <div className="dash-hero">
            <div className="dash-hero-inner">
              <div>
                <div className="dash-hero-title">Panel de Control</div>
                <h1 className="dash-hero-name">
                  {displayName}
                </h1>
                <p className="dash-hero-sub">Bienvenido a tu portal SAGRILAFT</p>
                <div className="dash-hero-badge">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Vinculación: {user.role} &nbsp;·&nbsp; {user.email}
                </div>
              </div>

              {/* Progress tracker */}
              <div className="dash-progress-card">
                <div className="dash-progress-label">
                  <span>Progreso Documental</span>
                  <span className="dash-progress-pct">{progressPercent}%</span>
                </div>
                <div>
                  <div className="dash-progress-bar-wrap">
                    <div className="dash-progress-bar" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.4rem" }}>
                    {completedCount} de {REQUIRED_DOCS.length} documentos cargados
                  </div>
                </div>
                <div className="dash-progress-dots">
                  {REQUIRED_DOCS.map(type => {
                    const docForType = documents.find(d => d.type === type);
                    const isRejected = docForType && (docForType.status === 'rechazado' || docForType.status === 'rejected');
                    const isDone = docForType && !isRejected;
                    const meta = DOC_META[type];
                    return (
                      <div key={type} className="dash-progress-dot">
                        <div className="dash-progress-dot-circle"
                          style={{ background: isDone ? "#22c55e" : isRejected ? "#ef4444" : "#cbd5e1" }}
                        />
                        {meta.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="dash-content">

          {/* ── SIDEBAR ── */}
          <div className="dash-sidebar">

            {/* Profile */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-header-icon">👤</div>
                <span className="dash-card-title">Información del Perfil</span>
              </div>
              <div className="dash-card-body" style={{ padding: "0.5rem 1.25rem" }}>
                <div className="dash-profile-row">
                  <span className="dash-profile-label">Empresa</span>
                  <span className="dash-profile-value">{user.razonSocial || user.nombre || "—"}</span>
                </div>
                <div className="dash-profile-row">
                  <span className="dash-profile-label">Correo</span>
                  <span className="dash-profile-value">{user.email}</span>
                </div>
                <div className="dash-profile-row">
                  <span className="dash-profile-label">Tipo</span>
                  <span className="dash-profile-value">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Download form */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-header-icon">📥</div>
                <span className="dash-card-title">Formulario Base</span>
              </div>
              <div className="dash-card-body">
                <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Descarga el formulario oficial SAGRILAFT, diligéncialo y fírmalo antes de subirlo junto con los demás documentos.
                </p>
                <button className="dash-download-btn" onClick={handleDownloadForm}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar Formulario
                </button>
              </div>
            </div>

            {/* Upload form */}
            <UploadForm onUploadSuccess={fetchDocuments} userRole={user.role} />
          </div>

          {/* ── MAIN PANEL ── */}
          <div className="dash-main">
            <div className="dash-card">
              <div className="dash-card-header" style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ flex: 1 }}>
                  <div className="dash-section-title">Estado de Documentación</div>
                  <div className="dash-section-sub">Documentos cargados para validación SAGRILAFT</div>
                </div>
                {!fetchingDocs && (
                  <span className="dash-doc-count">{documents.length} documento{documents.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {fetchingDocs ? (
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div className="dash-skeleton" style={{ width: 42, height: 42, borderRadius: 10 }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div className="dash-skeleton" style={{ height: 14, width: "45%" }} />
                        <div className="dash-skeleton" style={{ height: 11, width: "65%" }} />
                      </div>
                      <div className="dash-skeleton" style={{ height: 24, width: 70, borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="dash-empty">
                  <div className="dash-empty-icon">📂</div>
                  <div className="dash-empty-title">Sin documentos cargados</div>
                  <div className="dash-empty-sub">
                    Utiliza el formulario de la izquierda para comenzar a cargar tu documentación de vinculación.
                  </div>
                </div>
              ) : (
                <div>
                  {documents.map((doc) => {
                    const meta = DOC_META[doc.type] || { label: doc.type, icon: "📄", color: "#64748b" };
                    const statusColors = getStatusColor(doc.status);
                    return (
                      <div key={doc.id} className="dash-doc-row">
                        <div className="dash-doc-icon-wrap" style={{ background: `${meta.color}18` }}>
                          <span>{meta.icon}</span>
                        </div>
                        <div className="dash-doc-info">
                          <div className="dash-doc-name">{meta.label}</div>
                          <div className="dash-doc-meta">
                            {doc.originalName} &nbsp;·&nbsp; {(doc.size / 1024 / 1024).toFixed(2)} MB &nbsp;·&nbsp; {new Date(doc.uploadedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <span className="dash-doc-status" style={{ background: statusColors.bg, color: statusColors.text }}>
                          <span className="dash-doc-status-dot" style={{ background: statusColors.dot }} />
                          {doc.status?.toUpperCase() || "CARGADO"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info strip */}
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "0.9rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>
                🔒
              </div>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.1rem" }}>Proceso Seguro</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.5 }}>
                  Tu información es tratada conforme a la Ley 1581 de 2012 y las directrices SAGRILAFT de Hierros HB S.A.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
