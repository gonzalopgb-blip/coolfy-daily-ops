import React, { useState, useEffect } from 'react';

// ⚠️ TU URL DE GOOGLE APPS SCRIPT
const API_URL = 'https://script.google.com/macros/s/AKfycbzUNdSwoU5_SZukJKp0pBVeh_yDyH21cyXmueCmS_CeBt0n8m7A89Y5bz69ReTPzw/exec';

// 🎯 OBJETIVOS DIARIOS (sin IVA)
const OBJETIVOS = {
  madrid: 14770,
  barcelona: 7955
};

const colors = {
  fondo: '#F2EFEC', azul: '#1A5365', azulSec: '#658398', gris: '#CAC9C9',
  naranja: '#CD7657', rojo: '#DC2626', amarillo: '#CA8A04', verde: '#16A34A',
  blanco: '#FFFFFF', texto: '#1A1A1A', textoSec: '#5A5A5A'
};

const formatEur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n || 0);

// Detectar si es incidencia/mantenimiento (no suma al objetivo)
const esIncidencia = (tipo) => {
  const t = (tipo || '').toLowerCase();
  return t.includes('incidencia') || t.includes('mantenimiento');
};

// Estados que significan "cerrado OK"
const estadoCerrado = (estado) => ['Validada', 'Realizada'].includes(estado);

