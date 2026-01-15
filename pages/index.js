import React, { useState, useEffect } from 'react';

// ⚠️ CAMBIAR POR TU URL REAL
const API_URL = 'https://script.google.com/macros/s/AKfycbzUNdSwoU5_SZukJKp0pBVeh_yDyH21cyXmueCmS_CeBt0n8m7A89Y5bz69ReTPzw/exec';

const OBJETIVOS = { madrid: 14770, barcelona: 7955 };
const OWNERS = {
  madrid: ['Andrea Riaño', 'Felipe Garay', 'City Manager Madrid'],
  barcelona: ['Katty Pando', 'Ignacio Marcet', 'City Manager Barcelona']
};

const colors = {
  fondo: '#F2EFEC', azul: '#1A5365', azulSec: '#658398', gris: '#CAC9C9',
  naranja: '#CD7657', rojo: '#DC2626', amarillo: '#CA8A04', verde: '#16A34A',
  blanco: '#FFFFFF', texto: '#1A1A1A', textoSec: '#5A5A5A'
};

const formatEur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n || 0);
const esIncidencia = (t) => (t||'').toLowerCase().includes('incidencia') || (t||'').toLowerCase().includes('mantenimiento');
const estadoCerrado = (e) => ['Validada', 'Realizada'].includes(e);
const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '';

// Mini icons
const Icons = {
  User: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Flag: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
};

