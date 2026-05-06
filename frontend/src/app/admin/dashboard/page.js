"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Nombramientos de nuevos administradores
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ nombre: '', email: '', password: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Visor de administradores (Súper Admin)
  const [showAdminsListModal, setShowAdminsListModal] = useState(false);
  const [adminsList, setAdminsList] = useState([]);
  const [fetchingAdmins, setFetchingAdmins] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'Admin') {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users", error);
    }
    setFetchingUsers(false);
  };

  useEffect(() => {
    if (user && user.role === 'Admin') fetchUsers();
  }, [user]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError("");
    setCreatingAdmin(true);
    try {
      await api.post("/admin/users/admin", newAdminData);
      alert("Administrador creado exitosamente.");
      setShowAddAdminModal(false);
      setNewAdminData({ nombre: '', email: '', password: '' });
    } catch (error) {
      console.error("Error creating admin", error);
      setAdminError(error.response?.data?.error || "Error al crear administrador.");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const fetchAdminsList = async () => {
    setFetchingAdmins(true);
    try {
      const res = await api.get('/admin/users/admins');
      setAdminsList(res.data.admins || []);
    } catch (error) {
      console.error('Error fetching admins', error);
      alert('Error al obtener la lista de administradores.');
    }
    setFetchingAdmins(false);
  };

  const openAdminsList = () => {
    setShowAdminsListModal(true);
    fetchAdminsList();
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este administrador?')) return;
    try {
      await api.delete(`/admin/users/admins/${id}`);
      setAdminsList(prev => prev.filter(a => a.id !== id));
      alert('Administrador eliminado exitosamente.');
    } catch (error) {
      console.error('Error deleting admin', error);
      alert(error.response?.data?.error || 'Error al eliminar el administrador.');
    }
  };

  const handleDocumentAction = async (docId, status, reason = "") => {
    try {
      if (status === 'rechazado' && !reason.trim()) {
        alert("Debes proporcionar una razón para rechazar el documento.");
        return;
      }
      
      await api.put(`/admin/documents/${docId}/status`, { status, rejectReason: reason });
      setRejectingDocId(null);
      setRejectReason("");
      
      // Actualizar el estado local
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            documents: u.documents.map(d => d.id === docId ? { ...d, status, size: status === 'rechazado' ? 0 : d.size } : d)
          };
        }
        return u;
      }));
      
      // Actualizar el usuario seleccionado
      setSelectedUser(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === docId ? { ...d, status, size: status === 'rechazado' ? 0 : d.size } : d)
      }));

    } catch (error) {
      console.error("Error updating document status", error);
      alert("Error al actualizar el estado del documento.");
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #8b0000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 500 }}>Cargando Panel de Administración...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (!status) return { bg: "#fef3c7", text: "#92400e" };
    const s = status.toLowerCase();
    if (s === "aprobado" || s === "approved") return { bg: "#dcfce7", text: "#14532d" };
    if (s === "rechazado" || s === "rejected") return { bg: "#fee2e2", text: "#7f1d1d" };
    return { bg: "#dbeafe", text: "#1e3a5f" };
  };

  const renderDocRow = (doc) => {
    const meta = DOC_META[doc.type] || { label: doc.type, icon: "📄", color: "#cbd5e1" };
    const badge = getStatusBadge(doc.status);
    
    return (
      <div key={doc.id} className="admin-doc-row">
        <div className="admin-doc-header">
          <div className="admin-doc-icon" style={{ background: `${meta.color}20` }}>
            {meta.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div className="admin-doc-name">{meta.label}</div>
            <div className="admin-doc-file">{doc.originalName} &nbsp;·&nbsp; {new Date(doc.uploadedAt).toLocaleString()}</div>
            {doc.metadata && (
              <div style={{ marginTop: '0.4rem', padding: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem', color: '#334155' }}>
                {(() => {
                  try {
                    const m = JSON.parse(doc.metadata);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {m.requestType && <div><strong>Tipo:</strong> {m.requestType}</div>}
                        {m.cupo && <div><strong>Cupo:</strong> {m.cupo}</div>}
                        {m.condicion && <div><strong>Condición:</strong> {m.condicion}</div>}
                      </div>
                    );
                  } catch (e) { return null; }
                })()}
              </div>
            )}
          </div>
          <div className="admin-doc-status" style={{ background: badge.bg, color: badge.text }}>
            {doc.status.toUpperCase()}
          </div>
        </div>

        {doc.size > 0 && doc.status !== 'rechazado' && doc.status !== 'aprobado' && (
          <div className="admin-doc-actions">
            <button className="btn-approve" onClick={() => handleDocumentAction(doc.id, 'aprobado')}>
              Aprobar Documento
            </button>
            <button className="btn-reject" onClick={() => setRejectingDocId(doc.id)}>
              Rechazar...
            </button>
          </div>
        )}

        {rejectingDocId === doc.id && (
          <div className="admin-reject-form">
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#991b1b", marginBottom: "0.4rem" }}>Motivo del rechazo</div>
            <textarea 
              placeholder="Ej: El documento está ilegible, o no es el formato correcto."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button 
                style={{ background: "transparent", border: "none", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", cursor: "pointer" }}
                onClick={() => { setRejectingDocId(null); setRejectReason(""); }}
              >
                Cancelar
              </button>
              <button 
                className="btn-reject"
                onClick={() => handleDocumentAction(doc.id, 'rechazado', rejectReason)}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .admin-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── TOP NAV ── */
        .admin-nav {
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

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-brand img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }
        
        .admin-brand-divider {
          width: 1px; height: 28px; background: #e2e8f0;
        }

        .admin-brand-text {
          font-size: 0.75rem; font-weight: 700; color: #8b0000;
          text-transform: uppercase; letter-spacing: 0.08em;
        }

        .admin-user-chip {
          display: flex; align-items: center; gap: 0.6rem;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 9999px; padding: 0.35rem 0.9rem 0.35rem 0.5rem;
        }

        .admin-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: white;
        }

        .admin-logout-btn {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; font-weight: 600; color: #64748b;
          background: none; border: none; cursor: pointer;
          padding: 0.35rem 0.75rem; border-radius: 6px;
          transition: all 0.15s;
        }
        .admin-logout-btn:hover { color: #8b0000; background: #fef2f2; }

        /* ── LAYOUT ── */
        .admin-container {
          max-width: 1300px; width: 100%; margin: 2rem auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 990px) {
          .admin-container { grid-template-columns: 1fr; }
        }

        /* ── CARD ── */
        .admin-card {
          background: white;
          border: 1px solid #e2e8f0; border-radius: 12px;
          overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .admin-card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }

        .admin-card-title {
          font-size: 1.05rem; font-weight: 700; color: #0f172a;
          letter-spacing: -0.02em;
        }

        .admin-card-sub {
          font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;
        }

        /* ── USERS LIST ── */
        .admin-user-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem; border-bottom: 1px solid #f8fafc;
          cursor: pointer; transition: background 0.15s;
        }
        .admin-user-row:last-child { border-bottom: none; }
        .admin-user-row:hover, .admin-user-row.active { background: #f8fafc; }
        .admin-user-row.active { border-left: 4px solid #8b0000; padding-left: calc(1.5rem - 4px); }

        .admin-search-wrap {
          padding: 1rem 1.5rem 0 1.5rem;
        }
        .admin-search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.4rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: #f8fafc url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>') no-repeat 0.8rem center;
        }
        .admin-search-input:focus {
          border-color: #8b0000;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(139,0,0,0.1);
        }

        .admin-user-info { flex: 1; }
        .admin-user-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin-bottom: 0.2rem; }
        .admin-user-meta { font-size: 0.75rem; color: #64748b; display: flex; gap: 0.8rem; }
        .admin-user-docs-count { 
          font-size: 0.75rem; font-weight: 600; color: #8b0000;
          background: #fef2f2; padding: 0.2rem 0.6rem; border-radius: 20px;
        }

        /* ── DOCS LIST ── */
        .admin-doc-empty {
          padding: 3rem 1.5rem; text-align: center;
        }
        .admin-doc-row {
          padding: 1.25rem 1.5rem; border-bottom: 1px solid #f8fafc;
        }
        .admin-doc-header {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;
        }
        .admin-doc-icon {
          width: 40px; height: 40px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .admin-doc-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
        .admin-doc-file { font-size: 0.75rem; color: #64748b; margin-top: 0.2rem; }
        
        .admin-doc-status {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          padding: 0.25rem 0.6rem; border-radius: 6px; display: inline-block;
        }

        /* Actions */
        .admin-doc-actions {
          display: flex; gap: 0.5rem;
        }
        .btn-approve {
          background: #10b981; color: white; border: none; border-radius: 6px;
          padding: 0.4rem 0.8rem; font-size: 0.75rem; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-approve:hover { background: #059669; }
        
        .btn-reject {
          background: #ef4444; color: white; border: none; border-radius: 6px;
          padding: 0.4rem 0.8rem; font-size: 0.75rem; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-reject:hover { background: #dc2626; }

        /* Reject form */
        .admin-reject-form {
          margin-top: 1rem; background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 1rem;
        }
        .admin-reject-form textarea {
          width: 100%; border: 1px solid #fca5a5; border-radius: 6px;
          padding: 0.5rem; font-family: inherit; font-size: 0.8rem;
          resize: vertical; min-height: 60px; outline: none; margin-bottom: 0.5rem;
        }
        .admin-reject-form textarea:focus { border-color: #ef4444; }

        /* ── MODAL ADMIN ── */
        .admin-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .admin-modal {
          background: white; border-radius: 12px; width: 100%; max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .admin-modal-header {
          padding: 1.5rem; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .admin-modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
        .admin-modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
        .admin-modal-body { padding: 1.5rem; }
        .admin-input-group { margin-bottom: 1rem; }
        .admin-input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
        .admin-input-group input { 
          width: 100%; padding: 0.6rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.15s;
        }
        .admin-input-group input:focus { border-color: #8b0000; box-shadow: 0 0 0 3px rgba(139,0,0,0.1); }
        .admin-modal-footer {
          padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9;
          display: flex; justify-content: flex-end; gap: 0.75rem;
        }
        .btn-cancel {
          background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.15s;
        }
        .btn-cancel:hover { background: #f1f5f9; }
        .btn-primary {
          background: #8b0000; border: none; color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.15s;
        }
        .btn-primary:hover { background: #710000; }
        .btn-primary:disabled { background: #fca5a5; cursor: not-allowed; }
        .admin-error-msg { background: #fef2f2; color: #b91c1c; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; border: 1px solid #fecaca;}

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="admin-root">
        
        {/* Nav */}
        <nav className="admin-nav">
          <div className="admin-brand">
            <Image src="/logo.png" alt="Hierros HB" width={100} height={36} style={{ height: 36, width: 'auto' }} />
            <div className="admin-brand-divider" />
            <span className="admin-brand-text">Admin Panel</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="admin-user-chip">
              <div className="admin-avatar">A</div>
              <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Administrador</span>
            </div>

            {user?.email === 'areasistemas@hierroshb.com' && (
              <>
                <button className="admin-logout-btn" onClick={openAdminsList} style={{ color: '#0f172a', fontWeight: 700 }} title="Ver Lista de Administradores">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Ver Admins
                </button>
                <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 0.5rem' }} />

                <button className="admin-logout-btn" onClick={() => setShowAddAdminModal(true)} style={{ color: '#0f172a', fontWeight: 700 }} title="Crear Nuevo Administrador">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Crear Admin
                </button>
                <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 0.5rem' }} />
              </>
            )}

            <button className="admin-logout-btn" onClick={() => router.push('/admin/logs')} style={{ color: '#0f172a', fontWeight: 700 }} title="Ver Console Logs">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M4 6h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
              Logs
            </button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 0.5rem' }} />
            
            <button className="admin-logout-btn" onClick={logout}>Salir</button>
          </div>
        </nav>

        {/* Layout container */}
        <div className="admin-container">
          
          {/* Left Column: Users List */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <div className="admin-card-title">Proveedores y Clientes</div>
                <div className="admin-card-sub">Gestión de usuarios registrados en SAGRILAFT</div>
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>
                Total: {users.length}
              </div>
            </div>

            <div className="admin-search-wrap">
              <input 
                type="text" 
                className="admin-search-input" 
                placeholder="Buscar por nombre, correo o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {fetchingUsers ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                  Cargando usuarios...
                </div>
              ) : users.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                  No hay usuarios registrados.
                </div>
              ) : (
                users.filter(u => {
                  const term = searchTerm.toLowerCase();
                  const nameStr = (u.razonSocial || u.nombre || "").toLowerCase();
                  const roleStr = (u.role || "").toLowerCase();
                  const emailStr = (u.email || "").toLowerCase();
                  return nameStr.includes(term) || roleStr.includes(term) || emailStr.includes(term);
                }).map(u => (
                  <div 
                    key={u.id} 
                    className={`admin-user-row ${selectedUser?.id === u.id ? 'active' : ''}`}
                    onClick={() => {
                        setSelectedUser(u);
                        setRejectingDocId(null);
                    }}
                  >
                    <div className="admin-user-info">
                      <div className="admin-user-name">{u.razonSocial || u.nombre || u.email}</div>
                      <div className="admin-user-meta">
                        <span>{u.role}</span>
                        <span>{u.email}</span>
                        <span><strong>Doc:</strong> {u.cedula || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="admin-user-docs-count">
                      {u.documents.length} Docs
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Selected User Documents */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <div className="admin-card-title">Archivos del Usuario</div>
                <div className="admin-card-sub">
                  {selectedUser ? (selectedUser.razonSocial || selectedUser.nombre) : "Selecciona un usuario para ver detalles"}
                </div>
              </div>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {!selectedUser ? (
                <div className="admin-doc-empty">
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📂</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>Panel de Revisión</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.4rem" }}>Haz clic en un usuario de la lista izquierda para revisar sus documentos cargados.</div>
                </div>
              ) : selectedUser.documents.length === 0 ? (
                 <div className="admin-doc-empty">
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>Sin Documentos</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.4rem" }}>Este usuario aún no ha subido documentación.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* SAGRILAFT SECTION */}
                  {selectedUser.documents.some(d => ["Cedula", "CamaraComercio", "Formulario", "Rut", "CertificacionBancaria"].includes(d.type)) && (
                    <div>
                      <div style={{ background: '#f1f5f9', padding: '0.5rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Documentos Sagrilaft
                      </div>
                      {selectedUser.documents.filter(d => ["Cedula", "CamaraComercio", "Formulario", "Rut", "CertificacionBancaria"].includes(d.type)).map(doc => renderDocRow(doc))}
                    </div>
                  )}

                  {/* CREDIT SECTION */}
                  {selectedUser.documents.some(d => ["BalanceGeneral", "EstadoResultados", "EstadoFlujoEfectivo", "NotasEstadosFinancieros", "ReferenciaComercial1", "ReferenciaComercial2", "DeclaracionRenta"].includes(d.type)) && (
                    <div>
                      <div style={{ background: '#f1f5f9', padding: '0.5rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#8b0000', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '4px solid #8b0000' }}>
                        Documentos Crédito
                      </div>
                      {selectedUser.documents.filter(d => ["BalanceGeneral", "EstadoResultados", "EstadoFlujoEfectivo", "NotasEstadosFinancieros", "ReferenciaComercial1", "ReferenciaComercial2", "DeclaracionRenta"].includes(d.type)).map(doc => renderDocRow(doc))}
                    </div>
                  )}

                  {/* OTHER SECTION */}
                  {selectedUser.documents.some(d => !["Cedula", "CamaraComercio", "Formulario", "Rut", "CertificacionBancaria", "BalanceGeneral", "EstadoResultados", "EstadoFlujoEfectivo", "NotasEstadosFinancieros", "ReferenciaComercial1", "ReferenciaComercial2", "DeclaracionRenta"].includes(d.type)) && (
                    <div>
                      <div style={{ background: '#f1f5f9', padding: '0.5rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Otros Documentos
                      </div>
                      {selectedUser.documents.filter(d => !["Cedula", "CamaraComercio", "Formulario", "Rut", "CertificacionBancaria", "BalanceGeneral", "EstadoResultados", "EstadoFlujoEfectivo", "NotasEstadosFinancieros", "ReferenciaComercial1", "ReferenciaComercial2", "DeclaracionRenta"].includes(d.type)).map(doc => renderDocRow(doc))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Añadir Admin */}
        {showAddAdminModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <div className="admin-modal-title">Crear Nuevo Administrador</div>
                <button className="admin-modal-close" onClick={() => setShowAddAdminModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleCreateAdmin}>
                <div className="admin-modal-body">
                  {adminError && <div className="admin-error-msg">{adminError}</div>}
                  
                  <div className="admin-input-group">
                    <label>Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej: Juan Pérez"
                      value={newAdminData.nombre}
                      onChange={e => setNewAdminData({...newAdminData, nombre: e.target.value})}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Correo Electrónico</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="Ej: juan@empresa.com"
                      value={newAdminData.email}
                      onChange={e => setNewAdminData({...newAdminData, email: e.target.value})}
                    />
                  </div>

                  <div className="admin-input-group" style={{ marginBottom: 0 }}>
                    <label>Contraseña Temporal</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Debe contener al menos 6 caracteres"
                      minLength={6}
                      value={newAdminData.password}
                      onChange={e => setNewAdminData({...newAdminData, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddAdminModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={creatingAdmin}>
                    {creatingAdmin ? 'Creando...' : 'Crear Cuenta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Listar Admins */}
        {showAdminsListModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal" style={{ maxWidth: '600px' }}>
              <div className="admin-modal-header">
                <div className="admin-modal-title">Lista de Administradores</div>
                <button className="admin-modal-close" onClick={() => setShowAdminsListModal(false)}>&times;</button>
              </div>
              <div className="admin-modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '1.5rem' }}>
                {fetchingAdmins ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Cargando administradores...</div>
                ) : adminsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No se encontraron administradores.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {adminsList.map(adm => (
                      <div key={adm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{adm.nombre}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{adm.email}</div>
                        </div>
                        {adm.email !== 'areasistemas@hierroshb.com' && (
                          <button onClick={() => handleDeleteAdmin(adm.id)} className="btn-reject" style={{ padding: '0.4rem 0.8rem', borderRadius: '6px' }}>Eliminar</button>
                        )}
                        {adm.email === 'areasistemas@hierroshb.com' && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Tú (Principal)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAdminsListModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
