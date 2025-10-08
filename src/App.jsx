// EmpleaJoven — Demo Web (React)
// Versión sin menú de "Pruebas" visible en la interfaz (pero componente disponible para debugging).
// Comentarios válidos de JS: // o /* ... */. No uses '#'.
// Incluye: Explorar, Postulaciones (estados + historial con fechas), Microcredenciales, Perfil, Empresa y Pruebas internas.
// Persistencia en localStorage + pruebas automáticas. Filtros AND (texto + región + tipo).

import React, { useEffect, useMemo, useState } from "react";

// ------------------------------
// Utilidades de fecha y localStorage (ls)
// ------------------------------
const fmt = () => new Date().toLocaleString();
const LS_KEYS = {
  jobs: "ej_jobs",
  postulaciones: "ej_postulaciones",
  creds: "ej_credenciales",
  perfil: "ej_perfil",
  tab: "ej_tab",
  rol: "ej_rol",
};
const ls = {
  load(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  save(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

// ------------------------------
// Datos iniciales (constantes y seeds)
// ------------------------------
const REGIONES = ["Todas", "RM", "V", "VIII", "X"];
const TIPOS = ["Todas", "Práctica", "Part-time", "Voluntariado", "Full-time"];

const seedJobs = [
  {
    id: "J-001",
    titulo: "Práctica Desarrollador Frontend",
    empresa: "StartUp Verde",
    region: "RM",
    comuna: "Santiago",
    tipo: "Práctica",
    modalidad: "Híbrido",
    horas: "30 h/sem",
    requisitos: ["HTML/CSS", "JavaScript", "Trabajo en equipo"],
    descripcion:
      "Apoyo en desarrollo de landing pages y componentes UI. Mentoría de senior y posibilidad de continuidad.",
  },
  {
    id: "J-002",
    titulo: "Part-time Soporte TI (Fin de semana)",
    empresa: "RetailPlus",
    region: "RM",
    comuna: "Puente Alto",
    tipo: "Part-time",
    modalidad: "Presencial",
    horas: "16 h/sem",
    requisitos: ["Atención al cliente", "Diagnóstico básico", "Responsabilidad"],
    descripcion:
      "Soporte a usuarios en sala de ventas. Ideal para estudiantes en jornada diurna.",
  },
  {
    id: "J-003",
    titulo: "Voluntariado Alfabetización Digital",
    empresa: "Fundación Conecta",
    region: "V",
    comuna: "Valparaíso",
    tipo: "Voluntariado",
    modalidad: "Terreno",
    horas: "6 h/sem",
    requisitos: ["Paciencia", "Comunicación", "Ofimática básica"],
    descripcion:
      "Apoyo en talleres de uso de internet y herramientas básicas para adultos mayores.",
  },
  {
    id: "J-004",
    titulo: "Junior Data Analyst",
    empresa: "FinData",
    region: "RM",
    comuna: "Providencia",
    tipo: "Full-time",
    modalidad: "Remoto",
    horas: "40 h/sem",
    requisitos: ["Excel/Sheets", "SQL básico", "Pensamiento analítico"],
    descripcion:
      "Análisis de reportes y tableros. Programa de capacitación de 3 meses.",
  },
  // Casos adicionales para pruebas (más cobertura)
  {
    id: "J-005",
    titulo: "Práctica QA Tester",
    empresa: "TechQuality",
    region: "VIII",
    comuna: "Concepción",
    tipo: "Práctica",
    modalidad: "Presencial",
    horas: "20 h/sem",
    requisitos: ["Casos de prueba", "Detalle", "Responsabilidad"],
    descripcion: "Ejecución de pruebas manuales y reporte de bugs.",
  },
  {
    id: "J-006",
    titulo: "Voluntariado Tutorías Matemáticas",
    empresa: "Fundación Educa+",
    region: "X",
    comuna: "Puerto Montt",
    tipo: "Voluntariado",
    modalidad: "Terreno",
    horas: "4 h/sem",
    requisitos: ["Comunicación", "Álgebra básica"],
    descripcion: "Refuerzo escolar en liceos municipales.",
  },
];

const seedCreds = [
  { id: "C-001", nombre: "Trabajo en equipo", estado: "pendiente", desc: "Colabora y comparte responsabilidades." },
  { id: "C-002", nombre: "Comunicación efectiva", estado: "pendiente", desc: "Explica ideas con claridad." },
  { id: "C-003", nombre: "Pensamiento crítico", estado: "pendiente", desc: "Analiza problemas y propone soluciones." },
];

// ------------------------------
// Lógica de postulaciones (estados + historial)
// ------------------------------
const ESTADOS = ["En revisión", "Entrevista", "Oferta", "Rechazo"];
function actualizarEstado(postulacion, nuevoEstado, fechaForzada) {
  const fecha = fechaForzada || fmt();
  const hist = Array.isArray(postulacion.historial) ? postulacion.historial : [];
  return { ...postulacion, estado: nuevoEstado, historial: [...hist, { estado: nuevoEstado, fecha }] };
}

// ------------------------------
// Pruebas automáticas (mantener existentes y añadir más)
// ------------------------------
function runSelfTests() {
  const results = [];
  // Test 1: seedJobs es arreglo y con longitud >= 4
  results.push({ name: "seedJobs es arreglo con datos", pass: Array.isArray(seedJobs) && seedJobs.length >= 4, info: `len=${seedJobs.length}` });

  // Test 2: Cada job tiene campos requeridos
  const required = ["id", "titulo", "empresa", "region", "comuna", "tipo", "modalidad", "horas", "requisitos", "descripcion"];
  const allHaveFields = seedJobs.every((j) => required.every((k) => j[k] !== undefined && j[k] !== null && j[k] !== ""));
  results.push({ name: "Campos requeridos presentes", pass: allHaveFields });

  // Test 3: 'tipo' válido
  const tiposValidos = seedJobs.every((j) => ["Práctica", "Part-time", "Voluntariado", "Full-time"].includes(j.tipo));
  results.push({ name: "Tipos válidos", pass: tiposValidos });

  // Test 4: 'region' válida
  const regionesValidas = seedJobs.every((j) => REGIONES.includes(j.region) || ["RM", "V", "VIII", "X"].includes(j.region));
  results.push({ name: "Regiones válidas", pass: regionesValidas });

  // Test 5: requisitos es arreglo de strings
  const reqsValidos = seedJobs.every((j) => Array.isArray(j.requisitos) && j.requisitos.every((x) => typeof x === "string" && x.length > 0));
  results.push({ name: "Requisitos como array<string>", pass: reqsValidos });

  // Test 6: búsqueda (Data -> J-004)
  const dataMatch = seedJobs.some((j) => /data/i.test(j.titulo) && j.id === "J-004");
  results.push({ name: "Búsqueda 'Data' encuentra J-004", pass: dataMatch });

  // Test 7: insertar oferta simulado (al inicio)
  const sample = { id: "J-999", titulo: "Práctica UX", empresa: "Acme", region: "RM", comuna: "Ñuñoa", tipo: "Práctica", modalidad: "Híbrido", horas: "20 h/sem", requisitos: ["Figma"], descripcion: "Soporte a diseño." };
  const newList = [sample, ...seedJobs];
  const insertedFirst = newList[0].id === "J-999";
  results.push({ name: "Insertar oferta al inicio (simulado)", pass: insertedFirst });

  // Test 8: filtro AND (RM + Part-time) incluye J-002
  const filtroAND = seedJobs.filter((j) => j.region === "RM" && j.tipo === "Part-time").some((j) => j.id === "J-002");
  results.push({ name: "Filtro AND RM+Part-time encuentra J-002", pass: filtroAND });

  // Test 9: IDs únicos
  const ids = seedJobs.map((j) => j.id);
  const idsUnicos = ids.length === new Set(ids).size;
  results.push({ name: "IDs de ofertas son únicos", pass: idsUnicos });

  // Test 10: transición de estado con fecha fija
  const p0 = { id: "X", estado: "En revisión", historial: [] };
  const p1 = actualizarEstado(p0, "Entrevista", "2024-01-01 12:00");
  const t10 = p1.estado === "Entrevista" && p1.historial[p1.historial.length - 1].estado === "Entrevista" && p1.historial[p1.historial.length - 1].fecha === "2024-01-01 12:00";
  results.push({ name: "Transición a 'Entrevista' registra historial y fecha", pass: t10 });

  // Test 11: filtro AND con texto + región + tipo -> J-004
  const filtroTextoAND = (jobs, q, reg, tipo) => jobs.filter((j) => {
    const okQ = q ? (j.titulo + j.empresa + j.descripcion).toLowerCase().includes(q.toLowerCase()) : true;
    const okR = reg === "Todas" ? true : j.region === reg;
    const okT = tipo === "Todas" ? true : j.tipo === tipo;
    return okQ && okR && okT;
  });
  const res11 = filtroTextoAND(seedJobs, "data", "RM", "Full-time").some((j) => j.id === "J-004");
  results.push({ name: "Filtro AND texto+RM+Full-time encuentra J-004", pass: res11 });

  // Test 12 (nuevo): persistencia ls.save/ls.load ciclo básico
  const k = "__test_key__";
  ls.save(k, { a: 1 });
  const obj = ls.load(k, null);
  const ok = obj && obj.a === 1;
  ls.remove(k);
  results.push({ name: "Persistencia localStorage básica funciona", pass: ok });

  return results;
}

// ------------------------------
// UI helpers (sin dependencias externas)
// ------------------------------
const styles = {
  app: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", padding: 16, color: "#111827" },
  header: { display: "flex", gap: 8 },
  row: { display: "flex", alignItems: "center" },
  h1: { fontSize: 22, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  tabBtn: (active) => ({ padding: "8px 12px", borderRadius: 12, border: "1px solid #e5e7eb", background: active ? "#111827" : "#fff", color: active ? "#fff" : "#111827", cursor: "pointer" }),
  section: { marginTop: 16 },
  card: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, marginBottom: 12, background: "#fff" },
  badge: { background: "#111827", color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: 12 },
  badgeSoft: { background: "#e5e7eb", color: "#111827", padding: "2px 8px", borderRadius: 999, fontSize: 12 },
  pill: { background: "#f3f4f6", borderRadius: 999, padding: "4px 10px", fontSize: 12, marginRight: 6, marginBottom: 6, display: "inline-block" },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa", fontSize: 16, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 14px", borderRadius: 12, background: "#111827", color: "#fff", border: 0, cursor: "pointer", fontWeight: 700 },
  btnSecondary: { padding: "10px 14px", borderRadius: 12, background: "#eef2ff", color: "#111827", border: 0, cursor: "pointer", fontWeight: 600 },
  btnGhost: { padding: "10px 14px", borderRadius: 12, background: "transparent", color: "#6b7280", border: 0, cursor: "pointer", fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 },
  chip: (selected) => ({ padding: "6px 10px", borderRadius: 999, border: "1px solid #e5e7eb", background: selected ? "#111827" : "#fff", color: selected ? "#fff" : "#111827", cursor: "pointer" }),
  estadoBtns: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
  histItem: { fontSize: 12, color: "#6b7280" },
};

function Chip({ label, selected, onClick }) {
  return <button onClick={onClick} style={styles.chip(selected)}>{label}</button>;
}

function JobCard({ job, onApply, onDetails }) {
  return (
    <div style={styles.card}>
      <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{job.titulo}</div>
          <div style={{ color: "#374151", marginTop: 4 }}>{job.empresa} — {job.comuna}, {job.region}</div>
        </div>
        <span style={styles.badge}>{job.tipo}</span>
      </div>
      <div style={{ color: "#6b7280", marginTop: 4 }}>{job.modalidad} · {job.horas}</div>
      <div style={{ marginTop: 8 }}>{job.descripcion}</div>
      <div style={{ marginTop: 8 }}>
        {job.requisitos.map((r) => (
          <span key={r} style={styles.pill}>{r}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button style={styles.btn} onClick={onApply}>Postular</button>
        <button style={styles.btnSecondary} onClick={onDetails}>Detalles</button>
      </div>
    </div>
  );
}

// ------------------------------
// Pantallas (web)
// ------------------------------
function Explorar({ jobs, postulaciones, setPostulaciones }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Todas");
  const [tipo, setTipo] = useState("Todas");

  const resultados = useMemo(() => {
    return jobs.filter((j) => {
      const q = query.trim().toLowerCase();
      const okQuery = q ? (j.titulo + j.empresa + j.descripcion).toLowerCase().includes(q) : true;
      const okRegion = region === "Todas" ? true : j.region === region;
      const okTipo = tipo === "Todas" ? true : j.tipo === tipo;
      return okQuery && okRegion && okTipo; // AND
    });
  }, [jobs, query, region, tipo]);

  const aplicarAOferta = (oferta) => {
    if (postulaciones.find((p) => p.id === oferta.id)) return;
    const fecha = fmt();
    const nueva = { ...oferta, estado: "En revisión", fecha, historial: [{ estado: "En revisión", fecha }] };
    setPostulaciones([nueva, ...postulaciones]);
    alert("Postulación enviada. Revisa la pestaña Postulaciones.");
  };

  const verDetalles = (j) => {
    alert(`${j.titulo}\n\n${j.descripcion}\n\nRequisitos: ${j.requisitos.join(", ")}`);
  };

  return (
    <div>
      <h2 style={styles.h1}>Explorar</h2>
      <input style={styles.input} placeholder="Buscar por cargo, empresa o descripción" value={query} onChange={(e) => setQuery(e.target.value)} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {REGIONES.map((r) => (
          <Chip key={r} label={r} selected={region === r} onClick={() => setRegion(r)} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {TIPOS.map((t) => (
          <Chip key={t} label={t} selected={tipo === t} onClick={() => setTipo(t)} />
        ))}
      </div>

      <div style={styles.grid}>
        {resultados.map((j) => (
          <JobCard key={j.id} job={j} onApply={() => aplicarAOferta(j)} onDetails={() => verDetalles(j)} />
        ))}
      </div>
      {resultados.length === 0 && (
        <div style={{ color: "#6b7280" }}>No hay resultados con los filtros aplicados.</div>
      )}
    </div>
  );
}

function Postulaciones({ postulaciones, setPostulaciones }) {
  const cambiarEstado = (id, nuevo) => {
    setPostulaciones(postulaciones.map((p) => (p.id === id ? actualizarEstado(p, nuevo) : p)));
  };
  return (
    <div>
      <h2 style={styles.h1}>Postulaciones</h2>
      {postulaciones.length === 0 ? (
        <div style={{ color: "#6b7280" }}>Aún no has postulado. Explora ofertas para comenzar tu primera experiencia.</div>
      ) : (
        <div>
          {postulaciones.map((p) => (
            <div key={p.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700 }}>{p.titulo}</div>
                <span style={styles.badgeSoft}>{p.estado}</span>
              </div>
              <div style={{ color: "#374151", marginTop: 4 }}>{p.empresa} — {p.comuna}</div>
              <div style={{ color: "#6b7280", marginTop: 4 }}>Postulado: {p.fecha}</div>
              <div style={styles.estadoBtns}>
                {ESTADOS.map((e) => (
                  <button key={e} style={styles.btnSecondary} onClick={() => cambiarEstado(p.id, e)}>{e}</button>
                ))}
                <button style={styles.btnGhost} onClick={() => setPostulaciones(postulaciones.filter((x) => x.id !== p.id))}>Cancelar postulación</button>
              </div>
              {Array.isArray(p.historial) && p.historial.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Historial</div>
                  {p.historial.map((h, idx) => (
                    <div key={idx} style={styles.histItem}>• {h.estado} — {h.fecha}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Credenciales({ credenciales, setCredenciales }) {
  const obtener = (id) => {
    setCredenciales(credenciales.map((c) => (c.id === id ? { ...c, estado: "obtenida" } : c)));
  };
  return (
    <div>
      <h2 style={styles.h1}>Microcredenciales</h2>
      {credenciales.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>{c.nombre}</div>
            <span style={c.estado === "obtenida" ? styles.badge : styles.badgeSoft}>{c.estado === "obtenida" ? "Obtenida" : "Pendiente"}</span>
          </div>
          <div style={{ marginTop: 8 }}>{c.desc}</div>
          {c.estado !== "obtenida" && (
            <button style={{ ...styles.btn, marginTop: 8 }} onClick={() => obtener(c.id)}>Obtener</button>
          )}
        </div>
      ))}
    </div>
  );
}

function Perfil({ perfil, setPerfil }) {
  const [form, setForm] = useState(perfil);
  return (
    <div>
      <h2 style={styles.h1}>Perfil</h2>
      <label style={{ fontSize: 12, color: "#6b7280" }}>Nombre</label>
      <input style={styles.input} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      <label style={{ fontSize: 12, color: "#6b7280" }}>Email</label>
      <input style={styles.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label style={{ fontSize: 12, color: "#6b7280" }}>Carrera / Área</label>
      <input style={styles.input} value={form.carrera} onChange={(e) => setForm({ ...form, carrera: e.target.value })} />
      <label style={{ fontSize: 12, color: "#6b7280" }}>Comuna</label>
      <input style={styles.input} value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
      <button style={{ ...styles.btn, marginTop: 8 }} onClick={() => { setPerfil(form); alert("Perfil guardado"); }}>Guardar</button>
    </div>
  );
}

function Empresa({ jobs, setJobs }) {
  const [form, setForm] = useState({ titulo: "", empresa: "", region: "RM", comuna: "", tipo: "Práctica", modalidad: "Presencial", horas: "20 h/sem", requisitos: "", descripcion: "" });
  const publicar = () => {
    if (!form.titulo || !form.comuna || !form.descripcion) {
      alert("Completa título, comuna y descripción.");
      return;
    }
    const nueva = {
      id: `J-${(jobs.length + 1).toString().padStart(3, "0")}`,
      ...form,
      requisitos: form.requisitos.split(",").map((s) => s.trim()).filter(Boolean),
    };
    setJobs([nueva, ...jobs]);
    alert("Oferta publicada. Ya está visible en Explorar.");
    setForm({ titulo: "", empresa: "", region: "RM", comuna: "", tipo: "Práctica", modalidad: "Presencial", horas: "20 h/sem", requisitos: "", descripcion: "" });
  };
  return (
    <div>
      <h2 style={styles.h1}>Publicar (Empresa)</h2>
      <input style={styles.input} placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
      <input style={styles.input} placeholder="Empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
      <div style={{ display: "flex", gap: 10 }}>
        <input style={{ ...styles.input, flex: 1 }} placeholder="Región (RM, V, VIII...)" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        <input style={{ ...styles.input, flex: 1 }} placeholder="Comuna" value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input style={{ ...styles.input, flex: 1 }} placeholder="Tipo (Práctica/Part-time/...)" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
        <input style={{ ...styles.input, flex: 1 }} placeholder="Modalidad (Presencial/Remoto/Híbrido)" value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input style={{ ...styles.input, flex: 1 }} placeholder="Horas (20 h/sem)" value={form.horas} onChange={(e) => setForm({ ...form, horas: e.target.value })} />
        <input style={{ ...styles.input, flex: 1 }} placeholder="Requisitos (coma)" value={form.requisitos} onChange={(e) => setForm({ ...form, requisitos: e.target.value })} />
      </div>
      <textarea style={{ ...styles.input, height: 120 }} placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      <button style={{ ...styles.btn, marginTop: 4 }} onClick={publicar}>Publicar</button>
    </div>
  );
}

function Pruebas() {
  const [tests, setTests] = useState([]);
  useEffect(() => { setTests(runSelfTests()); }, []);
  const passCount = tests.filter((t) => t.pass).length;
  return (
    <div>
      <h2 style={styles.h1}>Pruebas automáticas</h2>
      <div style={{ color: "#6b7280", marginBottom: 12 }}>Validaciones del seed, filtros y persistencia. {passCount}/{tests.length} OK.</div>
      {tests.map((t, i) => (
        <div key={i} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700 }}>{t.name}</div>
            <span style={t.pass ? styles.badge : styles.badgeSoft}>{t.pass ? "OK" : "FALLA"}</span>
          </div>
          {t.info ? <div style={{ color: "#6b7280", marginTop: 4 }}>{t.info}</div> : null}
        </div>
      ))}
    </div>
  );
}

// ------------------------------
// App
// ------------------------------
export default function App() {
  const initialTabRaw = ls.load(LS_KEYS.tab, "Explorar");
  const safeInitialTab = initialTabRaw === "Pruebas" ? "Explorar" : initialTabRaw; // evita quedar "atrapado" en Pruebas al ocultar el botón

  const [rol, setRol] = useState(() => ls.load(LS_KEYS.rol, "Joven"));
  const [tab, setTab] = useState(() => safeInitialTab);
  const [jobs, setJobs] = useState(() => ls.load(LS_KEYS.jobs, seedJobs));
  const [postulaciones, setPostulaciones] = useState(() => ls.load(LS_KEYS.postulaciones, []));
  const [credenciales, setCredenciales] = useState(() => ls.load(LS_KEYS.creds, seedCreds));
  const [perfil, setPerfil] = useState(() => ls.load(LS_KEYS.perfil, { nombre: "Daniela Soto", email: "daniela@example.com", carrera: "Ingeniería Informática", comuna: "Santiago" }));

  // Persistencia
  useEffect(() => { ls.save(LS_KEYS.jobs, jobs); }, [jobs]);
  useEffect(() => { ls.save(LS_KEYS.postulaciones, postulaciones); }, [postulaciones]);
  useEffect(() => { ls.save(LS_KEYS.creds, credenciales); }, [credenciales]);
  useEffect(() => { ls.save(LS_KEYS.perfil, perfil); }, [perfil]);
  useEffect(() => { ls.save(LS_KEYS.tab, tab); }, [tab]);
  useEffect(() => { ls.save(LS_KEYS.rol, rol); }, [rol]);

  const resetDatos = () => {
    if (window.confirm("¿Restablecer datos locales? (jobs, postulaciones, credenciales, perfil)")) {
      setJobs(seedJobs);
      setPostulaciones([]);
      setCredenciales(seedCreds);
      setPerfil({ nombre: "Daniela Soto", email: "daniela@example.com", carrera: "Ingeniería Informática", comuna: "Santiago" });
      Object.values(LS_KEYS).forEach((k) => ls.remove(k));
      alert("Datos restablecidos.");
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#111827", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>EJ</div>
          <div>
            <h1 style={styles.h1}>EmpleaJoven — Demo funcional (Web)</h1>
            <div style={styles.sub}>Inserción laboral temprana para estudiantes y egresados en Chile</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={styles.tabBtn(tab === "Explorar")} onClick={() => setTab("Explorar")}>Explorar</button>
          <button style={styles.tabBtn(tab === "Postulaciones")} onClick={() => setTab("Postulaciones")}>Postulaciones</button>
          <button style={styles.tabBtn(tab === "Credenciales")} onClick={() => setTab("Credenciales")}>Microcredenciales</button>
          <button style={styles.tabBtn(tab === "Perfil")} onClick={() => setTab("Perfil")}>Perfil</button>
          <button style={styles.tabBtn(tab === "Empresa")} onClick={() => setTab("Empresa")}>Publicar (Empresa)</button>
          {/* Botón de Pruebas oculto para usuarios finales */}
          <button style={{ ...styles.tabBtn(false), background: "#eef2ff", color: "#111827" }} onClick={() => setRol(rol === "Joven" ? "Empresa" : "Joven")}>{rol}</button>
          <button style={{ ...styles.tabBtn(false), background: "#fff", borderStyle: "dashed" }} onClick={resetDatos}>Reset datos</button>
        </div>
      </header>

      <main style={styles.section}>
        {tab === "Explorar" && <Explorar jobs={jobs} postulaciones={postulaciones} setPostulaciones={setPostulaciones} />}
        {tab === "Postulaciones" && <Postulaciones postulaciones={postulaciones} setPostulaciones={setPostulaciones} />}
        {tab === "Credenciales" && <Credenciales credenciales={credenciales} setCredenciales={setCredenciales} />}
        {tab === "Perfil" && <Perfil perfil={perfil} setPerfil={setPerfil} />}
        {tab === "Empresa" && <Empresa jobs={jobs} setJobs={setJobs} />}
        {/* Si alguna vez necesitas ver Pruebas manualmente, setTab("Pruebas") desde consola del navegador */}
        {tab === "Pruebas" && <Pruebas />}
      </main>

      <footer style={{ marginTop: 12, color: "#9ca3af", fontSize: 12, textAlign: "center" }}>
        Demo PMV — EmpleaJoven · React Web (sin dependencias externas) · Estado en memoria + localStorage
      </footer>
    </div>
  );
}
