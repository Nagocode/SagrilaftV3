"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";

export default function UploadForm({ onUploadSuccess, userRole }) {
  const [files, setFiles] = useState({
    cedula: null,
    camaraComercio: null,
    formulario: null,
    rut: null,
    certificacionBancaria: null,
    balanceGeneral: null,
    estadoResultados: null,
    estadoFlujoEfectivo: null,
    notasEstadosFinancieros: null,
    referenciaComercial1: null,
    referenciaComercial2: null,
    declaracionRenta: null
  });

  const [creditRequest, setCreditRequest] = useState({
    type: "", // "Nueva", "Actualización"
    requestedCupo: "",
    requestedCondicion: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Refs to allow clicking the hidden inputs
  const fileRefs = {
    cedula: useRef(null),
    camaraComercio: useRef(null),
    formulario: useRef(null),
    rut: useRef(null),
    certificacionBancaria: useRef(null),
    balanceGeneral: useRef(null),
    estadoResultados: useRef(null),
    estadoFlujoEfectivo: useRef(null),
    notasEstadosFinancieros: useRef(null),
    referenciaComercial1: useRef(null),
    referenciaComercial2: useRef(null),
    declaracionRenta: useRef(null)
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e, name) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];

      // Basic Frontend Validation
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: `El archivo ${file.name} supera los 5MB.`, type: "error" });
        e.target.value = null;
        return;
      }

      // Add specific warnings
      if (name === 'rut') {
        const confirmRUT = window.confirm("⚠️ AVISO IMPORTANTE - RUT\n\nEl documento RUT no puede tener una fecha de generación mayor a 90 días.\n\n¿Tu documento está actualizado y cumple con este requisito?");
        if (!confirmRUT) {
          e.target.value = null;
          return;
        }
        setMessage({ text: "⚠️ Validación requerida: El RUT no debe ser mayor a 90 días.", type: "warning" });
      } else if (name === 'camaraComercio') {
        const confirmCamara = window.confirm("⚠️ AVISO IMPORTANTE - CÁMARA DE COMERCIO\n\nLa Cámara de Comercio no debe tener una fecha de expedición mayor a 30 días.\n\n¿Tu documento está vigente y cumple con este requisito?");
        if (!confirmCamara) {
          e.target.value = null;
          return;
        }
        setMessage({ text: "⚠️ Validación requerida: La Cámara de Comercio no debe ser mayor a 30 días.", type: "warning" });
      } else {
        setMessage({ text: "", type: "" });
      }

      setFiles(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleRemoveFile = (e, name) => {
    e.stopPropagation();
    e.preventDefault();
    setFiles(prev => ({ ...prev, [name]: null }));
    if (fileRefs[name].current) {
      fileRefs[name].current.value = null;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // Validation for credit request if type is selected
    if (creditRequest.type) {
      const creditFiles = [
        'balanceGeneral', 'estadoResultados', 'estadoFlujoEfectivo', 
        'notasEstadosFinancieros', 'referenciaComercial1', 
        'referenciaComercial2', 'declaracionRenta'
      ];
      const missingFiles = creditFiles.filter(f => !files[f]);
      
      if (missingFiles.length > 0) {
        setMessage({ text: "Para la solicitud de crédito, todos los documentos marcados son obligatorios.", type: "error" });
        return;
      }

      if (!creditRequest.requestedCupo || !creditRequest.requestedCondicion) {
        setMessage({ text: "Por favor completa la información del cupo y condición de pago solicitados.", type: "error" });
        return;
      }
    }

    if (!Object.values(files).some(Boolean)) {
      setMessage({ text: "Selecciona al menos un documento para subir.", type: "error" });
      return;
    }

    const formData = new FormData();
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key]);
    });

    if (creditRequest.type) {
      formData.append("creditRequestType", creditRequest.type);
      formData.append("requestedCupo", creditRequest.requestedCupo);
      formData.append("requestedCondicion", creditRequest.requestedCondicion);
    }

    setIsUploading(true);
    try {
      const res = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage({ text: res.data.message || "Documentos subidos con éxito.", type: "success" });

      // Clear forms
      setFiles({
        cedula: null, camaraComercio: null, formulario: null, rut: null, certificacionBancaria: null,
        balanceGeneral: null, estadoResultados: null, estadoFlujoEfectivo: null,
        notasEstadosFinancieros: null, referenciaComercial1: null, referenciaComercial2: null, declaracionRenta: null
      });
      setCreditRequest({ type: "", requestedCupo: "", requestedCondicion: "" });
      Object.values(fileRefs).forEach(ref => {
        if (ref.current) ref.current.value = null;
      });

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Error al subir los archivos. Verifica los formatos (PDF, JPG, PNG, XLS, XLSX).",
        type: "error"
      });
    }
    setIsUploading(false);
  };

  const FileCard = ({ name, label, icon, accept = ".pdf,.jpg,.jpeg,.png,.xls,.xlsx", description, required = false }) => {
    const file = files[name];
    const isSelected = !!file;

    return (
      <div
        onClick={() => !isSelected && fileRefs[name].current?.click()}
        className={`relative group rounded-xl border-2 transition-all duration-200 overflow-hidden 
          ${isSelected
            ? 'border-green-500 bg-green-50/30 ring-4 ring-green-500/10'
            : 'border-dashed border-slate-300 hover:border-sagrilaft-accent hover:bg-slate-50 cursor-pointer'
          }`}
      >
        <input
          type="file"
          ref={fileRefs[name]}
          name={name}
          accept={accept}
          onChange={(e) => handleFileChange(e, name)}
          className="hidden"
        />

        <div className="p-4 flex items-center gap-4">
          <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors
            ${isSelected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-sagrilaft-accent'}`}
          >
            {isSelected ? '✅' : icon}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold ${isSelected ? 'text-green-800' : 'text-slate-700'}`}>
              {label} {required && <span className="text-red-500">*</span>}
            </h4>

            {isSelected ? (
              <div className="flex flex-col mt-0.5">
                <span className="text-sm font-medium text-slate-800" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {formatSize(file.size)}
                </span>
              </div>
            ) : (
              <div className="mt-1">
                <span className="text-xs text-slate-500">
                  Haz clic para seleccionar el archivo <br />
                  <span className="text-[10px] text-slate-400 font-medium">{description}</span>
                </span>
              </div>
            )}
          </div>

          {isSelected && (
            <button
              type="button"
              onClick={(e) => handleRemoveFile(e, name)}
              className="shrink-0 ml-2 p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
              title="Quitar archivo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const selectedCount = Object.values(files).filter(Boolean).length;

  return (
    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold" style={{ color: '#8b0000' }}>Cargar Documentos</h3>
        {selectedCount > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-sagrilaft-accent rounded-full text-xs font-bold">
            {selectedCount} listos
          </span>
        )}
      </div>

      {message.text && (
        <div className={`mb-6 p-4 text-sm rounded-lg flex items-start gap-3 border shadow-sm transition-all duration-300
          ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 
            message.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse-subtle' : 
            'bg-green-50 text-green-800 border-green-200'}`}>
          <div className="mt-0.5 text-lg">
            {message.type === 'error' ? '❌' : message.type === 'warning' ? 'ℹ️' : '✅'}
          </div>
          <div className="font-semibold">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Documentos Básicos</h4>
          <FileCard name="cedula" label="Cédula del Representante Legal" icon="🪪" description="PDF o Imagen (Max 5MB)" />
          <FileCard name="camaraComercio" label="Cámara de Comercio" icon="🏢" description="Vigente no mayor a 30 días" />
          <FileCard name="formulario" label="Formulario SAGRILAFT" icon="📋" description="Firmado y diligenciado" />
          <FileCard name="rut" label="RUT (Registro Único Tributario)" icon="📄" description="Actualizado" />
          <FileCard name="certificacionBancaria" label="Certificación Bancaria" icon="🏦" description="Vigente no mayor a 30 días" />
        </div>

        {userRole === 'Cliente' && (
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Solicitud de Crédito</h4>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Tipo de Solicitud</label>
                <select 
                  value={creditRequest.type} 
                  onChange={(e) => setCreditRequest({...creditRequest, type: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="Nueva">Solicitud nueva</option>
                  <option value="Actualización">Actualización</option>
                </select>
              </div>

              {creditRequest.type && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* Nueva sección de Información Solicitada */}
                  <div className="bg-white p-4 rounded-lg border border-red-100 space-y-3 shadow-sm">
                    <h5 className="text-[11px] font-bold text-red-800 uppercase tracking-tight">Información Solicitada</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Cupo de crédito</label>
                        <input 
                          placeholder="Ej: 50.000.000" 
                          value={creditRequest.requestedCupo} 
                          onChange={(e) => setCreditRequest({...creditRequest, requestedCupo: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Condición de pago</label>
                        <input 
                          placeholder="Ej: 30 días" 
                          value={creditRequest.requestedCondicion} 
                          onChange={(e) => setCreditRequest({...creditRequest, requestedCondicion: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">Los siguientes documentos son obligatorios para la solicitud de crédito:</p>
                  
                  <FileCard name="balanceGeneral" label="Balance General" icon="📊" description="Últimos 2 años" required />
                  <FileCard name="estadoResultados" label="Estado de Resultados" icon="📈" description="Últimos 2 años" required />
                  <FileCard name="estadoFlujoEfectivo" label="Estado de Flujo de Efectivo" icon="💸" description="Últimos 2 años" required />
                  <FileCard name="notasEstadosFinancieros" label="Notas a los Estados Financieros" icon="📝" description="Completas" required />
                  <FileCard name="declaracionRenta" label="Declaración de Renta" icon="🏛️" description="Último año" required />
                  
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase">Referencia Comercial 1</h5>
                    <FileCard name="referenciaComercial1" label="Adjunto Referencia 1" icon="📎" description="Referencia Comercial" required />
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase">Referencia Comercial 2</h5>
                    <FileCard name="referenciaComercial2" label="Adjunto Referencia 2" icon="📎" description="Referencia Comercial" required />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 mt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={isUploading || selectedCount === 0}
            className="w-full py-3.5 px-4 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              enabled:bg-gradient-to-r enabled:from-[#8b0000] enabled:to-[#dc2626] enabled:hover:shadow-lg enabled:hover:-translate-y-0.5"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Subir {selectedCount > 0 ? selectedCount : ''} Documentos
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

