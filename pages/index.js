import React, { useState, useEffect } from 'react';

// URL de la API de Google Apps Script (configurar después del deploy)
const API_URL = 'https://script.google.com/macros/s/AKfycbylnY8MrL0ZmVfmz4Dy1hz__GHWCeZqMsV66OsI75ix_mrvKqF1sC3q3qQ6q4_TP8s/exec';

// Coolfy Brand Colors
const colors = {
  fondoPrincipal: '#F2EFEC',
  azulEnfatico: '#1A5365',
  azulSecundario: '#658398',
  grisHueso: '#CAC9C9',
  naranja: '#CD7657',
  alertRojo: '#DC2626',
  alertNaranja: '#EA580C',
  alertAmarillo: '#CA8A04',
  alertVerde: '#16A34A',
  blanco: '#FFFFFF',
  textoOscuro: '#1A1A1A',
  textoSecundario: '#5A5A5A'
};

// Icons
const UserIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BoxIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const FireIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const PhoneIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const ClockIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MapPinIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const LightbulbIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;
const ArrowRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const SwapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const RefreshIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const LoaderIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;

export default function DailyOpsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const [ciudad, setCiudad] = useState('barcelona');
  const [diaSeleccionado, setDiaSeleccionado] = useState('hoy');
  const [pmoSeleccionado, setPmoSeleccionado] = useState(null);
  const [acciones, setAcciones] = useState([]);
  const [nuevaAccion, setNuevaAccion] = useState('');
  const [recomendacionesAplicadas, setRecomendacionesAplicadas] = useState([]);

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar datos');
      
      const jsonData = await response.json();
      setData(jsonData);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      // Cargar datos de ejemplo si falla
      setData(DATOS_EJEMPLO);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // Refrescar cada 5 minutos
    const interval = setInterval(cargarDatos, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div style={{ minHeight: '100vh', background: colors.fondoPrincipal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <LoaderIcon />
        <p style={{ color: colors.textoSecundario }}>Cargando datos...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: colors.fondoPrincipal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: colors.alertRojo }}>Error: {error}</p>
        <button onClick={cargarDatos} style={{ padding: '10px 20px', background: colors.azulEnfatico, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    );
  }

  const getDatos = (dia, city) => dia === 'hoy' 
    ? (city === 'madrid' ? data.hoy.madrid : data.hoy.barcelona)
    : (city === 'madrid' ? data.manana.madrid : data.manana.barcelona);

  const datosActuales = getDatos(diaSeleccionado, ciudad);
  const datosHoy = getDatos('hoy', ciudad);
  const datosManana = getDatos('manana', ciudad);
  const cualificadas = ciudad === 'madrid' ? data.cualificadas.madrid : data.cualificadas.barcelona;
  const tecnicos = ciudad === 'madrid' ? data.tecnicos.madrid : data.tecnicos.barcelona;

  const metricasHoy = datosHoy.metricas;
  const metricasManana = datosManana.metricas;
  const totalAlertasHoy = metricasHoy.sin_tecnico + metricasHoy.sin_stock + metricasHoy.prioridad_alta;
  const totalAlertasManana = metricasManana.sin_tecnico + metricasManana.sin_stock + metricasManana.prioridad_alta;

  // Buscar técnico compatible
  const buscarTecnicoCompatible = (tipoIntervencion) => {
    let especialidadRequerida = 'Split';
    if (tipoIntervencion.includes('Aerotermia')) especialidadRequerida = 'Aerotermia';
    else if (tipoIntervencion.includes('Conductos')) especialidadRequerida = 'Conductos';

    const horasPorTecnico = {};
    datosManana.intervenciones.forEach(int => {
      if (!horasPorTecnico[int.tecnico]) horasPorTecnico[int.tecnico] = 0;
      horasPorTecnico[int.tecnico] += int.duracion / 60;
    });

    return tecnicos.find(t => 
      t.especialidades.includes(especialidadRequerida) && 
      (horasPorTecnico[t.nombre] || 0) < 8
    );
  };

  // Generar recomendaciones
  const generarRecomendaciones = () => {
    const recomendaciones = [];
    const intervencionesManana = datosManana.intervenciones;

    intervencionesManana.forEach(int => {
      let tipoBase = 'splits';
      if (int.tipo.includes('Aerotermia')) tipoBase = 'aerotermia';
      else if (int.tipo.includes('Conductos')) tipoBase = 'conductos';

      if (int.alerta_sin_tecnico && int.alerta_stock) {
        if (cualificadas[tipoBase] && cualificadas[tipoBase].length > 0) {
          const alternativa = cualificadas[tipoBase][0];
          const tecnicoCompatible = buscarTecnicoCompatible(int.tipo);
          recomendaciones.push({
            id: `swap-${int.id}`,
            tipo: 'swap',
            severidad: 'alta',
            titulo: 'Cambiar intervención sin stock',
            problema: int,
            solucion: alternativa,
            descripcion: `${int.so} (${int.cliente}) no tiene stock (${int.pipeline}). Sustituir por instalación con material listo.`,
            accionTexto: `Cambiar ${int.so} por ${alternativa.so} (${alternativa.cliente}) - stock listo`,
            accionTexto2: tecnicoCompatible ? `Asignar ${tecnicoCompatible.nombre} a ${alternativa.so}` : null,
            impacto: 'Evita técnico parado por falta de material'
          });
        }
      } else if (int.alerta_sin_tecnico && !int.alerta_stock) {
        const tecnicoCompatible = buscarTecnicoCompatible(int.tipo);
        if (tecnicoCompatible) {
          recomendaciones.push({
            id: `asignar-${int.id}`,
            tipo: 'asignar',
            severidad: 'media',
            titulo: 'Asignar técnico especialista',
            problema: int,
            solucion: tecnicoCompatible,
            descripcion: `${int.so} (${int.cliente}) tiene stock pero no técnico. ${tecnicoCompatible.nombre} tiene experiencia en ${tecnicoCompatible.especialidades.join(', ')}.`,
            accionTexto: `Asignar ${tecnicoCompatible.nombre} a ${int.so} - ${int.cliente}`,
            impacto: `${tecnicoCompatible.completadas} instalaciones completadas`
          });
        }
      } else if (!int.alerta_sin_tecnico && int.alerta_stock) {
        if (cualificadas[tipoBase] && cualificadas[tipoBase].length > 0) {
          const alternativa = cualificadas[tipoBase][0];
          recomendaciones.push({
            id: `reasignar-${int.id}`,
            tipo: 'reasignar',
            severidad: 'media',
            titulo: 'Reasignar técnico a otra instalación',
            problema: int,
            solucion: alternativa,
            descripcion: `${int.tecnico} asignado a ${int.so} pero stock "${int.pipeline}". Mover a instalación con material.`,
            accionTexto: `Reasignar ${int.tecnico} de ${int.so} a ${alternativa.so}`,
            impacto: 'Aprovecha técnico disponible'
          });
        }
      }
    });

    return recomendaciones;
  };

  const recomendaciones = generarRecomendaciones();

  const aplicarRecomendacion = (rec) => {
    if (recomendacionesAplicadas.includes(rec.id)) return;
    setRecomendacionesAplicadas([...recomendacionesAplicadas, rec.id]);
    const nuevasAcciones = [{ id: Date.now(), texto: rec.accionTexto, completada: false, origen: 'recomendacion' }];
    if (rec.accionTexto2) {
      nuevasAcciones.push({ id: Date.now() + 1, texto: rec.accionTexto2, completada: false, origen: 'recomendacion' });
    }
    setAcciones([...acciones, ...nuevasAcciones]);
  };

  const calcularPMOs = (intervenciones) => {
    const pmosMap = {};
    intervenciones.forEach(int => {
      const pmo = int.pmo || 'Sin PMO asignado';
      if (!pmosMap[pmo]) pmosMap[pmo] = { nombre: pmo, intervenciones: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
      pmosMap[pmo].intervenciones++;
      if (int.alerta_sin_tecnico) pmosMap[pmo].sin_tecnico++;
      if (int.alerta_stock) pmosMap[pmo].sin_stock++;
      if (int.alerta_prioridad) pmosMap[pmo].prioridad_alta++;
    });
    return Object.values(pmosMap).sort((a, b) => (b.sin_tecnico + b.sin_stock) - (a.sin_tecnico + a.sin_stock));
  };

  const pmosDelDia = calcularPMOs(datosActuales.intervenciones);

  const intervencionesFiltradas = pmoSeleccionado 
    ? datosActuales.intervenciones.filter(i => i.pmo === pmoSeleccionado)
    : datosActuales.intervenciones;

  const sortedIntervenciones = [...intervencionesFiltradas].sort((a, b) => {
    const aScore = (a.alerta_sin_tecnico ? 100 : 0) + (a.alerta_prioridad ? 50 : 0) + (a.alerta_stock ? 25 : 0);
    const bScore = (b.alerta_sin_tecnico ? 100 : 0) + (b.alerta_prioridad ? 50 : 0) + (b.alerta_stock ? 25 : 0);
    return bScore - aScore || (a.hora || '').localeCompare(b.hora || '');
  });

  const agregarAccion = () => {
    if (nuevaAccion.trim()) {
      setAcciones([...acciones, { id: Date.now(), texto: nuevaAccion, completada: false }]);
      setNuevaAccion('');
    }
  };

  const toggleAccion = (id) => setAcciones(acciones.map(a => a.id === id ? { ...a, completada: !a.completada } : a));
  const eliminarAccion = (id) => setAcciones(acciones.filter(a => a.id !== id));

  return (
    <div style={{ minHeight: '100vh', background: colors.fondoPrincipal, fontFamily: "'DM Sans', -apple-system, sans-serif", color: colors.textoOscuro }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .card { background: ${colors.blanco}; border-radius: 16px; box-shadow: 0 2px 8px rgba(26,83,101,0.08); }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; font-size: 13px; }
        .btn-primary { background: ${colors.azulEnfatico}; color: white; }
        .btn-success { background: ${colors.alertVerde}; color: white; }
        .btn-ghost { background: transparent; border: none; color: ${colors.azulSecundario}; padding: 8px 12px; cursor: pointer; }
        .day-tab { padding: 16px 24px; border-radius: 12px; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; flex: 1; }
        .day-tab.active { border-color: ${colors.azulEnfatico}; background: white; box-shadow: 0 4px 12px rgba(26,83,101,0.1); }
        .intervention-card { padding: 16px; border-radius: 12px; border-left: 4px solid; margin-bottom: 12px; background: white; }
        .pmo-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 2px solid ${colors.grisHueso}; background: white; margin-right: 8px; margin-bottom: 8px; }
        .pmo-chip.selected { border-color: ${colors.azulEnfatico}; background: ${colors.azulEnfatico}; color: white; }
        .metric-box { padding: 12px 16px; border-radius: 10px; text-align: center; }
        .action-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; }
        .action-checkbox { width: 20px; height: 20px; border: 2px solid ${colors.grisHueso}; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .action-checkbox.checked { background: ${colors.alertVerde}; border-color: ${colors.alertVerde}; color: white; }
        .rec-card { border: 2px solid; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .rec-card.applied { opacity: 0.6; border-style: dashed; }
        input[type="text"] { width: 100%; padding: 12px 14px; border: 2px solid ${colors.grisHueso}; border-radius: 8px; font-size: 14px; font-family: inherit; }
        input[type="text"]:focus { outline: none; border-color: ${colors.azulEnfatico}; }
      `}</style>

      {/* Header */}
      <div style={{ background: colors.azulEnfatico, padding: '20px 32px', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>Cool<span style={{ color: colors.naranja }}>fy</span></div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.3)' }}/>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>Daily de Operaciones</div>
              <div style={{ fontSize: '13px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {lastUpdate && `Actualizado: ${lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                <button onClick={cargarDatos} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '11px' }}>
                  <RefreshIcon /> Refrescar
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setCiudad('madrid'); setPmoSeleccionado(null); }}
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.3)', fontSize: '14px',
                background: ciudad === 'madrid' ? 'white' : 'transparent', color: ciudad === 'madrid' ? colors.azulEnfatico : 'white' }}>
              🏛️ Madrid
            </button>
            <button onClick={() => { setCiudad('barcelona'); setPmoSeleccionado(null); }}
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.3)', fontSize: '14px',
                background: ciudad === 'barcelona' ? 'white' : 'transparent', color: ciudad === 'barcelona' ? colors.azulEnfatico : 'white' }}>
              🏗️ Barcelona
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px' }}>
        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <DayTab titulo="HOY" fecha={data.hoy.fecha} dia={data.hoy.dia_semana} metricas={metricasHoy} totalAlertas={totalAlertasHoy} isActive={diaSeleccionado === 'hoy'} onClick={() => { setDiaSeleccionado('hoy'); setPmoSeleccionado(null); }} />
          <DayTab titulo="MAÑANA" fecha={data.manana.fecha} dia={data.manana.dia_semana} metricas={metricasManana} totalAlertas={totalAlertasManana} isActive={diaSeleccionado === 'manana'} onClick={() => { setDiaSeleccionado('manana'); setPmoSeleccionado(null); }} />
        </div>

        {/* Recomendaciones */}
        {diaSeleccionado === 'manana' && recomendaciones.length > 0 && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: `2px solid ${colors.alertAmarillo}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: colors.alertAmarillo, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><LightbulbIcon /></div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>💡 Recomendaciones para MAÑANA</h3>
                <p style={{ fontSize: '13px', color: colors.textoSecundario, margin: 0 }}>{recomendaciones.length} optimizaciones detectadas</p>
              </div>
            </div>

            {recomendaciones.map(rec => {
              const isApplied = recomendacionesAplicadas.includes(rec.id);
              const borderColor = rec.severidad === 'alta' ? colors.alertRojo : colors.alertNaranja;
              return (
                <div key={rec.id} className={`rec-card ${isApplied ? 'applied' : ''}`} style={{ borderColor, background: isApplied ? '#f5f5f5' : 'rgba(255,255,255,0.8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {rec.tipo === 'swap' && <SwapIcon />}
                      {rec.tipo === 'asignar' && <UserIcon />}
                      <span style={{ fontWeight: '600' }}>{rec.titulo}</span>
                      <span className="badge" style={{ background: `${borderColor}20`, color: borderColor }}>{rec.severidad}</span>
                    </div>
                    {isApplied && <span className="badge" style={{ background: `${colors.alertVerde}20`, color: colors.alertVerde }}>✓ Añadida</span>}
                  </div>
                  <p style={{ fontSize: '13px', color: colors.textoSecundario, marginBottom: '12px' }}>{rec.descripcion}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: colors.alertRojo, fontWeight: '600' }}>PROBLEMA</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: colors.azulEnfatico }}>{rec.problema.so}</div>
                      <div style={{ fontSize: '12px' }}>{rec.problema.cliente}</div>
                    </div>
                    <ArrowRightIcon />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: colors.alertVerde, fontWeight: '600' }}>SOLUCIÓN</div>
                      {rec.tipo === 'asignar' ? (
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{rec.solucion.nombre}</div>
                      ) : (
                        <>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: colors.azulEnfatico }}>{rec.solucion.so}</div>
                          <div style={{ fontSize: '12px' }}>{rec.solucion.cliente}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: colors.azulSecundario }}>💡 {rec.impacto}</span>
                    {!isApplied && <button className="btn btn-success" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => aplicarRecomendacion(rec)}><CheckIcon /> Aplicar</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Main */}
          <div>
            {/* PMO Filter */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: colors.azulEnfatico }}>👥 Filtrar por PMO</h3>
                {pmoSeleccionado && <button className="btn-ghost" onClick={() => setPmoSeleccionado(null)}>Ver todos</button>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {pmosDelDia.map(pmo => {
                  const alertas = pmo.sin_tecnico + pmo.sin_stock;
                  const isSelected = pmoSeleccionado === pmo.nombre;
                  return (
                    <div key={pmo.nombre} className={`pmo-chip ${isSelected ? 'selected' : ''}`} onClick={() => setPmoSeleccionado(isSelected ? null : pmo.nombre)}>
                      <span>{pmo.nombre}</span>
                      <span style={{ background: isSelected ? 'rgba(255,255,255,0.2)' : (alertas > 0 ? `${colors.alertRojo}20` : `${colors.alertVerde}20`), color: isSelected ? 'white' : (alertas > 0 ? colors.alertRojo : colors.alertVerde), padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
                        {pmo.intervenciones} · {alertas > 0 ? `${alertas} ⚠️` : '✓'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intervenciones */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.azulEnfatico }}>
                  📋 Intervenciones {diaSeleccionado === 'hoy' ? 'HOY' : 'MAÑANA'}
                  {pmoSeleccionado && <span style={{ fontWeight: '400', color: colors.textoSecundario }}> · {pmoSeleccionado}</span>}
                </h3>
                <span style={{ fontSize: '13px', color: colors.textoSecundario }}>{sortedIntervenciones.length} intervenciones</span>
              </div>

              {sortedIntervenciones.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: colors.textoSecundario }}>No hay intervenciones</div>
              ) : (
                sortedIntervenciones.map(int => {
                  const hasAlerts = int.alerta_sin_tecnico || int.alerta_stock || int.alerta_prioridad;
                  const borderColor = int.alerta_sin_tecnico ? colors.alertRojo : int.alerta_prioridad ? colors.alertAmarillo : int.alerta_stock ? colors.alertNaranja : colors.alertVerde;
                  return (
                    <div key={int.id} className="intervention-card" style={{ borderLeftColor: borderColor }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '12px', fontWeight: '600', color: colors.azulEnfatico, background: `${colors.azulEnfatico}15`, padding: '2px 8px', borderRadius: '4px', marginRight: '10px' }}>{int.so}</span>
                          <span style={{ fontWeight: '600' }}>{int.cliente}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {int.alerta_sin_tecnico && <span className="badge" style={{ background: `${colors.alertRojo}15`, color: colors.alertRojo }}><UserIcon /> Sin técnico</span>}
                          {int.alerta_stock && <span className="badge" style={{ background: `${colors.alertNaranja}15`, color: colors.alertNaranja }}><BoxIcon /> Stock</span>}
                          {int.alerta_prioridad && <span className="badge" style={{ background: `${colors.alertAmarillo}15`, color: colors.alertAmarillo }}><FireIcon /> {int.prioridad}</span>}
                          {!hasAlerts && <span className="badge" style={{ background: `${colors.alertVerde}15`, color: colors.alertVerde }}><CheckIcon /> OK</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: colors.textoSecundario, marginBottom: '8px' }}>{int.tipo}</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: colors.textoSecundario }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ClockIcon /> {int.hora}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><UserIcon /> {int.tecnico}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><PhoneIcon /> {int.telefono}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: colors.azulSecundario, marginTop: '8px' }}>
                        <MapPinIcon /> {int.direccion} · PMO: {int.pmo}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textoSecundario, marginTop: '4px' }}>Pipeline: {int.pipeline}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Técnicos */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: colors.azulEnfatico }}>👷 Técnicos {ciudad === 'barcelona' ? 'Barcelona' : 'Madrid'}</h3>
              {(tecnicos || []).slice(0, 6).map(tec => (
                <div key={tec.nombre} style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '8px', background: 'rgba(26,83,101,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{tec.nombre}</span>
                    <span style={{ fontSize: '11px', color: colors.textoSecundario }}>{tec.completadas} trabajos</span>
                  </div>
                  <div style={{ fontSize: '11px', color: colors.azulSecundario, marginTop: '4px' }}>
                    {tec.especialidades.map(esp => (
                      <span key={esp} style={{ background: 'rgba(26,83,101,0.1)', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>{esp}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: colors.azulEnfatico }}>
                📝 Mis Acciones
                {acciones.filter(a => !a.completada).length > 0 && (
                  <span style={{ marginLeft: '8px', background: colors.naranja, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                    {acciones.filter(a => !a.completada).length}
                  </span>
                )}
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input type="text" placeholder="Añadir acción..." value={nuevaAccion} onChange={(e) => setNuevaAccion(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && agregarAccion()} />
                <button className="btn btn-primary" onClick={agregarAccion} style={{ padding: '10px 14px', background: colors.naranja }}><PlusIcon /></button>
              </div>
              {acciones.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: colors.textoSecundario, fontSize: '13px' }}>
                  Sin acciones. Aplica recomendaciones para añadir automáticamente.
                </div>
              ) : (
                acciones.map(a => (
                  <div key={a.id} className="action-item" style={{ background: a.origen === 'recomendacion' ? 'rgba(234,179,8,0.08)' : 'rgba(26,83,101,0.03)' }}>
                    <div className={`action-checkbox ${a.completada ? 'checked' : ''}`} onClick={() => toggleAccion(a.id)}>{a.completada && <CheckIcon />}</div>
                    <span style={{ flex: 1, fontSize: '13px', textDecoration: a.completada ? 'line-through' : 'none', color: a.completada ? colors.textoSecundario : colors.textoOscuro }}>{a.texto}</span>
                    <div style={{ cursor: 'pointer', color: colors.alertRojo, opacity: 0.5 }} onClick={() => eliminarAccion(a.id)}><XIcon /></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayTab({ titulo, fecha, dia, metricas, totalAlertas, isActive, onClick }) {
  const statusColor = totalAlertas === 0 ? colors.alertVerde : totalAlertas <= 3 ? colors.alertNaranja : colors.alertRojo;
  return (
    <div className={`day-tab ${isActive ? 'active' : ''}`} onClick={onClick} style={{ background: isActive ? colors.blanco : 'rgba(255,255,255,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CalendarIcon />
            <span style={{ fontSize: '16px', fontWeight: '700', color: colors.azulEnfatico }}>{titulo}</span>
          </div>
          <div style={{ fontSize: '13px', color: colors.textoSecundario }}>{dia} {fecha}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: `${statusColor}15` }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }}/>
          <span style={{ fontWeight: '600', fontSize: '12px', color: statusColor }}>{totalAlertas === 0 ? 'OK' : totalAlertas}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="metric-box" style={{ flex: 1, background: 'rgba(26,83,101,0.05)' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.azulEnfatico }}>{metricas.total}</div>
          <div style={{ fontSize: '10px', color: colors.textoSecundario }}>Total</div>
        </div>
        <div className="metric-box" style={{ flex: 1, background: metricas.sin_tecnico > 0 ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: metricas.sin_tecnico > 0 ? colors.alertRojo : colors.alertVerde }}>{metricas.sin_tecnico}</div>
          <div style={{ fontSize: '10px', color: colors.textoSecundario }}>Sin téc.</div>
        </div>
        <div className="metric-box" style={{ flex: 1, background: metricas.sin_stock > 0 ? 'rgba(234,88,12,0.08)' : 'rgba(22,163,74,0.08)' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: metricas.sin_stock > 0 ? colors.alertNaranja : colors.alertVerde }}>{metricas.sin_stock}</div>
          <div style={{ fontSize: '10px', color: colors.textoSecundario }}>Stock</div>
        </div>
        <div className="metric-box" style={{ flex: 1, background: metricas.prioridad_alta > 0 ? 'rgba(202,138,4,0.08)' : 'rgba(22,163,74,0.08)' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: metricas.prioridad_alta > 0 ? colors.alertAmarillo : colors.alertVerde }}>{metricas.prioridad_alta}</div>
          <div style={{ fontSize: '10px', color: colors.textoSecundario }}>Prior.</div>
        </div>
      </div>
    </div>
  );
}

// Datos de ejemplo para cuando no hay conexión
const DATOS_EJEMPLO = {
  generado: new Date().toISOString(),
  hoy: {
    fecha: "20/01/2026",
    dia_semana: "Martes",
    madrid: { intervenciones: [], metricas: { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 } },
    barcelona: { intervenciones: [], metricas: { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 } }
  },
  manana: {
    fecha: "21/01/2026",
    dia_semana: "Miércoles",
    madrid: { intervenciones: [], metricas: { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 } },
    barcelona: { intervenciones: [], metricas: { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 } }
  },
  cualificadas: { madrid: { splits: [], aerotermia: [] }, barcelona: { splits: [], aerotermia: [] } },
  tecnicos: { madrid: [], barcelona: [] }
};
