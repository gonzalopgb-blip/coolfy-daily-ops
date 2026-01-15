import React, { useState, useEffect } from 'react';

// ⚠️ CAMBIAR POR TU URL REAL
const API_URL = 'https://script.google.com/macros/s/AKfycbzUNdSwoU5_SZukJKp0pBVeh_yDyH21cyXmueCmS_CeBt0n8m7A89Y5bz69ReTPzw/exec';

const colors = {
  fondo: '#F2EFEC', azul: '#1A5365', azulSec: '#658398', gris: '#CAC9C9',
  naranja: '#CD7657', rojo: '#DC2626', amarillo: '#CA8A04', verde: '#16A34A',
  blanco: '#FFFFFF', texto: '#1A1A1A', textoSec: '#5A5A5A'
};

const formatEur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n || 0);

export default function DailyOpsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ciudad, setCiudad] = useState('barcelona');
  const [diaSeleccionado, setDiaSeleccionado] = useState('hoy');
  const [acciones, setAcciones] = useState([]);
  const [nuevaAccion, setNuevaAccion] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cargar datos de la API
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  // Limpiar acciones al cambiar de ciudad
  useEffect(() => { setAcciones([]); }, [ciudad]);

  const getDatos = (dia) => {
    if (!data) return { intervenciones: [], metricas: { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 } };
    const d = dia === 'hoy' ? data.hoy : data.manana;
    return ciudad === 'madrid' ? d?.madrid : d?.barcelona;
  };

  const datosHoy = getDatos('hoy');
  const datosManana = getDatos('manana');
  const datosActuales = getDatos(diaSeleccionado);
  const tecnicos = data?.tecnicos?.[ciudad] || [];

  const metricas = datosActuales?.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
  const intervenciones = datosActuales?.intervenciones || [];

  // Gestión de acciones (solo local)
  const agregarAccion = () => {
    if (!nuevaAccion.trim()) return;
    setAcciones([...acciones, { id: Date.now(), texto: nuevaAccion.trim(), completada: false }]);
    setNuevaAccion('');
  };

  const toggleAccion = (id) => {
    setAcciones(acciones.map(a => a.id === id ? { ...a, completada: !a.completada } : a));
  };

  const eliminarAccion = (id) => {
    setAcciones(acciones.filter(a => a.id !== id));
  };

  // GENERAR PDF para una ciudad específica
  const generarPDFCiudad = (ciudadPDF) => {
    const datosCiudad = diaSeleccionado === 'hoy' 
      ? data?.hoy?.[ciudadPDF] 
      : data?.manana?.[ciudadPDF];
    
    const intervencionesPDF = datosCiudad?.intervenciones || [];
    const metricasPDF = datosCiudad?.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
    
    const fecha = diaSeleccionado === 'hoy' ? data?.hoy?.fecha : data?.manana?.fecha;
    const fechaFile = (fecha || '').replace(/\//g, '-');
    const ciudadUpper = ciudadPDF.charAt(0).toUpperCase() + ciudadPDF.slice(1);
    const diaSemana = diaSeleccionado === 'hoy' ? data?.hoy?.dia_semana : data?.manana?.dia_semana;
    const nombrePDF = `Puntos de Accion_Daily_${ciudadUpper}_${fechaFile}`;
    
    const alertas = intervencionesPDF.filter(i => i.alerta_sin_tecnico || i.alerta_stock || i.alerta_prioridad);
    const sinProblemas = intervencionesPDF.filter(i => !i.alerta_sin_tecnico && !i.alerta_stock && !i.alerta_prioridad);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${nombrePDF}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1A1A1A; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1A5365; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #1A5365; }
    .logo span { color: #CD7657; }
    .fecha { text-align: right; }
    .fecha-dia { font-size: 18px; font-weight: bold; color: #1A5365; }
    .fecha-fecha { font-size: 14px; color: #5A5A5A; }
    .ciudad { display: inline-block; background: #1A5365; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; margin-top: 4px; }
    
    .metricas { display: flex; gap: 15px; margin-bottom: 30px; }
    .metrica { flex: 1; padding: 15px; border-radius: 8px; text-align: center; }
    .metrica-valor { font-size: 28px; font-weight: bold; }
    .metrica-label { font-size: 11px; color: #5A5A5A; margin-top: 4px; }
    .metrica-total { background: #f0f7f9; }
    .metrica-total .metrica-valor { color: #1A5365; }
    .metrica-alerta { background: #fef2f2; }
    .metrica-alerta .metrica-valor { color: #DC2626; }
    .metrica-ok { background: #f0fdf4; }
    .metrica-ok .metrica-valor { color: #16A34A; }
    
    h2 { font-size: 16px; color: #1A5365; margin: 25px 0 15px; padding-bottom: 8px; border-bottom: 1px solid #CAC9C9; }
    
    .intervencion { padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid; background: #fafafa; }
    .intervencion-ok { border-left-color: #16A34A; }
    .intervencion-alerta { border-left-color: #DC2626; background: #fef8f8; }
    .int-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .int-so { font-weight: bold; color: #1A5365; background: #e8f4f8; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
    .int-cliente { font-weight: 600; }
    .int-tipo { color: #5A5A5A; font-size: 11px; }
    .int-detalles { display: flex; gap: 20px; font-size: 11px; color: #5A5A5A; margin-top: 6px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-left: 8px; }
    .badge-rojo { background: #fee2e2; color: #DC2626; }
    .badge-amarillo { background: #fef3c7; color: #CA8A04; }
    .badge-naranja { background: #ffedd5; color: #EA580C; }
    
    .acciones { margin-top: 30px; }
    .accion { padding: 10px 15px; margin-bottom: 8px; border-radius: 6px; background: #fffbeb; border-left: 4px solid #CA8A04; }
    .accion-completada { background: #f0fdf4; border-left-color: #16A34A; text-decoration: line-through; color: #5A5A5A; }
    
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #CAC9C9; font-size: 10px; color: #5A5A5A; text-align: center; }
    
    .no-alertas { padding: 20px; text-align: center; background: #f0fdf4; border-radius: 8px; color: #16A34A; font-weight: 600; }
    
    @media print {
      body { padding: 20px; }
      .intervencion { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Cool<span>fy</span></div>
      <div style="font-size: 14px; color: #5A5A5A; margin-top: 4px;">Puntos de Acción - Daily</div>
      <div class="ciudad">${ciudadUpper.toUpperCase()}</div>
    </div>
    <div class="fecha">
      <div class="fecha-dia">${diaSemana}</div>
      <div class="fecha-fecha">${fecha}</div>
    </div>
  </div>

  <div class="metricas">
    <div class="metrica metrica-total">
      <div class="metrica-valor">${metricasPDF.total}</div>
      <div class="metrica-label">INTERVENCIONES</div>
    </div>
    <div class="metrica ${metricasPDF.sin_tecnico > 0 ? 'metrica-alerta' : 'metrica-ok'}">
      <div class="metrica-valor">${metricasPDF.sin_tecnico}</div>
      <div class="metrica-label">SIN TÉCNICO</div>
    </div>
    <div class="metrica ${metricasPDF.sin_stock > 0 ? 'metrica-alerta' : 'metrica-ok'}">
      <div class="metrica-valor">${metricasPDF.sin_stock}</div>
      <div class="metrica-label">SIN STOCK</div>
    </div>
    <div class="metrica ${metricasPDF.prioridad_alta > 0 ? 'metrica-alerta' : 'metrica-ok'}">
      <div class="metrica-valor">${metricasPDF.prioridad_alta}</div>
      <div class="metrica-label">PRIORIDAD ALTA</div>
    </div>
  </div>

  ${alertas.length > 0 ? `
  <h2>⚠️ INTERVENCIONES CON ALERTAS (${alertas.length})</h2>
  ${alertas.map(i => `
    <div class="intervencion intervencion-alerta">
      <div class="int-header">
        <div>
          <span class="int-so">${i.so}</span>
          <span class="int-cliente">${i.cliente}</span>
          ${i.alerta_sin_tecnico ? '<span class="badge badge-rojo">SIN TÉCNICO</span>' : ''}
          ${i.alerta_stock ? '<span class="badge badge-naranja">SIN STOCK</span>' : ''}
          ${i.alerta_prioridad ? '<span class="badge badge-amarillo">PRIORIDAD</span>' : ''}
        </div>
      </div>
      <div class="int-tipo">${i.tipo}</div>
      <div class="int-detalles">
        <span>🕐 ${i.hora || '-'}</span>
        <span>👤 ${i.tecnico || 'Sin asignar'}</span>
        <span>📍 ${i.pmo || '-'}</span>
      </div>
    </div>
  `).join('')}
  ` : '<div class="no-alertas">✅ No hay intervenciones con alertas</div>'}

  ${sinProblemas.length > 0 ? `
  <h2>✅ INTERVENCIONES OK (${sinProblemas.length})</h2>
  ${sinProblemas.map(i => `
    <div class="intervencion intervencion-ok">
      <div class="int-header">
        <div>
          <span class="int-so">${i.so}</span>
          <span class="int-cliente">${i.cliente}</span>
        </div>
      </div>
      <div class="int-tipo">${i.tipo}</div>
      <div class="int-detalles">
        <span>🕐 ${i.hora || '-'}</span>
        <span>👤 ${i.tecnico || '-'}</span>
        <span>📍 ${i.pmo || '-'}</span>
      </div>
    </div>
  `).join('')}
  ` : ''}

  ${acciones.length > 0 ? `
  <h2>📋 ACCIONES A TOMAR (${acciones.length})</h2>
  ${acciones.map(a => `
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

    // Abrir en nueva ventana para imprimir/guardar
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

  return (
    <div style={{ minHeight: '100vh', background: colors.fondo, fontFamily: "'DM Sans', sans-serif", color: colors.texto }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: ${colors.blanco}; border-radius: 12px; box-shadow: 0 2px 8px rgba(26,83,101,0.08); }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; }
        .intervention-card { padding: 14px; border-radius: 10px; border-left: 4px solid; margin-bottom: 10px; background: white; }
        input { padding: 10px 12px; border: 2px solid ${colors.gris}; border-radius: 8px; font-size: 13px; font-family: inherit; width: 100%; }
        input:focus { outline: none; border-color: ${colors.azul}; }
      `}</style>

      {/* Header */}
      <div style={{ background: colors.azul, padding: '16px 24px', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>Cool<span style={{ color: colors.naranja }}>fy</span></div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Daily de Operaciones</div>
            {lastUpdate && (
              <div style={{ fontSize: '11px', opacity: 0.6 }}>
                Actualizado: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
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
            <button onClick={cargarDatos} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer' }}>
              🔄
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {['hoy', 'manana'].map(d => {
            const dat = d === 'hoy' ? datosHoy : datosManana;
            const met = dat?.metricas || { total: 0, sin_tecnico: 0, sin_stock: 0, prioridad_alta: 0 };
            const fecha = d === 'hoy' ? data?.hoy?.fecha : data?.manana?.fecha;
            const alertas = met.sin_tecnico + met.sin_stock + met.prioridad_alta;
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
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: alertas > 0 ? colors.rojo : colors.verde }}/>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { l: 'Total', v: met.total, c: colors.azul },
                    { l: 'Sin téc', v: met.sin_tecnico, c: met.sin_tecnico > 0 ? colors.rojo : colors.verde },
                    { l: 'Stock', v: met.sin_stock, c: met.sin_stock > 0 ? colors.naranja : colors.verde }
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
              <span style={{ fontSize: '12px', color: colors.textoSec }}>{intervenciones.length} total</span>
            </div>

            {intervenciones.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: colors.textoSec }}>No hay intervenciones</div>
            ) : (
              intervenciones.sort((a, b) => {
                const aS = (a.alerta_sin_tecnico ? 100 : 0) + (a.alerta_stock ? 50 : 0) + (a.alerta_prioridad ? 25 : 0);
                const bS = (b.alerta_sin_tecnico ? 100 : 0) + (b.alerta_stock ? 50 : 0) + (b.alerta_prioridad ? 25 : 0);
                return bS - aS;
              }).map(i => {
                const hasAlert = i.alerta_sin_tecnico || i.alerta_stock || i.alerta_prioridad;
                const borderColor = i.alerta_sin_tecnico ? colors.rojo : i.alerta_prioridad ? colors.amarillo : i.alerta_stock ? colors.naranja : colors.verde;
                return (
                  <div key={i.id || i.so} className="intervention-card" style={{ borderLeftColor: borderColor }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: colors.azul, background: `${colors.azul}15`, padding: '2px 8px', borderRadius: '4px' }}>{i.so}</span>
                        <span style={{ fontWeight: '600' }}>{i.cliente}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {i.alerta_sin_tecnico && <span className="badge" style={{ background: `${colors.rojo}15`, color: colors.rojo }}>Sin téc</span>}
                        {i.alerta_stock && <span className="badge" style={{ background: `${colors.naranja}15`, color: colors.naranja }}>Stock</span>}
                        {i.alerta_prioridad && <span className="badge" style={{ background: `${colors.amarillo}15`, color: colors.amarillo }}>Prioridad</span>}
                        {!hasAlert && <span className="badge" style={{ background: `${colors.verde}15`, color: colors.verde }}>OK</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textoSec, marginBottom: '4px' }}>{i.tipo}</div>
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
              {tecnicos.slice(0, 5).map(t => (
                <div key={t.nombre} style={{ padding: '8px 10px', borderRadius: '6px', marginBottom: '6px', background: `${colors.azul}05` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{t.nombre}</span>
                    <span style={{ fontSize: '11px', color: colors.textoSec }}>{t.completadas} trabajos</span>
                  </div>
                  <div style={{ fontSize: '10px', color: colors.azulSec, marginTop: '2px' }}>
                    {(t.especialidades || []).join(', ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.azul }}>📝 Acciones a tomar</h3>
              
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

              {acciones.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: colors.textoSec, fontSize: '12px', background: `${colors.gris}20`, borderRadius: '8px' }}>
                  Añade acciones durante la reunión
                </div>
              ) : (
                acciones.map(a => (
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
                style={{ flex: 1, background: colors.azul, color: 'white', padding: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                📄 PDF Madrid
              </button>
              <button 
                onClick={() => generarPDFCiudad('barcelona')} 
                className="btn" 
                style={{ flex: 1, background: colors.naranja, color: 'white', padding: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