// DATOS DEMO (se reemplazará por API real)
const DEMO = {
  ayer: {
    fecha: "14/01/2026", dia_semana: "Martes",
    madrid: { intervenciones: [
      { id: "1", so: "SO252530", cliente: "Inversiones Sur", tipo: "Instalación Split", tecnico: "Molina", pmo: "Andrea Riaño", amount: 2400, estado: "Validada" },
      { id: "2", so: "SO252531", cliente: "Roberto Fernández", tipo: "Instalación Aerotermia", tecnico: "Elahmadi", pmo: "Felipe Garay", amount: 7200, estado: "Validada" },
      { id: "3", so: "SO252532", cliente: "Comercial Norte", tipo: "Instalación Split", tecnico: "Gallardo", pmo: "Andrea Riaño", amount: 1800, estado: "Cancelada" },
    ], objetivo: OBJETIVOS.madrid },
    barcelona: { intervenciones: [
      { id: "4", so: "SO252534", cliente: "Tecno BCN", tipo: "Instalación Split", tecnico: "Finocchio", pmo: "Katty Pando", amount: 3100, estado: "Validada" },
      { id: "5", so: "SO252535", cliente: "Maria Vidal", tipo: "Instalación Conductos", tecnico: "Martinez", pmo: "Ignacio Marcet", amount: 4800, estado: "Realizada" },
      { id: "6", so: "SO252537", cliente: "Energia Verda", tipo: "Instalación Split", tecnico: "Finocchio", pmo: "Ignacio Marcet", amount: 2200, estado: "No realizada" },
    ], objetivo: OBJETIVOS.barcelona }
  },
  hoy: {
    fecha: "15/01/2026", dia_semana: "Miércoles",
    madrid: { intervenciones: [
      { id: "10", so: "SO252547", cliente: "Carmen Heriz", tipo: "Instalación Split", hora: "09:00", tecnico: "Molina", direccion: "Calle Mayor 15", telefono: "612345678", pipeline: "Stock entregado", pmo: "Andrea Riaño", amount: 2850, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
      { id: "11", so: "SO252548", cliente: "Tech Solutions", tipo: "Instalación Aerotermia", hora: "10:00", tecnico: "Elahmadi", direccion: "Av América 42", telefono: "622333444", pipeline: "Stock entregado", pmo: "Felipe Garay", amount: 8500, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: true },
      { id: "12", so: "SO252549", cliente: "María López", tipo: "Instalación Split", hora: "14:00", tecnico: "Sin asignar", direccion: "Calle Alcalá 234", telefono: "633444555", pipeline: "Stock reservado", pmo: "Andrea Riaño", amount: 1950, alerta_sin_tecnico: true, alerta_stock: false, alerta_prioridad: false },
    ], metricas: { total: 3, sin_tecnico: 1, sin_stock: 0, prioridad_alta: 1 }, objetivo: OBJETIVOS.madrid },
    barcelona: { intervenciones: [
      { id: "20", so: "SO252552", cliente: "Oscar Aragón", tipo: "Instalación Split", hora: "08:30", tecnico: "Finocchio", direccion: "Mallorca 245", telefono: "644555666", pipeline: "Stock entregado", pmo: "Katty Pando", amount: 3200, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
      { id: "21", so: "SO252553", cliente: "Columat Systems", tipo: "Instalación Conductos", hora: "09:00", tecnico: "Martinez", direccion: "Via Augusta 15", telefono: "655666777", pipeline: "Stock entregado", pmo: "Ignacio Marcet", amount: 5800, alerta_sin_tecnico: false, alerta_stock: false, alerta_prioridad: false },
      { id: "22", so: "SO252555", cliente: "Albert Rodríguez", tipo: "Instalación Split", hora: "15:00", tecnico: "Sin asignar", direccion: "Rambla Catalunya 80", telefono: "677888999", pipeline: "Stock en Tránsito", pmo: "Katty Pando", amount: 2100, alerta_sin_tecnico: true, alerta_stock: true, alerta_prioridad: false },
    ], metricas: { total: 3, sin_tecnico: 1, sin_stock: 1, prioridad_alta: 0 }, objetivo: OBJETIVOS.barcelona }
  },
  manana: {
    fecha: "16/01/2026", dia_semana: "Jueves",
    madrid: { intervenciones: [
      { id: "30", so: "SO252556", cliente: "Pedro Sánchez", tipo: "Puesta en Servicio Aerotermia", hora: "09:00", tecnico: "Sin asignar", direccion: "Serrano 50", telefono: "688999000", pipeline: "Stock entregado", pmo: "Felipe Garay", amount: 4200, alerta_sin_tecnico: true, alerta_stock: false, alerta_prioridad: true },
    ], metricas: { total: 1, sin_tecnico: 1, sin_stock: 0, prioridad_alta: 1 }, objetivo: OBJETIVOS.madrid },
    barcelona: { intervenciones: [
      { id: "40", so: "SO252558", cliente: "José Ángel Pérez", tipo: "Instalación Split", hora: "09:00", tecnico: "Sin asignar", direccion: "Passeig Gràcia 100", telefono: "699000111", pipeline: "Stock en Tránsito", pmo: "Katty Pando", amount: 2800, alerta_sin_tecnico: true, alerta_stock: true, alerta_prioridad: false },
      { id: "41", so: "SO252559", cliente: "Hoda Dahrouj", tipo: "Instalación Split", hora: "14:00", tecnico: "Sin asignar", direccion: "Balmes 200", telefono: "600111222", pipeline: "Stock entregado", pmo: "Katty Pando", amount: 3500, alerta_sin_tecnico: true, alerta_stock: false, alerta_prioridad: false },
    ], metricas: { total: 2, sin_tecnico: 2, sin_stock: 1, prioridad_alta: 0 }, objetivo: OBJETIVOS.barcelona }
  },
  tecnicos: {
    madrid: [{ nombre: "Molina", especialidades: ["Split", "Aerotermia"], completadas: 52 }, { nombre: "Elahmadi", especialidades: ["Aerotermia"], completadas: 8 }],
    barcelona: [{ nombre: "Finocchio", especialidades: ["Split", "Aerotermia"], completadas: 26 }, { nombre: "Martinez", especialidades: ["Conductos", "Split"], completadas: 15 }]
  },
  acciones: {
    madrid: [
      { id: "ACC-001", fecha: "2026-01-14", texto: "Asignar Molina a SO252532", owner: "Andrea Riaño", estado: "pendiente", so: "SO252532", origen: "recomendacion" },
      { id: "ACC-002", fecha: "2026-01-14", texto: "Confirmar stock aerotermia", owner: "Felipe Garay", estado: "bloqueado", so: "SO252531", notas: "Proveedor sin stock" },
    ],
    barcelona: [
      { id: "ACC-003", fecha: "2026-01-14", texto: "Llamar cliente SO252537", owner: "Ignacio Marcet", estado: "pendiente", so: "SO252537", origen: "manual" },
    ]
  }
};

export default function DailyOpsDashboard() {
  const [data, setData] = useState(DEMO);
  const [ciudad, setCiudad] = useState('barcelona');
  const [diaSeleccionado, setDiaSeleccionado] = useState('hoy');
  const [acciones, setAcciones] = useState({ madrid: [...DEMO.acciones.madrid], barcelona: [...DEMO.acciones.barcelona] });
  const [nuevaAccion, setNuevaAccion] = useState('');
  const [nuevoOwner, setNuevoOwner] = useState(OWNERS.barcelona[0]);
  const [filtroOwner, setFiltroOwner] = useState('todos');
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(true);
  const [mostrarAyer, setMostrarAyer] = useState(true);
  const [reunionIniciada, setReunionIniciada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [recAplicando, setRecAplicando] = useState(null); // Recomendación en proceso de aplicar
  const [recOwner, setRecOwner] = useState('');

  useEffect(() => { setNuevoOwner(OWNERS[ciudad][0]); setRecOwner(OWNERS[ciudad][0]); setFiltroOwner('todos'); }, [ciudad]);

  // Cargar datos desde API (cuando esté conectada)
  const cargarDatos = async () => {
    try {
      const res = await fetch(`${API_URL}?action=getData&ciudad=${ciudad}`);
      const json = await res.json();
      setData(json);
      if (json.acciones) setAcciones(prev => ({ ...prev, [ciudad]: json.acciones }));
    } catch (e) {
      console.log('Usando datos demo');
    }
  };

  // Iniciar reunión
  const iniciarReunion = () => {
    setReunionIniciada(new Date());
  };

  // Finalizar reunión - Guarda en Google Sheets
  const finalizarReunion = async () => {
    if (!reunionIniciada) return;
    setGuardando(true);

    const datosHoy = data.hoy[ciudad];
    const amountHoy = datosHoy.intervenciones.filter(i => !esIncidencia(i.tipo)).reduce((s, i) => s + (i.amount || 0), 0);
    const objetivo = datosHoy.objetivo || OBJETIVOS[ciudad];

    const resumen = {
      horaInicio: reunionIniciada.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      intervencionesHoy: datosHoy.intervenciones.length,
      amountHoy,
      porcentajeObjetivo: Math.round((amountHoy / objetivo) * 100),
      notas: ''
    };

    try {
      // Guardar cada acción nueva en Google Sheets
      for (const acc of acciones[ciudad].filter(a => a.id.startsWith('LOCAL-'))) {
        await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'guardarAccion', accion: { ...acc, ciudad } })
        });
      }

      // Finalizar reunión
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'finalizarReunion', ciudad, resumen })
      });
      const json = await res.json();

      if (json.success) {
        alert(`✅ Reunión finalizada!\n\nID: ${json.idDaily}\nAcciones pendientes arrastradas: ${json.resumen?.pendientesArrastradas || 0}`);
        setReunionIniciada(null);
      }
    } catch (e) {
      alert('⚠️ Error guardando. Los datos se mantienen localmente.');
    }
    setGuardando(false);
  };

  const getDatos = (dia) => dia === 'ayer' ? data.ayer[ciudad] : dia === 'hoy' ? data.hoy[ciudad] : data.manana[ciudad];
  const datosAyer = getDatos('ayer');
  const datosActuales = getDatos(diaSeleccionado);
  const datosHoy = getDatos('hoy');
  const datosManana = getDatos('manana');
  const tecnicos = data.tecnicos[ciudad] || [];
  const accionesCiudad = acciones[ciudad] || [];
  const ownersCiudad = OWNERS[ciudad];

  const metricas = datosActuales.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
  const accionesPendientes = accionesCiudad.filter(a => a.estado === 'pendiente');
  const accionesBloqueadas = accionesCiudad.filter(a => a.estado === 'bloqueado');
  const accionesFiltradas = filtroOwner === 'todos' ? accionesCiudad : accionesCiudad.filter(a => a.owner === filtroOwner);

  const ayerCerradas = datosAyer.intervenciones.filter(i => estadoCerrado(i.estado));
  const ayerPendientes = datosAyer.intervenciones.filter(i => !estadoCerrado(i.estado));
  const amountAyer = ayerCerradas.filter(i => !esIncidencia(i.tipo)).reduce((s, i) => s + (i.amount || 0), 0);

  const amountHoy = datosActuales.intervenciones.filter(i => !esIncidencia(i.tipo)).reduce((s, i) => s + (i.amount || 0), 0);
  const objetivo = datosActuales.objetivo || OBJETIVOS[ciudad];
  const porcentaje = objetivo > 0 ? Math.round((amountHoy / objetivo) * 100) : 0;

  // Gestión de acciones
  const agregarAccion = () => {
    if (!nuevaAccion.trim()) return;
    const acc = { id: 'LOCAL-' + Date.now(), fecha: new Date().toISOString().split('T')[0], texto: nuevaAccion.trim(), owner: nuevoOwner, estado: 'pendiente', origen: 'manual' };
    setAcciones(prev => ({ ...prev, [ciudad]: [...prev[ciudad], acc] }));
    setNuevaAccion('');
  };

  const cambiarEstado = (id, estado) => {
    setAcciones(prev => ({ ...prev, [ciudad]: prev[ciudad].map(a => a.id === id ? { ...a, estado, fechaResolucion: estado === 'hecho' ? new Date().toISOString().split('T')[0] : null } : a) }));
    // Sincronizar con API
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'actualizarAccion', id, cambios: { estado } }) }).catch(() => {});
  };

  const eliminarAccion = (id) => {
    setAcciones(prev => ({ ...prev, [ciudad]: prev[ciudad].filter(a => a.id !== id) }));
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'eliminarAccion', id }) }).catch(() => {});
  };

  // Generar recomendaciones (efímeras, no se guardan)
  const generarRecomendaciones = () => {
    const recs = [];
    const ints = datosManana.intervenciones || [];
    const tecs = tecnicos || [];
    
    ints.filter(i => !esIncidencia(i.tipo)).sort((a, b) => (b.amount || 0) - (a.amount || 0)).forEach(int => {
      if (int.alerta_sin_tecnico && !int.alerta_stock) {
        const tecDisponible = tecs.find(t => t.especialidades?.some(e => int.tipo.includes(e)));
        if (tecDisponible) {
          recs.push({
            id: `rec-${int.id}`,
            tipo: 'asignar',
            severidad: int.amount > 3000 ? 'alta' : 'media',
            titulo: 'Asignar técnico',
            descripcion: `${int.so} (${formatEur(int.amount)}) tiene stock pero no técnico.`,
            accionTexto: `Asignar ${tecDisponible.nombre} a ${int.so}`,
            so: int.so,
            impacto: formatEur(int.amount),
            ownerSugerido: int.pmo
          });
        }
      } else if (int.alerta_sin_tecnico && int.alerta_stock) {
        recs.push({
          id: `rec-stock-${int.id}`,
          tipo: 'revisar',
          severidad: 'alta',
          titulo: 'Sin técnico ni stock',
          descripcion: `${int.so} (${formatEur(int.amount)}) no tiene técnico ni stock confirmado.`,
          accionTexto: `Revisar viabilidad de ${int.so} o reprogramar`,
          so: int.so,
          impacto: formatEur(int.amount),
          ownerSugerido: int.pmo
        });
      }
    });
    return recs;
  };

  const recomendaciones = diaSeleccionado === 'manana' ? generarRecomendaciones() : [];

  // Iniciar aplicación de recomendación (pide owner)
  const iniciarAplicarRec = (rec) => {
    setRecAplicando(rec);
    setRecOwner(rec.ownerSugerido || ownersCiudad[0]);
  };

  // Confirmar y crear acción desde recomendación
  const confirmarAplicarRec = () => {
    if (!recAplicando) return;
    const acc = {
      id: 'LOCAL-' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      texto: recAplicando.accionTexto,
      owner: recOwner,
      estado: 'pendiente',
      origen: 'recomendacion',
      so: recAplicando.so
    };
    setAcciones(prev => ({ ...prev, [ciudad]: [...prev[ciudad], acc] }));
    setRecAplicando(null);
  };

  // Rechazar recomendación (simplemente cerrar, no se guarda nada)
  const rechazarRec = () => {
    setRecAplicando(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.fondo, fontFamily: "'DM Sans', sans-serif", color: colors.texto }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: ${colors.blanco}; border-radius: 16px; box-shadow: 0 2px 8px rgba(26,83,101,0.08); }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .intervention-card { padding: 14px; border-radius: 10px; border-left: 4px solid; margin-bottom: 10px; background: white; }
        .action-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: 8px; margin-bottom: 6px; border-left: 3px solid; }
        .progress-bar { height: 10px; background: ${colors.gris}; border-radius: 5px; overflow: hidden; }
        .progress-fill { height: 100%; }
        input, select { padding: 10px 12px; border: 2px solid ${colors.gris}; border-radius: 8px; font-size: 13px; font-family: inherit; }
        input:focus, select:focus { outline: none; border-color: ${colors.azul}; }
        .amount { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: ${colors.verde}; background: rgba(22,163,74,0.1); padding: 3px 8px; border-radius: 5px; font-size: 12px; }
        .owner-chip { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; background: rgba(26,83,101,0.1); color: ${colors.azul}; }
        .estado-btn { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer; border: none; }
        .ayer-item { padding: 10px; border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
      `}</style>

      {/* Header */}
      <div style={{ background: colors.azul, padding: '16px 24px', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>Cool<span style={{ color: colors.naranja }}>fy</span></div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>Daily de Operaciones</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Botones ciudad */}
            {['madrid', 'barcelona'].map(c => (
              <button key={c} onClick={() => setCiudad(c)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.3)',
                  background: ciudad === c ? 'white' : 'transparent', color: ciudad === c ? colors.azul : 'white' }}>
                {c === 'madrid' ? '🏛️ Madrid' : '🏗️ Barcelona'}
              </button>
            ))}
            {/* Botón Iniciar/Finalizar Reunión */}
            {!reunionIniciada ? (
              <button onClick={iniciarReunion} style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', background: colors.verde, color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Flag /> Iniciar Reunión
              </button>
            ) : (
              <button onClick={finalizarReunion} disabled={guardando}
                style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', background: colors.naranja, color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Check /> {guardando ? 'Guardando...' : 'Finalizar Reunión'}
              </button>
            )}
          </div>
        </div>
        {reunionIniciada && (
          <div style={{ maxWidth: '1400px', margin: '8px auto 0', fontSize: '12px', opacity: 0.8 }}>
            ⏱️ Reunión iniciada: {reunionIniciada.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>
        
        {/* SEGUIMIENTO */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: accionesPendientes.length + accionesBloqueadas.length > 0 ? 'linear-gradient(135deg, rgba(234,179,8,0.05), rgba(234,179,8,0.12))' : 'linear-gradient(135deg, rgba(22,163,74,0.03), rgba(22,163,74,0.08))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mostrarSeguimiento ? '12px' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: colors.azul }}>📋 SEGUIMIENTO</span>
              {accionesPendientes.length > 0 && <span className="badge" style={{ background: `${colors.amarillo}20`, color: colors.amarillo }}>{accionesPendientes.length} pend</span>}
              {accionesBloqueadas.length > 0 && <span className="badge" style={{ background: `${colors.rojo}15`, color: colors.rojo }}>{accionesBloqueadas.length} bloq</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select value={filtroOwner} onChange={(e) => setFiltroOwner(e.target.value)} style={{ padding: '5px 8px', fontSize: '11px' }}>
                <option value="todos">Todos</option>
                {ownersCiudad.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <button onClick={() => setMostrarSeguimiento(!mostrarSeguimiento)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.azulSec }}>{mostrarSeguimiento ? '▲' : '▼'}</button>
            </div>
          </div>
          {mostrarSeguimiento && (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                <input type="text" placeholder="Nueva acción..." value={nuevaAccion} onChange={(e) => setNuevaAccion(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && agregarAccion()} style={{ flex: 1 }} />
                <select value={nuevoOwner} onChange={(e) => setNuevoOwner(e.target.value)} style={{ width: '140px' }}>
                  {ownersCiudad.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <button className="btn" onClick={agregarAccion} style={{ background: colors.azul, color: 'white', padding: '8px 12px' }}><Icons.Plus /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: colors.amarillo, marginBottom: '8px' }}>⏳ PENDIENTES</div>
                  {accionesFiltradas.filter(a => a.estado === 'pendiente').map(a => (
                    <div key={a.id} className="action-item" style={{ background: 'rgba(255,255,255,0.7)', borderLeftColor: colors.amarillo }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>{a.texto}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span className="owner-chip">{a.owner}</span>
                          {a.arrastradaDe && <span style={{ fontSize: '9px', color: colors.naranja }}>📅 desde {formatFecha(a.arrastradaDe)}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="estado-btn" style={{ background: `${colors.verde}20`, color: colors.verde }} onClick={() => cambiarEstado(a.id, 'hecho')}>✓</button>
                        <button className="estado-btn" style={{ background: `${colors.rojo}15`, color: colors.rojo }} onClick={() => cambiarEstado(a.id, 'bloqueado')}>⏸</button>
                      </div>
                    </div>
                  ))}
                  {accionesFiltradas.filter(a => a.estado === 'bloqueado').length > 0 && (
                    <>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: colors.rojo, margin: '12px 0 8px' }}>🚫 BLOQUEADAS</div>
                      {accionesFiltradas.filter(a => a.estado === 'bloqueado').map(a => (
                        <div key={a.id} className="action-item" style={{ background: 'rgba(220,38,38,0.05)', borderLeftColor: colors.rojo }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>{a.texto}</div>
                            {a.notas && <div style={{ fontSize: '10px', color: colors.rojo }}>📝 {a.notas}</div>}
                          </div>
                          <button className="estado-btn" style={{ background: `${colors.amarillo}20`, color: colors.amarillo }} onClick={() => cambiarEstado(a.id, 'pendiente')}>↩</button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: colors.verde, marginBottom: '8px' }}>✅ COMPLETADAS</div>
                  {accionesFiltradas.filter(a => a.estado === 'hecho').slice(0, 4).map(a => (
                    <div key={a.id} className="action-item" style={{ background: 'rgba(22,163,74,0.05)', borderLeftColor: colors.verde, opacity: 0.7 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', textDecoration: 'line-through', color: colors.textoSec }}>{a.texto}</div>
                        <span className="owner-chip">{a.owner}</span>
                      </div>
                      <button className="estado-btn" style={{ background: `${colors.rojo}10`, color: colors.rojo }} onClick={() => eliminarAccion(a.id)}><Icons.X /></button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* AYER */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: ayerPendientes.length > 0 ? 'linear-gradient(135deg, rgba(220,38,38,0.03), rgba(220,38,38,0.08))' : 'linear-gradient(135deg, rgba(22,163,74,0.03), rgba(22,163,74,0.08))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mostrarAyer ? '12px' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: colors.azul }}>📆 AYER - {data.ayer.dia_semana} {data.ayer.fecha}</span>
              {ayerPendientes.length > 0 && <span className="badge" style={{ background: `${colors.rojo}15`, color: colors.rojo }}>{ayerPendientes.length} no cerradas</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: colors.azul }}>{formatEur(amountAyer)}</span>
              <button onClick={() => setMostrarAyer(!mostrarAyer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.azulSec }}>{mostrarAyer ? '▲' : '▼'}</button>
            </div>
          </div>
          {mostrarAyer && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: colors.verde, marginBottom: '6px' }}>✅ CERRADAS ({ayerCerradas.length})</div>
                {ayerCerradas.map(i => (
                  <div key={i.id} className="ayer-item" style={{ background: 'rgba(22,163,74,0.05)', borderLeft: `3px solid ${colors.verde}` }}>
                    <div><span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: '600' }}>{i.so}</span> - {i.cliente}</div>
                    {!esIncidencia(i.tipo) && <span className="amount">{formatEur(i.amount)}</span>}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: colors.rojo, marginBottom: '6px' }}>⚠️ NO CERRADAS ({ayerPendientes.length})</div>
                {ayerPendientes.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: colors.verde, background: 'rgba(22,163,74,0.05)', borderRadius: '8px' }}>🎉 Todo OK</div>
                ) : ayerPendientes.map(i => (
                  <div key={i.id} className="ayer-item" style={{ background: 'rgba(220,38,38,0.05)', borderLeft: `3px solid ${colors.rojo}` }}>
                    <div><span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: '600' }}>{i.so}</span> - {i.cliente}</div>
                    <div style={{ textAlign: 'right' }}>
                      {!esIncidencia(i.tipo) && <div style={{ fontWeight: '600', color: colors.rojo }}>{formatEur(i.amount)}</div>}
                      <div style={{ fontSize: '9px', color: colors.rojo }}>{i.estado}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RECOMENDACIONES (solo MAÑANA, efímeras) */}
        {diaSeleccionado === 'manana' && recomendaciones.length > 0 && (
          <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: `1px solid ${colors.amarillo}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <span style={{ fontWeight: '600', color: colors.azul }}>Recomendaciones para MAÑANA</span>
              <span style={{ fontSize: '11px', color: colors.textoSec }}>({recomendaciones.length} sugerencias)</span>
            </div>
            {recomendaciones.slice(0, 5).map(rec => (
              <div key={rec.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${rec.severidad === 'alta' ? colors.rojo : colors.amarillo}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{rec.titulo}</span>
                      <span className="badge" style={{ background: `${rec.severidad === 'alta' ? colors.rojo : colors.amarillo}20`, color: rec.severidad === 'alta' ? colors.rojo : colors.amarillo }}>{rec.severidad}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textoSec, marginBottom: '6px' }}>{rec.descripcion}</div>
                    <div style={{ fontSize: '11px', color: colors.verde, fontWeight: '500' }}>💰 Impacto: {rec.impacto}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => iniciarAplicarRec(rec)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: colors.verde, color: 'white', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>
                      ✓ Crear acción
                    </button>
                    <button style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${colors.gris}`, background: 'white', color: colors.textoSec, fontSize: '11px', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: '10px', color: colors.textoSec, marginTop: '8px', fontStyle: 'italic' }}>
              💡 Las recomendaciones son sugerencias. Solo se guardan si creas una acción.
            </div>
          </div>
        )}

        {/* Modal confirmar owner para recomendación */}
        {recAplicando && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }}>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px', color: colors.azul }}>📋 Crear acción</div>
              <div style={{ padding: '12px', background: colors.fondo, borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{recAplicando.accionTexto}</div>
                {recAplicando.so && <div style={{ fontSize: '11px', color: colors.textoSec, marginTop: '4px' }}>SO: {recAplicando.so}</div>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textoSec, display: 'block', marginBottom: '6px' }}>Asignar a:</label>
                <select value={recOwner} onChange={(e) => setRecOwner(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `2px solid ${colors.gris}` }}>
                  {ownersCiudad.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={rechazarRec} style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${colors.gris}`, background: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
                <button onClick={confirmarAplicarRec} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: colors.verde, color: 'white', cursor: 'pointer', fontWeight: '600' }}>✓ Crear acción</button>
              </div>
            </div>
          </div>
        )}

        {/* Objetivo */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(26,83,101,0.03), rgba(26,83,101,0.08))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', color: colors.azul }}>📊 Objetivo {diaSeleccionado === 'hoy' ? 'HOY' : 'MAÑANA'}</span>
            <div>
              <span style={{ fontSize: '24px', fontWeight: '700', color: porcentaje >= 100 ? colors.verde : colors.azul }}>{formatEur(amountHoy)}</span>
              <span style={{ fontSize: '14px', color: colors.textoSec }}> / {formatEur(objetivo)}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(porcentaje, 100)}%`, background: porcentaje >= 100 ? colors.verde : porcentaje >= 70 ? colors.amarillo : colors.naranja }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: colors.textoSec }}>
            <span>{porcentaje}% {porcentaje >= 100 && '🎉'}</span>
            <span>{porcentaje >= 100 ? `+${formatEur(amountHoy - objetivo)}` : `Faltan ${formatEur(objetivo - amountHoy)}`}</span>
          </div>
        </div>

        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {['hoy', 'manana'].map(d => {
            const dat = d === 'hoy' ? datosHoy : datosManana;
            const met = dat.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
            const amt = dat.intervenciones.filter(i => !esIncidencia(i.tipo)).reduce((s, i) => s + (i.amount || 0), 0);
            const alertas = met.sin_tecnico + met.sin_stock + met.prioridad_alta;
            return (
              <div key={d} onClick={() => setDiaSeleccionado(d)} style={{ flex: 1, padding: '14px', borderRadius: '12px', cursor: 'pointer', border: diaSeleccionado === d ? `2px solid ${colors.azul}` : '2px solid transparent', background: diaSeleccionado === d ? 'white' : 'rgba(255,255,255,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: colors.azul }}>{d === 'hoy' ? 'HOY' : 'MAÑANA'}</div>
                    <div style={{ fontSize: '12px', color: colors.textoSec }}>{d === 'hoy' ? data.hoy.fecha : data.manana.fecha}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.verde }}>{formatEur(amt)}</div>
                    <div style={{ fontSize: '11px', color: alertas > 0 ? colors.rojo : colors.verde }}>{alertas > 0 ? `${alertas} alertas` : 'OK ✓'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[{ l: 'Total', v: met.total }, { l: 'Sin téc', v: met.sin_tecnico, c: colors.rojo }, { l: 'Stock', v: met.sin_stock, c: colors.naranja }].map(m => (
                    <div key={m.l} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', background: m.v > 0 && m.c ? `${m.c}10` : 'rgba(26,83,101,0.05)' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: m.v > 0 && m.c ? m.c : colors.azul }}>{m.v}</div>
                      <div style={{ fontSize: '9px', color: colors.textoSec }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Intervenciones */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: colors.azul }}>📋 Intervenciones {diaSeleccionado === 'hoy' ? 'HOY' : 'MAÑANA'}</span>
            <span style={{ fontSize: '12px', color: colors.textoSec }}>{datosActuales.intervenciones.length}</span>
          </div>
          {datosActuales.intervenciones.sort((a, b) => {
            const aS = (a.alerta_sin_tecnico ? 100 : 0) + (a.alerta_stock ? 50 : 0) + (a.alerta_prioridad ? 25 : 0);
            const bS = (b.alerta_sin_tecnico ? 100 : 0) + (b.alerta_stock ? 50 : 0) + (b.alerta_prioridad ? 25 : 0);
            return bS - aS;
          }).map(i => {
            const esInc = esIncidencia(i.tipo);
            const hasAlert = i.alerta_sin_tecnico || i.alerta_stock || i.alerta_prioridad;
            const borderColor = i.alerta_sin_tecnico ? colors.rojo : i.alerta_prioridad ? colors.amarillo : i.alerta_stock ? colors.naranja : esInc ? colors.naranja : colors.verde;
            return (
              <div key={i.id} className="intervention-card" style={{ borderLeftColor: borderColor }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: '600', color: colors.azul, background: `${colors.azul}10`, padding: '2px 6px', borderRadius: '4px' }}>{i.so}</span>
                    <span style={{ fontWeight: '600' }}>{i.cliente}</span>
                  </div>
                  {!esInc && <span className="amount">{formatEur(i.amount)}</span>}
                  {esInc && <span style={{ fontSize: '10px', color: colors.naranja, background: `${colors.naranja}15`, padding: '2px 8px', borderRadius: '4px' }}>🔧 Incidencia</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: colors.textoSec }}>{i.tipo}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {i.alerta_sin_tecnico && <span className="badge" style={{ background: `${colors.rojo}10`, color: colors.rojo }}>Sin téc</span>}
                    {i.alerta_stock && <span className="badge" style={{ background: `${colors.naranja}10`, color: colors.naranja }}>Stock</span>}
                    {i.alerta_prioridad && <span className="badge" style={{ background: `${colors.amarillo}10`, color: colors.amarillo }}>Prior</span>}
                    {!hasAlert && <span className="badge" style={{ background: `${colors.verde}10`, color: colors.verde }}>OK</span>}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: colors.textoSec, display: 'flex', gap: '12px' }}>
                  <span><Icons.Clock /> {i.hora}</span>
                  <span><Icons.User /> {i.tecnico}</span>
                  <span>PMO: {i.pmo}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