export default function DailyOpsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ciudad, setCiudad] = useState('barcelona');
  const [diaSeleccionado, setDiaSeleccionado] = useState('hoy');
  const [acciones, setAcciones] = useState({ madrid: [], barcelona: [] });
  const [nuevaAccion, setNuevaAccion] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [mostrarAyer, setMostrarAyer] = useState(true);

  // Datos de demo para preview
  const DEMO_DATA = {
    generado: new Date().toISOString(),
    version: '2.0',
    ayer: {
      fecha: '14/01/2026',
      dia_semana: 'Martes',
      madrid: {
        intervenciones: [
          { id: '1', so: 'SO252530', cliente: 'García Martínez', tipo: 'Instalación Split', estado: 'Validada', hora: '09:00', tecnico: 'Juan Pérez', pmo: 'Andrea Riaño', amount: 2400, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '2', so: 'SO252531', cliente: 'López Fernández', tipo: 'Instalación Split', estado: 'Realizada', hora: '11:00', tecnico: 'Carlos Ruiz', pmo: 'Felipe Garay', amount: 1800, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '3', so: 'SO252532', cliente: 'Sánchez Moreno', tipo: 'Aerotermia', estado: 'No realizada', hora: '14:00', tecnico: 'Miguel Ángel', pmo: 'Andrea Riaño', amount: 5200, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false }
        ],
        metricas: { total: 3, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 },
        objetivo: 14770
      },
      barcelona: {
        intervenciones: [
          { id: '4', so: 'SO252534', cliente: 'Tecno BCN', tipo: 'Instalación Split', estado: 'Validada', hora: '09:00', tecnico: 'Pere Vila', pmo: 'Katty Pando', amount: 3100, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '5', so: 'SO252535', cliente: 'Maria Vidal', tipo: 'Aerotermia', estado: 'Realizada', hora: '11:00', tecnico: 'Joan Serra', pmo: 'Ignacio Marcet', amount: 4800, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '6', so: 'SO252537', cliente: 'Energia Verda', tipo: 'Instalación Split', estado: 'No realizada', hora: '15:00', tecnico: 'Marc Puig', pmo: 'Katty Pando', amount: 2200, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false }
        ],
        metricas: { total: 3, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 },
        objetivo: 7955
      }
    },
    hoy: {
      fecha: '15/01/2026',
      dia_semana: 'Miércoles',
      madrid: {
        intervenciones: [
          { id: '10', so: 'SO252540', cliente: 'Rodríguez Gómez', tipo: 'Instalación Split', estado: 'Planificada', hora: '09:00', tecnico: 'Juan Pérez', pmo: 'Andrea Riaño', amount: 2100, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '11', so: 'SO252541', cliente: 'Martín Castro', tipo: 'Aerotermia', estado: 'Planificada', hora: '10:30', tecnico: '', pmo: 'Felipe Garay', amount: 6500, alerta_sin_tecnico: true, alerta_stock: false, alerta_prioridad: true },
          { id: '12', so: 'SO252542', cliente: 'Díaz Navarro', tipo: 'Instalación Split', estado: 'Planificada', hora: '14:00', tecnico: 'Carlos Ruiz', pmo: 'Andrea Riaño', amount: 1950, alerta_sin_tecnico: false, alerta_stock: true, alerta_prioridad: false },
          { id: '13', so: 'SO252543', cliente: 'Pérez Iglesias', tipo: 'Mantenimiento', estado: 'Planificada', hora: '16:00', tecnico: 'Miguel Ángel', pmo: 'Felipe Garay', amount: 0, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false }
        ],
        metricas: { total: 4, sin_tecnico: 1, sin_stock: 1, prioridad_alta: 1 },
        objetivo: 14770
      },
      barcelona: {
        intervenciones: [
          { id: '20', so: 'SO252550', cliente: 'Can Fuster', tipo: 'Instalación Split', estado: 'Planificada', hora: '09:00', tecnico: 'Pere Vila', pmo: 'Katty Pando', amount: 2800, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '21', so: 'SO252551', cliente: 'Climatització Nou', tipo: 'Aerotermia', estado: 'Planificada', hora: '11:00', tecnico: 'Joan Serra', pmo: 'Ignacio Marcet', amount: 7200, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
          { id: '22', so: 'SO252552', cliente: 'Hotel Marina', tipo: 'Incidencia', estado: 'Planificada', hora: '15:00', tecnico: 'Marc Puig', pmo: 'Katty Pando', amount: 0, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false }
        ],
        metricas: { total: 3, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 },
        objetivo: 7955
      }
    },
    manana: {
      fecha: '16/01/2026',
      dia_semana: 'Jueves',
      madrid: {
        intervenciones: [
          { id: '30', so: 'SO252560', cliente: 'Torres Blanco', tipo: 'Instalación Split', estado: 'Preplanificada', hora: '09:00', tecnico: 'Juan Pérez', pmo: 'Andrea Riaño', amount: 2300, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false }
        ],
        metricas: { total: 1, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 },
        objetivo: 14770
      },
      barcelona: {
        intervenciones: [
          { id: '40', so: 'SO252570', cliente: 'Clima Nord', tipo: 'Aerotermia', estado: 'Preplanificada', hora: '10:00', tecnico: '', pmo: 'Ignacio Marcet', amount: 5400, alerta_sin_tecnico: true, alerta_stock: false, alerta_prioridad: false }
        ],
        metricas: { total: 1, sin_tecnico: 1, sin_stock: 0, prioridad_alta: 0 },
        objetivo: 7955
      }
    },
    tecnicos: {
      madrid: [
        { nombre: 'Juan Pérez', especialidades: ['Split', 'Conductos'], completadas: 45 },
        { nombre: 'Carlos Ruiz', especialidades: ['Split'], completadas: 38 },
        { nombre: 'Miguel Ángel', especialidades: ['Aerotermia', 'Split'], completadas: 32 }
      ],
      barcelona: [
        { nombre: 'Pere Vila', especialidades: ['Split', 'Conductos'], completadas: 42 },
        { nombre: 'Joan Serra', especialidades: ['Aerotermia'], completadas: 35 },
        { nombre: 'Marc Puig', especialidades: ['Split'], completadas: 28 }
      ]
    }
  };

  // Cargar datos de la API
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      console.log('Datos recibidos:', json);
      setData(json);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Error cargando datos, usando demo:', e);
      // Usar datos demo si falla la API (para preview)
      setData(DEMO_DATA);
      setLastUpdate(new Date());
    }
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  // Helpers para obtener datos
  const getDatos = (dia, c) => {
    if (!data) return { intervenciones: [], metricas: { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 } };
    const ciudadKey = c.toLowerCase();
    if (dia === 'ayer') return data.ayer?.[ciudadKey] || { intervenciones: [] };
    if (dia === 'hoy') return data.hoy?.[ciudadKey] || { intervenciones: [], metricas: {} };
    return data.manana?.[ciudadKey] || { intervenciones: [], metricas: {} };
  };

  const datosAyer = getDatos('ayer', ciudad);
  const datosHoy = getDatos('hoy', ciudad);
  const datosManana = getDatos('manana', ciudad);
  const datosActuales = getDatos(diaSeleccionado, ciudad);
  const tecnicos = data?.tecnicos?.[ciudad.toLowerCase()] || [];

  // Métricas
  const metricas = datosActuales?.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
  const intervenciones = datosActuales?.intervenciones || [];

  // Calcular amounts (solo instalaciones, no incidencias)
  const calcularAmount = (ints) => {
    return (ints || [])
      .filter(i => !esIncidencia(i.tipo))
      .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  };

  const amountHoy = calcularAmount(datosHoy?.intervenciones);
  const amountManana = calcularAmount(datosManana?.intervenciones);
  const amountActual = calcularAmount(intervenciones);
  const objetivo = OBJETIVOS[ciudad.toLowerCase()];
  const porcentajeObjetivo = objetivo > 0 ? Math.round((amountActual / objetivo) * 100) : 0;

  // AYER: separar cerradas vs no cerradas
  const intervencionesAyer = datosAyer?.intervenciones || [];
  const ayerCerradas = intervencionesAyer.filter(i => estadoCerrado(i.estado));
  const ayerNoCerradas = intervencionesAyer.filter(i => !estadoCerrado(i.estado));
  const amountAyerTotal = calcularAmount(intervencionesAyer);

  // Ordenar intervenciones: alertas primero, luego por amount
  const intervencionesSorted = [...intervenciones].sort((a, b) => {
    const aAlerta = (a.alerta_sin_tecnico ? 1000 : 0) + (a.alerta_prioridad ? 500 : 0) + (a.alerta_stock ? 250 : 0);
    const bAlerta = (b.alerta_sin_tecnico ? 1000 : 0) + (b.alerta_prioridad ? 500 : 0) + (b.alerta_stock ? 250 : 0);
    if (bAlerta !== aAlerta) return bAlerta - aAlerta;
    return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
  });

  // Contar incidencias
  const numIncidencias = intervenciones.filter(i => esIncidencia(i.tipo)).length;

  // Gestión de acciones (local por ciudad)
  const accionesCiudad = acciones[ciudad.toLowerCase()] || [];

  const agregarAccion = () => {
    if (!nuevaAccion.trim()) return;
    setAcciones(prev => ({
      ...prev,
      [ciudad.toLowerCase()]: [...(prev[ciudad.toLowerCase()] || []), { id: Date.now(), texto: nuevaAccion.trim(), completada: false }]
    }));
    setNuevaAccion('');
  };

  const toggleAccion = (id) => {
    setAcciones(prev => ({
      ...prev,
      [ciudad.toLowerCase()]: (prev[ciudad.toLowerCase()] || []).map(a => a.id === id ? { ...a, completada: !a.completada } : a)
    }));
  };

  const eliminarAccion = (id) => {
    setAcciones(prev => ({
      ...prev,
      [ciudad.toLowerCase()]: (prev[ciudad.toLowerCase()] || []).filter(a => a.id !== id)
    }));
  };

  // GENERAR PDF para una ciudad específica
  const generarPDFCiudad = (ciudadPDF) => {
    const ciudadKey = ciudadPDF.toLowerCase();
    const datosCiudadHoy = data?.hoy?.[ciudadKey] || { intervenciones: [], metricas: {} };
    const datosCiudadManana = data?.manana?.[ciudadKey] || { intervenciones: [], metricas: {} };
    const datosCiudadAyer = data?.ayer?.[ciudadKey] || { intervenciones: [] };
    
    const intervencionesPDF = diaSeleccionado === 'hoy' 
      ? datosCiudadHoy.intervenciones 
      : datosCiudadManana.intervenciones;
    const metricasPDF = diaSeleccionado === 'hoy' 
      ? datosCiudadHoy.metricas 
      : datosCiudadManana.metricas;
    
    const fecha = diaSeleccionado === 'hoy' ? data?.hoy?.fecha : data?.manana?.fecha;
    const fechaFile = (fecha || '').replace(/\//g, '-');
    const ciudadUpper = ciudadPDF.charAt(0).toUpperCase() + ciudadPDF.slice(1);
    const diaSemana = diaSeleccionado === 'hoy' ? data?.hoy?.dia_semana : data?.manana?.dia_semana;
    
    const objetivoPDF = OBJETIVOS[ciudadKey];
    const amountPDF = calcularAmount(intervencionesPDF);
    const porcentajePDF = objetivoPDF > 0 ? Math.round((amountPDF / objetivoPDF) * 100) : 0;
    
    const alertas = (intervencionesPDF || []).filter(i => i.alerta_sin_tecnico || i.alerta_stock || i.alerta_prioridad);
    const sinProblemas = (intervencionesPDF || []).filter(i => !i.alerta_sin_tecnico && !i.alerta_stock && !i.alerta_prioridad && !esIncidencia(i.tipo));
    const incidenciasPDF = (intervencionesPDF || []).filter(i => esIncidencia(i.tipo));
    
    // Ayer para el PDF
    const ayerPDF = datosCiudadAyer.intervenciones || [];
    const ayerNoCerradasPDF = ayerPDF.filter(i => !estadoCerrado(i.estado));
    
    // Acciones de esta ciudad
    const accionesPDF = acciones[ciudadKey] || [];

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Puntos de Accion_Daily_${ciudadUpper}_${fechaFile}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1A1A1A; font-size: 11px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1A5365; padding-bottom: 15px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #1A5365; }
    .logo span { color: #CD7657; }
    .titulo-doc { font-size: 12px; color: #5A5A5A; margin-top: 4px; }
    .fecha { text-align: right; }
    .fecha-dia { font-size: 16px; font-weight: bold; color: #1A5365; }
    .fecha-fecha { font-size: 12px; color: #5A5A5A; }
    .ciudad { display: inline-block; background: #1A5365; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; margin-top: 4px; }
    
    .objetivo-box { background: linear-gradient(135deg, #f0f7f9, #e8f4f8); padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .objetivo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .objetivo-label { font-weight: 600; color: #1A5365; }
    .objetivo-valor { font-size: 20px; font-weight: bold; }
    .objetivo-verde { color: #16A34A; }
    .progress-bar { height: 12px; background: #CAC9C9; border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 6px; }
    .progress-verde { background: #16A34A; }
    .progress-amarillo { background: #CA8A04; }
    .progress-rojo { background: #CD7657; }
    
    .metricas { display: flex; gap: 10px; margin-bottom: 20px; }
    .metrica { flex: 1; padding: 12px; border-radius: 6px; text-align: center; }
    .metrica-valor { font-size: 22px; font-weight: bold; }
    .metrica-label { font-size: 9px; color: #5A5A5A; margin-top: 2px; text-transform: uppercase; }
    .metrica-total { background: #f0f7f9; }
    .metrica-total .metrica-valor { color: #1A5365; }
    .metrica-alerta { background: #fef2f2; }
    .metrica-alerta .metrica-valor { color: #DC2626; }
    .metrica-ok { background: #f0fdf4; }
    .metrica-ok .metrica-valor { color: #16A34A; }
    
    h2 { font-size: 13px; color: #1A5365; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #CAC9C9; }
    
    .intervencion { padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid; background: #fafafa; page-break-inside: avoid; }
    .intervencion-ok { border-left-color: #16A34A; }
    .intervencion-alerta { border-left-color: #DC2626; background: #fef8f8; }
    .intervencion-incidencia { border-left-color: #CD7657; background: #fff8f6; }
    .int-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .int-so { font-weight: bold; color: #1A5365; background: #e8f4f8; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
    .int-cliente { font-weight: 600; font-size: 11px; }
    .int-amount { font-weight: bold; color: #16A34A; background: #f0fdf4; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
    .int-tipo { color: #5A5A5A; font-size: 10px; }
    .int-detalles { display: flex; gap: 15px; font-size: 10px; color: #5A5A5A; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; margin-left: 6px; }
    .badge-rojo { background: #fee2e2; color: #DC2626; }
    .badge-amarillo { background: #fef3c7; color: #CA8A04; }
    .badge-naranja { background: #ffedd5; color: #EA580C; }
    .badge-incidencia { background: #fff1ee; color: #CD7657; }
    
    .ayer-section { background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
    .ayer-titulo { color: #DC2626; font-weight: 600; margin-bottom: 8px; }
    .ayer-item { padding: 6px 8px; margin-bottom: 4px; border-radius: 4px; font-size: 10px; display: flex; justify-content: space-between; background: white; }
    
    .acciones { margin-top: 20px; }
    .accion { padding: 8px 12px; margin-bottom: 6px; border-radius: 6px; background: #fffbeb; border-left: 4px solid #CA8A04; font-size: 11px; }
    .accion-completada { background: #f0fdf4; border-left-color: #16A34A; text-decoration: line-through; color: #5A5A5A; }
    
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #CAC9C9; font-size: 9px; color: #5A5A5A; text-align: center; }
    
    .no-alertas { padding: 15px; text-align: center; background: #f0fdf4; border-radius: 6px; color: #16A34A; font-weight: 600; font-size: 11px; }
    
    @media print { body { padding: 15px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Cool<span>fy</span></div>
      <div class="titulo-doc">Puntos de Acción - Daily</div>
      <div class="ciudad">${ciudadUpper.toUpperCase()}</div>
    </div>
    <div class="fecha">
      <div class="fecha-dia">${diaSemana || ''}</div>
      <div class="fecha-fecha">${fecha || ''}</div>
    </div>
  </div>

  <div class="objetivo-box">
    <div class="objetivo-header">
      <span class="objetivo-label">📊 Objetivo del día (instalaciones sin IVA)</span>
      <span class="objetivo-valor ${porcentajePDF >= 100 ? 'objetivo-verde' : ''}">${formatEur(amountPDF)} / ${formatEur(objetivoPDF)} (${porcentajePDF}%)</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill ${porcentajePDF >= 100 ? 'progress-verde' : porcentajePDF >= 70 ? 'progress-amarillo' : 'progress-rojo'}" style="width: ${Math.min(porcentajePDF, 100)}%"></div>
    </div>
  </div>

  <div class="metricas">
    <div class="metrica metrica-total">
      <div class="metrica-valor">${(metricasPDF?.total || 0)}</div>
      <div class="metrica-label">Intervenciones</div>
    </div>
    <div class="metrica ${(metricasPDF?.sin_tecnico || 0) > 0 ? 'metrica-alerta' : 'metrica-ok'}">
      <div class="metrica-valor">${metricasPDF?.sin_tecnico || 0}</div>
      <div class="metrica-label">Sin Técnico</div>
    </div>
    <div class="metrica ${(metricasPDF?.sin_stock || 0) > 0 ? 'metrica-alerta' : 'metrica-ok'}">
      <div class="metrica-valor">${metricasPDF?.sin_stock || 0}</div>
      <div class="metrica-label">Sin Stock</div>
    </div>
    <div class="metrica ${(metricasPDF?.prioridad_alta || 0) > 0 ? 'metrica-alerta' : 'metrica-ok'}">
      <div class="metrica-valor">${metricasPDF?.prioridad_alta || 0}</div>
      <div class="metrica-label">Prioridad Alta</div>
    </div>
  </div>

  ${ayerNoCerradasPDF.length > 0 ? `
  <div class="ayer-section">
    <div class="ayer-titulo">⚠️ AYER - Intervenciones NO cerradas (${ayerNoCerradasPDF.length})</div>
    ${ayerNoCerradasPDF.map(i => `
      <div class="ayer-item">
        <span><strong>${i.so}</strong> - ${i.cliente}</span>
        <span style="color: #DC2626">${i.estado} ${!esIncidencia(i.tipo) && i.amount ? '· ' + formatEur(i.amount) : ''}</span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${alertas.length > 0 ? `
  <h2>🚨 CON ALERTAS (${alertas.length}) - Prioridad por valor</h2>
  ${alertas.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)).map(i => `
    <div class="intervencion intervencion-alerta">
      <div class="int-header">
        <div>
          <span class="int-so">${i.so}</span>
          <span class="int-cliente">${i.cliente}</span>
          ${i.alerta_sin_tecnico ? '<span class="badge badge-rojo">SIN TÉCNICO</span>' : ''}
          ${i.alerta_stock ? '<span class="badge badge-naranja">SIN STOCK</span>' : ''}
          ${i.alerta_prioridad ? '<span class="badge badge-amarillo">PRIORIDAD</span>' : ''}
        </div>
        ${!esIncidencia(i.tipo) && i.amount ? `<span class="int-amount">${formatEur(i.amount)}</span>` : ''}
      </div>
      <div class="int-tipo">${i.tipo}</div>
      <div class="int-detalles">
        <span>🕐 ${i.hora || '-'}</span>
        <span>👤 ${i.tecnico || 'Sin asignar'}</span>
        <span>📍 PMO: ${i.pmo || '-'}</span>
      </div>
    </div>
  `).join('')}
  ` : '<div class="no-alertas">✅ No hay intervenciones con alertas</div>'}

  ${incidenciasPDF.length > 0 ? `
  <h2>🔧 INCIDENCIAS / MANTENIMIENTO (${incidenciasPDF.length})</h2>
  ${incidenciasPDF.map(i => `
    <div class="intervencion intervencion-incidencia">
      <div class="int-header">
        <div>
          <span class="int-so">${i.so}</span>
          <span class="int-cliente">${i.cliente}</span>
          <span class="badge badge-incidencia">INCIDENCIA</span>
        </div>
      </div>
      <div class="int-tipo">${i.tipo}</div>
      <div class="int-detalles">
        <span>🕐 ${i.hora || '-'}</span>
        <span>👤 ${i.tecnico || 'Sin asignar'}</span>
      </div>
    </div>
  `).join('')}
  ` : ''}

  ${sinProblemas.length > 0 ? `
  <h2>✅ INSTALACIONES OK (${sinProblemas.length})</h2>
  ${sinProblemas.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)).map(i => `
    <div class="intervencion intervencion-ok">
      <div class="int-header">
        <div>
          <span class="int-so">${i.so}</span>
          <span class="int-cliente">${i.cliente}</span>
        </div>
        ${i.amount ? `<span class="int-amount">${formatEur(i.amount)}</span>` : ''}
      </div>
      <div class="int-tipo">${i.tipo}</div>
      <div class="int-detalles">
        <span>🕐 ${i.hora || '-'}</span>
        <span>👤 ${i.tecnico || '-'}</span>
        <span>📍 PMO: ${i.pmo || '-'}</span>
      </div>
    </div>
  `).join('')}
  ` : ''}

  ${accionesPDF.length > 0 ? `
  <h2>📋 ACCIONES A TOMAR (${accionesPDF.length})</h2>
  ${accionesPDF.map(a => `
    <div class="accion ${a.completada ? 'accion-completada' : ''}">
      ${a.completada ? '✓' : '○'} ${a.texto}
    </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    Generado el ${new Date().toLocaleString('es-ES')} · Coolfy Daily Ops
  </div>
</body>
</html>`;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: colors.azul, fontWeight: '600' }}>Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: colors.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ color: colors.rojo, fontWeight: '600', marginBottom: '10px' }}>Error cargando datos</div>
          <div style={{ color: colors.textoSec, fontSize: '12px' }}>{error}</div>
          <button onClick={cargarDatos} style={{ marginTop: '16px', padding: '10px 20px', background: colors.azul, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.fondo, fontFamily: "'DM Sans', sans-serif", color: colors.texto }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: ${colors.blanco}; border-radius: 12px; box-shadow: 0 2px 8px rgba(26,83,101,0.08); }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; }
        .intervention-card { padding: 14px; border-radius: 10px; border-left: 4px solid; margin-bottom: 10px; background: white; }
        input { padding: 10px 12px; border: 2px solid ${colors.gris}; border-radius: 8px; font-size: 13px; font-family: inherit; width: 100%; }
        input:focus { outline: none; border-color: ${colors.azul}; }
        .amount-badge { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 12px; color: ${colors.verde}; background: rgba(22,163,74,0.1); padding: 3px 8px; border-radius: 5px; }
        .incidencia-badge { font-size: 10px; color: ${colors.naranja}; background: rgba(205,118,87,0.15); padding: 3px 8px; border-radius: 5px; }
        .progress-bar { height: 10px; background: ${colors.gris}; border-radius: 5px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s; }
        .ayer-item { padding: 10px; border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
      `}</style>

      {/* Header */}
      <div style={{ background: colors.azul, padding: '16px 24px', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>Cool<span style={{ color: colors.naranja }}>fy</span></div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Daily de Operaciones</div>
            {lastUpdate && (
              <button onClick={cargarDatos} style={{ fontSize: '11px', opacity: 0.7, background: 'rgba(255,255,255,0.15)', border: 'none', padding: '4px 10px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                🔄 {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {['madrid', 'barcelona'].map(c => (
              <button key={c} onClick={() => setCiudad(c)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.3)',
                  background: ciudad === c ? 'white' : 'transparent', color: ciudad === c ? colors.azul : 'white' }}>
                {c === 'madrid' ? '🏛️ Madrid' : '🏗️ Barcelona'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
        
        {/* ============ SECCIÓN AYER ============ */}
        <div className="card" style={{ 
          padding: '16px', 
          marginBottom: '20px', 
          background: ayerNoCerradas.length > 0 
            ? 'linear-gradient(135deg, rgba(220,38,38,0.03), rgba(220,38,38,0.08))' 
            : 'linear-gradient(135deg, rgba(22,163,74,0.03), rgba(22,163,74,0.08))',
          border: ayerNoCerradas.length > 0 ? '1px solid rgba(220,38,38,0.2)' : '1px solid rgba(22,163,74,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mostrarAyer ? '12px' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: colors.azul }}>
                📆 AYER - {data?.ayer?.dia_semana || ''} {data?.ayer?.fecha || ''}
              </span>
              {ayerNoCerradas.length > 0 ? (
                <span className="badge" style={{ background: `${colors.rojo}15`, color: colors.rojo }}>
                  {ayerNoCerradas.length} no cerradas
                </span>
              ) : (
                <span className="badge" style={{ background: `${colors.verde}15`, color: colors.verde }}>
                  ✓ Todo cerrado
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: colors.azul }}>{formatEur(amountAyerTotal)}</span>
              <button onClick={() => setMostrarAyer(!mostrarAyer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.azulSec, fontSize: '14px' }}>
                {mostrarAyer ? '▲' : '▼'}
              </button>
            </div>
          </div>
          
          {mostrarAyer && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Cerradas */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: colors.verde, marginBottom: '8px' }}>
                  ✅ CERRADAS ({ayerCerradas.length})
                </div>
                {ayerCerradas.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: colors.textoSec, fontSize: '11px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
                    Sin intervenciones cerradas
                  </div>
                ) : (
                  ayerCerradas.slice(0, 5).map(i => (
                    <div key={i.id || i.so} className="ayer-item" style={{ background: 'rgba(22,163,74,0.05)', borderLeft: `3px solid ${colors.verde}` }}>
                      <div>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '10px', fontWeight: '600', color: colors.azul }}>{i.so}</span>
                        <span style={{ marginLeft: '8px' }}>{i.cliente}</span>
                      </div>
                      {!esIncidencia(i.tipo) && <span style={{ color: colors.verde, fontWeight: '600' }}>{formatEur(i.amount)}</span>}
                    </div>
                  ))
                )}
              </div>
              
              {/* No cerradas */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: colors.rojo, marginBottom: '8px' }}>
                  ⚠️ NO CERRADAS ({ayerNoCerradas.length})
                </div>
                {ayerNoCerradas.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: colors.verde, fontSize: '11px', background: 'rgba(22,163,74,0.05)', borderRadius: '6px' }}>
                    🎉 Todo OK
                  </div>
                ) : (
                  ayerNoCerradas.map(i => (
                    <div key={i.id || i.so} className="ayer-item" style={{ background: 'rgba(220,38,38,0.05)', borderLeft: `3px solid ${colors.rojo}` }}>
                      <div>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '10px', fontWeight: '600', color: colors.azul }}>{i.so}</span>
                        <span style={{ marginLeft: '8px' }}>{i.cliente}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {!esIncidencia(i.tipo) && <div style={{ color: colors.rojo, fontWeight: '600' }}>{formatEur(i.amount)}</div>}
                        <div style={{ fontSize: '10px', color: colors.rojo }}>{i.estado}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Objetivo del día */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(26,83,101,0.03), rgba(26,83,101,0.08))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: colors.azul }}>📊 Objetivo {diaSeleccionado === 'hoy' ? 'HOY' : 'MAÑANA'}</span>
              <span style={{ fontSize: '10px', color: colors.textoSec, background: `${colors.azul}10`, padding: '2px 6px', borderRadius: '4px' }}>Solo instalaciones · Sin IVA</span>
            </div>
            <div>
              <span style={{ fontSize: '22px', fontWeight: '700', color: porcentajeObjetivo >= 100 ? colors.verde : colors.azul }}>{formatEur(amountActual)}</span>
              <span style={{ fontSize: '14px', color: colors.textoSec }}> / {formatEur(objetivo)} ({porcentajeObjetivo}%)</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(porcentajeObjetivo, 100)}%`, background: porcentajeObjetivo >= 100 ? colors.verde : porcentajeObjetivo >= 70 ? colors.amarillo : colors.naranja }}/>
          </div>
        </div>

        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {['hoy', 'manana'].map(d => {
            const dat = d === 'hoy' ? datosHoy : datosManana;
            const met = dat?.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
            const fecha = d === 'hoy' ? data?.hoy?.fecha : data?.manana?.fecha;
            const amt = d === 'hoy' ? amountHoy : amountManana;
            const alertas = (met.sin_tecnico || 0) + (met.sin_stock || 0) + (met.prioridad_alta || 0);
            const ints = dat?.intervenciones || [];
            const numInc = ints.filter(i => esIncidencia(i.tipo)).length;
            
            return (
              <div key={d} onClick={() => setDiaSeleccionado(d)} 
                style={{ flex: 1, padding: '16px', borderRadius: '12px', cursor: 'pointer', 
                  border: diaSeleccionado === d ? `2px solid ${colors.azul}` : '2px solid transparent', 
                  background: diaSeleccionado === d ? 'white' : 'rgba(255,255,255,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: colors.azul }}>{d === 'hoy' ? 'HOY' : 'MAÑANA'}</div>
                    <div style={{ fontSize: '12px', color: colors.textoSec }}>{fecha}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: colors.verde }}>{formatEur(amt)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      {numInc > 0 && <span style={{ fontSize: '10px', color: colors.naranja }}>+{numInc}🔧</span>}
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alertas > 0 ? colors.rojo : colors.verde }}/>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { l: 'Total', v: met.total || 0, c: colors.azul },
                    { l: 'Sin téc', v: met.sin_tecnico || 0, c: (met.sin_tecnico || 0) > 0 ? colors.rojo : colors.verde },
                    { l: 'Stock', v: met.sin_stock || 0, c: (met.sin_stock || 0) > 0 ? colors.naranja : colors.verde }
                  ].map(m => (
                    <div key={m.l} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '6px', background: `${m.c}10` }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: '9px', color: colors.textoSec }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          {/* Intervenciones */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.azul }}>
                📋 Intervenciones {diaSeleccionado === 'hoy' ? 'HOY' : 'MAÑANA'}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {numIncidencias > 0 && <span style={{ fontSize: '11px', color: colors.naranja }}>🔧 {numIncidencias} incidencias</span>}
                <span style={{ fontSize: '12px', color: colors.textoSec }}>{intervenciones.length} total</span>
              </div>
            </div>

            {intervenciones.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: colors.textoSec }}>No hay intervenciones</div>
            ) : (
              intervencionesSorted.map(i => {
                const esInc = esIncidencia(i.tipo);
                const hasAlert = i.alerta_sin_tecnico || i.alerta_stock || i.alerta_prioridad;
                const borderColor = i.alerta_sin_tecnico ? colors.rojo : i.alerta_prioridad ? colors.amarillo : i.alerta_stock ? colors.naranja : esInc ? colors.naranja : colors.verde;
                
                return (
                  <div key={i.id || i.so} className="intervention-card" style={{ borderLeftColor: borderColor }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '11px', fontWeight: '600', color: colors.azul, background: `${colors.azul}15`, padding: '2px 8px', borderRadius: '4px' }}>{i.so}</span>
                        <span style={{ fontWeight: '600' }}>{i.cliente}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {esInc ? (
                          <span className="incidencia-badge">🔧 Incidencia</span>
                        ) : i.amount ? (
                          <span className="amount-badge">{formatEur(i.amount)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: colors.textoSec }}>{i.tipo}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {i.alerta_sin_tecnico && <span className="badge" style={{ background: `${colors.rojo}15`, color: colors.rojo }}>Sin téc</span>}
                        {i.alerta_stock && <span className="badge" style={{ background: `${colors.naranja}15`, color: colors.naranja }}>Stock</span>}
                        {i.alerta_prioridad && <span className="badge" style={{ background: `${colors.amarillo}15`, color: colors.amarillo }}>Prioridad</span>}
                        {!hasAlert && !esInc && <span className="badge" style={{ background: `${colors.verde}15`, color: colors.verde }}>OK</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textoSec, display: 'flex', gap: '16px' }}>
                      <span>🕐 {i.hora || '-'}</span>
                      <span>👤 {i.tecnico || 'Sin asignar'}</span>
                      <span>📍 {i.pmo || '-'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Técnicos */}
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.azul }}>👷 Técnicos {ciudad}</h3>
              {tecnicos.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: colors.textoSec, fontSize: '12px' }}>Sin datos</div>
              ) : (
                tecnicos.slice(0, 5).map(t => (
                  <div key={t.nombre} style={{ padding: '8px 10px', borderRadius: '6px', marginBottom: '6px', background: `${colors.azul}05` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', fontSize: '13px' }}>{t.nombre}</span>
                      <span style={{ fontSize: '11px', color: colors.textoSec }}>{t.completadas} trabajos</span>
                    </div>
                    <div style={{ fontSize: '10px', color: colors.azulSec, marginTop: '2px' }}>
                      {(t.especialidades || []).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Acciones */}
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.azul }}>📝 Acciones - {ciudad}</h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Nueva acción..." 
                  value={nuevaAccion} 
                  onChange={(e) => setNuevaAccion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && agregarAccion()}
                />
                <button onClick={agregarAccion} className="btn" style={{ background: colors.azul, color: 'white', padding: '10px 14px' }}>+</button>
              </div>

              {accionesCiudad.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: colors.textoSec, fontSize: '12px', background: `${colors.gris}20`, borderRadius: '8px' }}>
                  Añade acciones durante la reunión
                </div>
              ) : (
                accionesCiudad.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '6px', marginBottom: '6px', background: a.completada ? `${colors.verde}10` : `${colors.amarillo}10`, borderLeft: `3px solid ${a.completada ? colors.verde : colors.amarillo}` }}>
                    <input 
                      type="checkbox" 
                      checked={a.completada} 
                      onChange={() => toggleAccion(a.id)}
                      style={{ width: 'auto' }}
                    />
                    <span style={{ flex: 1, fontSize: '12px', textDecoration: a.completada ? 'line-through' : 'none', color: a.completada ? colors.textoSec : colors.texto }}>{a.texto}</span>
                    <button onClick={() => eliminarAccion(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.rojo, fontSize: '14px' }}>×</button>
                  </div>
                ))
              )}
            </div>

            {/* Botones PDF */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => generarPDFCiudad('madrid')} 
                className="btn" 
                style={{ flex: 1, background: colors.azul, color: 'white', padding: '12px', fontSize: '12px' }}
              >
                📄 PDF Madrid
              </button>
              <button 
                onClick={() => generarPDFCiudad('barcelona')} 
                className="btn" 
                style={{ flex: 1, background: colors.naranja, color: 'white', padding: '12px', fontSize: '12px' }}
              >
                📄 PDF Barcelona
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
