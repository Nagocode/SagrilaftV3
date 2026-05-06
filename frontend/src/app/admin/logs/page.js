"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";

export default function AdminLogsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [fetching, setFetching] = useState(true);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'Admin') {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  const fetchLogs = async () => {
    setFetching(true);
    try {
      const res = await api.get("/admin/logs");
      setLogs(res.data.logs || "No hay registros disponibles todavía.");
      setCurrentFile(res.data.file || "application.log");
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching logs", error);
      setLogs("Error de conexión al cargar los logs.");
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user && user.role === 'Admin') fetchLogs();
  }, [user]);

  const handleDownload = async () => {
    try {
      const response = await api.get('/admin/logs/download', {
        responseType: 'blob', // Important for downloading files
      });
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', currentFile);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Error al intentar descargar el archivo de logs.");
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <p style={{ color: "#64748b", fontWeight: 500 }}>Cargando...</p>
      </div>
    );
  }

  // Helper to colorize log lines slightly based on keywords
  const renderLogLine = (line, index) => {
    if (!line.trim()) return null;
    let color = "#e2e8f0"; // default text
    if (line.includes("ERROR:")) color = "#f87171"; // red
    if (line.includes("INFO:")) color = "#60a5fa";  // blue
    if (line.includes("WARN:")) color = "#facc15";  // yellow
    if (line.includes("Uncaught") || line.includes("Unhandled") || line.includes("Error 500")) color = "#ef4444";

    return <div key={index} style={{ color, marginBottom: "2px", lineHeight: "1.4" }}>{line}</div>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

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
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 0 #e2e8f0;
        }

        .admin-brand { display: flex; align-items: center; gap: 0.75rem; }
        .admin-brand-text { font-size: 0.75rem; font-weight: 700; color: #8b0000; text-transform: uppercase; letter-spacing: 0.08em; }

        .admin-nav-actions { display: flex; align-items: center; gap: 1rem; }
        
        .btn-back {
          padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; 
          font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s;
        }
        .btn-back:hover { background: #f8fafc; color: #0f172a; }

        /* ── LAYOUT ── */
        .logs-container { max-width: 1300px; width: 100%; margin: 2rem auto; padding: 0 2rem; }
        
        .logs-card {
          background: #0f172a; /* Dark background for terminal */
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
          display: flex; flex-direction: column;
          height: calc(100vh - 140px);
        }

        .logs-header {
          background: #1e293b; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155;
        }
        .logs-title { color: white; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
        .logs-subtitle { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; font-family: 'Fira Code', monospace; }

        .logs-controls { display: flex; gap: 0.75rem; }
        .btn-primary {
          background: #3b82f6; color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
        }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary {
          background: #334155; color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
        }
        .btn-secondary:hover { background: #475569; }

        /* ── TERMINAL VIEW ── */
        .terminal-window {
          flex: 1; padding: 1.5rem; overflow-y: auto; background: #0f172a;
          font-family: 'Fira Code', monospace; font-size: 0.85rem;
        }
        /* Custom scrollbar for terminal */
        .terminal-window::-webkit-scrollbar { width: 10px; }
        .terminal-window::-webkit-scrollbar-track { background: #0f172a; }
        .terminal-window::-webkit-scrollbar-thumb { background: #334155; border-radius: 5px; }
        .terminal-window::-webkit-scrollbar-thumb:hover { background: #475569; }

        .spinner {
          display: inline-block; width: 24px; height: 24px; border: 2px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

      `}</style>

      <div className="admin-root">
        
        {/* Nav */}
        <nav className="admin-nav">
          <div className="admin-brand">
            <span className="admin-brand-text">Visor de Logs (Producción)</span>
          </div>
          <div className="admin-nav-actions">
            <button className="btn-back" onClick={() => router.push('/admin/dashboard')}>
              Volver al Panel
            </button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <button className="btn-back" style={{ border: 'none', background: 'transparent', color: '#64748b' }} onClick={logout}>Salir</button>
          </div>
        </nav>

        {/* Layout container */}
        <div className="logs-container">
          <div className="logs-card">
            
            <div className="logs-header">
              <div>
                <div className="logs-title">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M4 6h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
                  Console TTY1
                </div>
                <div className="logs-subtitle">Archivo actual: {currentFile}</div>
              </div>
              
              <div className="logs-controls">
                <button className="btn-secondary" onClick={fetchLogs} disabled={fetching}>
                  {fetching ? 'Cargando...' : 'Recargar'}
                </button>
                <button className="btn-primary" onClick={handleDownload}>
                  Descargar Log Completo
                </button>
              </div>
            </div>

            <div className="terminal-window" ref={terminalRef}>
              {fetching && !logs ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                  <div className="spinner"></div>
                </div>
              ) : (
                logs.split('\\n').map((line, i) => renderLogLine(line, i))
              )}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
