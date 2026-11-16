import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { animalQr } from './animal-qr.js';
import { ReportForm, ReportInbox, PrivateReportReply } from './reports.jsx';
import { AdoptionGallery, AdoptionManagement } from './adoptions.jsx';
import { Landing } from './landing.jsx';
import { LanguageSelect, LocaleProvider, useLocale } from './locale.jsx';
import { Shell, roleBadgeLabel } from './shell.jsx';
import { UserManagement } from './users.jsx';
import { TerritoryFields } from './territory.jsx';
import { REGISTRO_DATA_URI as registrationImage } from './logo-data.js';
import { PawSplash, PawCircle, splashNotifier } from './splash.jsx';
import './style.css';

let csrfToken = null;
let territoryCache = null;
let requestQueue = Promise.resolve();

async function rawFetchApi(path, fetchOptions, language) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(`/api/${path}`, {
        ...fetchOptions,
        headers: { 'Accept-Language': language, ...fetchOptions.headers },
        cache: path === 'distritos' ? 'default' : 'no-store',
      });
    } catch (err) {
      lastError = err;
      if (fetchOptions.method && fetchOptions.method !== 'GET' && attempt > 0) break;
      await new Promise((resolve) => setTimeout(resolve, 180 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function performApiCall(path, fetchOptions) {
  const language = localStorage.getItem('tortuguero-huellas-language') || localStorage.getItem('vitalink-language') || 'es-CR';
  splashNotifier.startRequest();
  const task = requestQueue.then(
    () => rawFetchApi(path, fetchOptions, language),
    () => rawFetchApi(path, fetchOptions, language)
  );
  requestQueue = task.catch(() => {});
  try {
    const response = await task;
    const rotatedCsrf = response.headers.get('x-csrf-token');
    if (rotatedCsrf) csrfToken = rotatedCsrf;
    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json() : null;
    if (data?.csrf) csrfToken = data.csrf;
    if (!response.ok) {
      const error = new Error(data?.message ?? 'No pudimos completar la solicitud.');
      error.field = data?.field;
      throw error;
    }
    return data;
  } finally {
    splashNotifier.endRequest();
  }
}

async function api(path, options = {}) {
  if (path === 'distritos' && (!options.method || options.method === 'GET')) {
    if (!territoryCache) {
      territoryCache = performApiCall('distritos', { ...options, method: 'GET' }).catch((error) => {
        territoryCache = null;
        throw error;
      });
    }
    return territoryCache;
  }
  return performApiCall(path, options);
}

async function submit(path, body) {
  if (!csrfToken) {
    const { csrf } = await api('sesion');
    csrfToken = csrf;
  }
  const headers = { 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' };
  if (typeof body === 'string') headers['Content-Type'] = 'application/json';
  return api(path, { method: 'POST', headers, body });
}

function ConfirmDialog({ prompt, onConfirm, onCancel }) {
  const { say } = useLocale();
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => { if (element.open) element.close(); };
  }, []);

  return <dialog ref={dialog} className="vl-confirm-modal" aria-labelledby="vl-confirm-title" onClose={onCancel}
    onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <div className="panel vl-sneat-card grid gap-4">
      <h2 id="vl-confirm-title">{say('Confirmar acción', 'Confirm action', 'Aktion bestätigen')}</h2>
      <p>{prompt}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="secondary" onClick={onCancel}>{say('Cancelar', 'Cancel', 'Abbrechen')}</button>
        <button type="button" onClick={onConfirm}>{say('Confirmar', 'Confirm', 'Bestätigen')}</button>
      </div>
    </div>
  </dialog>;
}

function App({ code, reportKind, adoptionPath, replyToken }) {
  const { say, language } = useLocale();
  const [session, setSession] = useState(undefined);
  const [signUp, setSignUp] = useState(() => new URLSearchParams(location.search).has('registro'));
  const [activeView, setActiveView] = useState(() =>
    new URLSearchParams(location.search).has('registrar-animal') ? 'crear-registro' : 'dashboard'
  );
  const [districts, setDistricts] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [locationCatalog, setLocationCatalog] = useState({ provinces: [], cantons: [], districts: [] });
  const [locationFormKey, setLocationFormKey] = useState(0);
  const [censusQuery, setCensusQuery] = useState('?canton_id=101');
  const [animals, setAnimals] = useState([]);
  const [animalSearch, setAnimalSearch] = useState('');
  const [profile, setProfile] = useState(null);
  const [created, setCreated] = useState(null);
  const [editing, setEditing] = useState(null);
  const [qr, setQr] = useState(null);
  const [archived, setArchived] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const manager = ['superusuario', 'administrador'].includes(session?.role);
  const canCensus = manager || session?.role === 'colaborador';
  const general = session?.role === 'general';

  async function refreshRegistry(user = session) {
    try {
      const locations = await api('distritos');
      setDistrictOptions(locations.districts);
      setLocationCatalog(locations);
    } catch {
      // Keep existing catalog if fetch fails transiently
    }
    try {
      const census = user.role !== 'general' ? await api(`censo${censusQuery}`) : { districts: [] };
      const registry = await api('animales');
      setDistricts(census.districts);
      setAnimals(registry.animals);
      setError('');
    } catch (failure) {
      if (failure?.message && !/failed to fetch/i.test(failure.message)) {
        setError(failure.message);
      }
    }
  }

  async function showAnimal(animal) {
    const { url, image } = animal.code
      ? await animalQr(animal.code, import.meta.env.VITE_PUBLIC_ORIGIN || location.origin)
      : { url: null, image: null };
    setCreated({ ...animal, url });
    setEditing(null);
    setArchived(animal.status !== 'activo');
    setQr(image);
  }

  useEffect(() => {
    if (replyToken || adoptionPath || (reportKind && !code)) return;
    const load = code ? api(`ficha/${code}`).then(setProfile) : api('sesion').then(async ({ user }) => {
      setSession(user);
      setError('');
      if (user) await refreshRegistry(user);
    });
    load.catch((failure) => {
      if (failure?.message && !/failed to fetch/i.test(failure.message)) {
        setError(failure.message);
      }
    });
  }, [code, reportKind, adoptionPath, replyToken]);

  useEffect(() => {
    if (!session || !new URLSearchParams(location.search).has('registrar-animal')) return;
    setActiveView('crear-registro');
    const timer = setTimeout(() => {
      document.getElementById('registrar-animal')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      document.querySelector('#registrar-animal input[name="name"]')?.focus({ preventScroll: true });
      history.replaceState(null, '', location.pathname);
    }, 150);
    return () => clearTimeout(timer);
  }, [session]);

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function login(event) {
    event.preventDefault();
    const credentials = Object.fromEntries(new FormData(event.currentTarget));
    if (!signUp) credentials.remember = credentials.remember === 'on';
    return run(async () => {
      const result = await submit(signUp ? 'registro' : 'sesion', JSON.stringify(credentials));
      setSession(result.user);
      await refreshRegistry(result.user);
    });
  }

  function register(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    return run(async () => {
      const animal = await submit('animales', fields);
      form.reset();
      setLocationFormKey((key) => key + 1);
      await Promise.all([
        refreshRegistry(),
        general ? api(`animales/${animal.id}`).then(showAnimal) : showAnimal({ ...animal, status: 'activo' }),
      ]);
    });
  }

  function filterCensus(event) {
    event.preventDefault();
    const query = `?${new URLSearchParams(new FormData(event.currentTarget))}`;
    return run(async () => {
      const census = await api(`censo${query}`);
      setDistricts(census.districts);
      setCensusQuery(query);
    });
  }

  function performQrChange(action) {
    return run(async () => {
      const result = await submit(`animales/${created.id}/qr/${action}`);
      await showAnimal({ ...created, code: result.code });
      await refreshRegistry();
    });
  }

  function changeQr(action) {
    const warning = action === 'desactivar' ? say('¿Desactivar el QR de este expediente?', 'Disable this record’s QR code?', 'QR-Code dieser Tierakte deaktivieren?')
      : say('¿Emitir un QR nuevo? El código anterior dejará de funcionar.', 'Issue a new QR code? The previous code will stop working.', 'Neuen QR-Code erstellen? Der bisherige Code funktioniert dann nicht mehr.');
    if (created.code) {
      setConfirmState({ prompt: warning, action: () => performQrChange(action) });
      return;
    }
    return performQrChange(action);
  }

  function saveEdit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    return run(async () => {
      await submit(`animales/${editing.id}/editar`, fields);
      await showAnimal(await api(`animales/${editing.id}`));
      await refreshRegistry();
    });
  }

  function removeAnimal() {
    const prompt = `${say('¿Eliminar permanentemente el expediente de', 'Permanently delete the record for', 'Tierakte dauerhaft löschen für')} ${created.name}?`;
    setConfirmState({
      prompt,
      action: () => run(async () => {
        await submit(`animales/${created.id}/eliminar`);
        setCreated(null);
        setEditing(null);
        await refreshRegistry();
      }),
    });
  }

  const totalCensus = districts.reduce((total, district) => total + Number(district.total), 0);
  const maxDistrictTotal = Math.max(1, ...districts.map((district) => Number(district.total) || 0));
  const activeAnimals = animals.filter((animal) => animal.status === 'activo');
  const dogsCount = activeAnimals.filter((animal) => animal.species === 'perro').length;

  function renderCreatedDetail() {
    if (!created) return null;
    return <section className="panel vl-sneat-card qr-panel" aria-live="polite">
      <div className="vl-card-header w-full">
        <div>
          <p className="eyebrow">{say('Ficha de seguimiento e identificación QR', 'Tracking & QR identification record', 'Akte & QR-Kennzeichnung')}</p>
          <h2>{created.name}</h2>
        </div>
        <span className={`vl-status-badge ${archived ? 'is-muted' : 'is-success'}`} role="status">
          {say('Expediente', 'Record', 'Tierakte')} {archived ? created.status === 'inactivo' ? say('inactivo', 'inactive', 'inaktiv') : say('archivado', 'archived', 'archiviert') : say('activo', 'active', 'aktiv')}
        </span>
      </div>
      {general && <div className="w-full">
        {created.code && !archived && <img className="max-h-40 rounded-lg object-cover mb-3" src={`/api/ficha/${created.code}/foto`} alt={created.name} />}
        <p className="font-semibold">{say('Perro', 'Dog', 'Hund')} · {districtOptions.find((district) => district.id === created.district_id)?.name}</p>
        <p>{created.address}</p><p>{created.observations}</p>
        <details className="vl-sneat-details mt-3"><summary>{say('Expediente médico de ejemplo', 'Sample medical record', 'Beispiel einer Krankenakte')}</summary>
          <p>{say('Datos ficticios para la demo.', 'Fictional demo data.', 'Fiktive Daten für die Demo.')}</p>
          <p>{say('Vacunación de ejemplo', 'Example vaccination', 'Beispielimpfung')}: {new Intl.DateTimeFormat(language, { timeZone: 'UTC' }).format(new Date('2026-08-15'))}</p>
          <p>{say('Cirugías: ninguna en este ejemplo.', 'Surgeries: none in this example.', 'Operationen: keine in diesem Beispiel.')}</p>
        </details>
      </div>}
      {manager && <div className="flex flex-wrap gap-2">
        <button className="secondary" type="button" disabled={busy} onClick={() => run(async () => {
          setEditing(await api(`animales/${created.id}`));
        })}>{say('Editar expediente', 'Edit record', 'Tierakte bearbeiten')}</button>
        <button className="secondary vl-btn-danger-soft" type="button" disabled={busy} onClick={removeAnimal}>{say('Eliminar expediente', 'Delete record', 'Tierakte löschen')}</button>
      </div>}
      {editing && <form key={editing.id} onSubmit={saveEdit} className="vl-sneat-form w-full">
        <div className="vl-form-grid">
          <label>{say('Nombre', 'Name', 'Name')}<input name="name" maxLength={120} defaultValue={editing.name} required /></label>
          <label>{say('Especie', 'Species', 'Tierart')}<input type="text" readOnly value={say('🐶 Perro', '🐶 Dog', '🐶 Hund')} aria-readonly="true" /><input type="hidden" name="species" value="perro" /></label>
          <label>{say('Condición', 'Living situation', 'Lebenssituation')}<select name="living_condition" defaultValue={editing.living_condition}>
            <option value="hogar">{say('Con hogar', 'With a home', 'Mit Zuhause')}</option><option value="calle">{say('En calle', 'Stray', 'Streunend')}</option><option value="albergue">{say('En albergue', 'In a shelter', 'Im Tierheim')}</option>
          </select></label>
        </div>
        <TerritoryFields catalog={locationCatalog} initialDistrictId={editing.district_id} />
        <label>{say('Dirección exacta', 'Exact address', 'Genaue Adresse')}<input name="address" maxLength={255} defaultValue={editing.address} required /></label>
        <label>{say('Observaciones', 'Notes', 'Anmerkungen')}<textarea name="observations" maxLength={2000} defaultValue={editing.observations ?? ''} /></label>
        <label>{say('Reemplazar foto (opcional)', 'Replace photo (optional)', 'Foto ersetzen (optional)')}<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" /></label>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy}>{say('Guardar cambios', 'Save changes', 'Änderungen speichern')}</button>
          <button className="secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>{say('Cancelar edición', 'Cancel editing', 'Bearbeitung abbrechen')}</button>
        </div>
      </form>}
      <div className="vl-qr-showcase">
        {qr && <div className="vl-qr-frame"><img src={qr} alt={`${say('Código QR de', 'QR code for', 'QR-Code für')} ${created.name}`} /></div>}
        <div className="grid gap-2 content-start">
          {qr && <a className="button" href={qr} download={`tortuguero-huellas-${created.code}.png`}>{say('Descargar QR', 'Download QR code', 'QR-Code herunterladen')}</a>}
          {created.url ? <a className="vl-public-link" href={created.url} target="_blank" rel="noreferrer">{say('Abrir ficha pública', 'Open public profile', 'Öffentliches Profil öffnen')} ↗</a> : <p>{say('QR desactivado.', 'QR code disabled.', 'QR-Code deaktiviert.')}</p>}
          {manager && !archived && <div className="flex flex-wrap gap-2 mt-1">
            <button type="button" className="secondary" disabled={busy} onClick={() => changeQr('reemplazar')}>{created.code ? say('Reemplazar QR', 'Replace QR code', 'QR-Code ersetzen') : say('Generar QR nuevo', 'Generate a new QR code', 'Neuen QR-Code erstellen')}</button>
            {created.code && <button type="button" className="secondary" disabled={busy} onClick={() => changeQr('desactivar')}>{say('Desactivar QR', 'Disable QR code', 'QR-Code deaktivieren')}</button>}
          </div>}
          {manager && !archived && <button type="button" className="secondary mt-1" disabled={busy} onClick={() => run(async () => {
            await submit(`animales/${created.id}/archivar`);
            setArchived(true);
            await refreshRegistry();
          })}>{say('Archivar expediente', 'Archive record', 'Tierakte archivieren')}</button>}
        </div>
      </div>
      {manager && !archived && created.living_condition === 'hogar' && <form key={created.id} className="vl-sneat-form w-full mt-2" onSubmit={(event) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        run(async () => {
          await submit(`animales/${created.id}/correo`, fields);
          await refreshRegistry();
          setCreated((animal) => ({ ...animal, owner_email: fields.get('owner_email') }));
        });
      }}>
        <label>{say('Correo privado de la persona dueña', 'Owner’s private email address', 'Private E-Mail-Adresse des Halters')}<input type="email" name="owner_email" maxLength={254} defaultValue={created.owner_email || ''} /></label>
        <div><button disabled={busy}>{say('Guardar correo privado', 'Save private email', 'Private E-Mail speichern')}</button></div>
      </form>}
    </section>;
  }

  function renderCensusSection() {
    if (!canCensus) return null;
    return <section className="panel vl-sneat-card" id="censo">
      <div className="vl-card-header">
        <div>
          <p className="eyebrow">{say('Estadística territorial DTA', 'DTA territorial statistics', 'Gebietsstatistik DTA')}</p>
          <h2>{say('Censo vigente', 'Current census', 'Aktueller Bestand')}</h2>
          <p className="vl-card-subtitle">{say('Expedientes activos por distrito', 'Active records by district', 'Aktive Tierakten nach Bezirk')}</p>
        </div>
        <div className="vl-census-total-pill" role="status">
          <span>{say('Total registrado', 'Registered total', 'Registrierte Tiere')}:</span>
          <strong>{new Intl.NumberFormat(language).format(totalCensus)}</strong>
        </div>
      </div>
      <form onSubmit={filterCensus} className="vl-sneat-filter-bar">
        <TerritoryFields catalog={locationCatalog} initialCantonId="101" required={false} />
        <label>{say('Especie', 'Species', 'Tierart')}<select name="species"><option value="perro">{say('Perro', 'Dog', 'Hund')}</option></select></label>
        <label>{say('Condición', 'Living situation', 'Lebenssituation')}<select name="condition"><option value="">{say('Todas', 'All', 'Alle')}</option><option value="hogar">{say('Con hogar', 'With a home', 'Mit Zuhause')}</option><option value="calle">{say('En calle', 'Stray', 'Streunend')}</option><option value="albergue">{say('En albergue', 'In a shelter', 'Im Tierheim')}</option></select></label>
        <div className="vl-filter-submit"><button disabled={busy}>{say('Filtrar censo', 'Filter census', 'Bestand filtern')}</button></div>
      </form>
      <ul className="counts vl-sneat-counts">{districts.map((district) => {
        const val = Number(district.total) || 0;
        const pct = totalCensus > 0 ? Math.round((val / maxDistrictTotal) * 100) : 0;
        return <li key={district.id}>
          <div className="vl-count-row">
            <span className="vl-district-name">{district.name}</span>
            <strong>{val === 0 ? `0 · ${say('Sin registros', 'No records', 'Keine Einträge')}` : new Intl.NumberFormat(language).format(val)}</strong>
          </div>
          <div className="vl-progress-track" aria-hidden="true">
            <div className="vl-progress-fill" style={{ width: `${val > 0 ? Math.max(8, pct) : 0}%` }} />
          </div>
        </li>;
      })}</ul>
    </section>;
  }

  function renderCreateAnimalSection() {
    if (!manager && !general && session?.role !== 'colaborador') return null;
    return <section className="panel vl-sneat-card" id="registrar-animal">
      <div className="vl-card-header">
        <div>
          <p className="eyebrow">{say('Alta de expediente e identificación QR', 'New record & QR identification', 'Neue Tierakte & QR-Kennzeichnung')}</p>
          <h2>{say('Registrar un compañero animal', 'Register an animal companion', 'Ein Haustier registrieren')}</h2>
          {!general && <p className="vl-card-subtitle">{say('Podés registrarlo sin tutor ni collar.', 'You can register an animal without an owner or collar.', 'Du kannst ein Tier ohne Halter oder Halsband registrieren.')}</p>}
        </div>
      </div>
      <form onSubmit={register} className="vl-sneat-form">
        <div className="vl-form-grid">
          <label>{say('Nombre', 'Name', 'Name')}<input name="name" maxLength={120} required /></label>
          <label>{say('Especie', 'Species', 'Tierart')}<input type="text" readOnly value={say('🐶 Perro', '🐶 Dog', '🐶 Hund')} aria-readonly="true" /><input type="hidden" name="species" value="perro" /></label>
          <label>{say('Condición', 'Living situation', 'Lebenssituation')}<select name="living_condition" defaultValue={general ? 'hogar' : 'calle'}>
            <option value="hogar">{say('En hogar', 'In a home', 'Mit Zuhause')}</option>
            <option value="calle">{say('En calle', 'Stray', 'Streunend')}</option>
            <option value="albergue">{say('En albergue', 'In a shelter', 'Im Tierheim')}</option>
          </select></label>
        </div>
        <TerritoryFields key={locationFormKey} catalog={locationCatalog} />
        <label>{say('Dirección exacta', 'Exact address', 'Genaue Adresse')}<input name="address" maxLength={255} required /></label>
        <label>{say('Observaciones', 'Notes', 'Anmerkungen')}<textarea name="observations" maxLength={2000} required /></label>
        <label>{say('Foto', 'Photo', 'Foto')}<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required /></label>
        <div><button disabled={busy}>{say('Guardar expediente', 'Save record', 'Tierakte speichern')}</button></div>
      </form>
    </section>;
  }

  function renderAnimalsListSection() {
    if (!manager && !general && session?.role !== 'colaborador') return null;
    const filtered = animals.filter((animal) => {
      const term = animalSearch.trim().toLowerCase();
      return !term || animal.name.toLowerCase().includes(term) || String(animal.id) === term.replace(/^#/, '');
    });
    return <section className="panel vl-sneat-card qr-panel" id="expedientes">
      <div className="vl-card-header w-full">
        <div>
          <p className="eyebrow">{say('Directorio de identificaciones', 'Identification directory', 'Kennzeichnungsverzeichnis')}</p>
          <h2>{general ? say('Mis compañeros animales', 'My animal companions', 'Meine Haustiere') : say('Expedientes registrados', 'Registered records', 'Registrierte Tierakten')}</h2>
        </div>
        {manager && animals.length > 3 && <input type="search" value={animalSearch} onChange={(event) => setAnimalSearch(event.target.value)}
          placeholder={say('Buscar por nombre o # de expediente…', 'Search by name or record #…', 'Nach Name oder Akten-Nr. suchen…')}
          aria-label={say('Buscar expediente', 'Search record', 'Tierakte suchen')} className="vl-search-input" />}
      </div>
      {general && animals.length === 0 && <div className="vl-empty-state">
        <p>{say('Todavía no tenés animales registrados.', 'You have no animals registered yet.', 'Du hast noch keine Tiere registriert.')}</p>
        <button type="button" onClick={() => setActiveView('crear-registro')}>{say('Registrar mi primer compañero', 'Register my first companion', 'Mein erstes Haustier registrieren')}</button>
      </div>}
      <ul className="vl-records-grid w-full">{filtered.map((animal) => <li key={animal.id}>
        <button type="button" className={`secondary vl-record-pill ${created?.id === animal.id ? 'is-selected' : ''}`} disabled={busy}
          onClick={() => run(async () => showAnimal(general ? await api(`animales/${animal.id}`) : animal))}>
          <span className="vl-record-emoji" aria-hidden="true">🐶</span>
          <span className="vl-record-info">
            <strong>{animal.name}</strong>
            <small>{animal.status === 'activo' ? say('activo', 'active', 'aktiv') : animal.status === 'archivado' ? say('archivado', 'archived', 'archiviert') : say('inactivo', 'inactive', 'inaktiv')}</small>
          </span>
        </button>
      </li>)}</ul>
    </section>;
  }

  function renderAuthenticatedView() {
    const userDisplayName = session.display_name || session.username;

    if (activeView === 'crear-registro') {
      return <div className="vl-view-stack">
        {renderCreateAnimalSection()}
        {renderCreatedDetail()}
      </div>;
    }

    if (activeView === 'expedientes') {
      return <div className="vl-view-stack">
        {renderAnimalsListSection()}
        {renderCreatedDetail()}
      </div>;
    }

    if (activeView === 'hallazgo') {
      return <div className="vl-view-stack">
        <div className="vl-sneat-two-col">
          <div className="vl-embedded-form">
            <ReportForm kind="hallazgo" api={api} submit={submit} />
          </div>
          {manager && <div id="avisos"><ReportInbox api={api} submit={submit} animals={animals} /></div>}
        </div>
      </div>;
    }

    if (activeView === 'extravio') {
      return <div className="vl-view-stack">
        <div className="vl-sneat-two-col">
          <div className="vl-embedded-form">
            <ReportForm kind="extravio" api={api} submit={submit} />
          </div>
          {manager && <div id="avisos"><ReportInbox api={api} submit={submit} animals={animals} /></div>}
        </div>
      </div>;
    }

    if (activeView === 'adopciones') {
      return <div className="vl-view-stack">
        {manager && <div id="adopciones"><AdoptionManagement api={api} submit={submit} animals={animals} /></div>}
        <div className="panel vl-sneat-card">
          <AdoptionGallery api={api} submit={submit} />
        </div>
      </div>;
    }

    if (activeView === 'censo' && canCensus) {
      return <div className="vl-view-stack">
        {renderCensusSection()}
      </div>;
    }

    if (activeView === 'usuarios' && manager) {
      return <div className="vl-view-stack">
        <UserManagement role={session.role} api={api} submit={submit} />
      </div>;
    }

    // Default: SNEAT DASHBOARD VIEW
    return <div className="vl-view-stack">
      <div className="vl-sneat-hero-grid">
        <section className="panel vl-sneat-welcome">
          <div className="vl-welcome-copy">
            <span className="vl-welcome-pill">✨ {roleBadgeLabel(session.role, say)} · San José</span>
            <h1>{say('Bienvenido a la plataforma Tortuguero Huellas', 'Welcome to the Tortuguero Huellas platform', 'Willkommen auf der Tortuguero Huellas-Plattform')}</h1>
            <p className="vl-welcome-greeting">
              {say(`¡Hola, ${userDisplayName}!`, `Welcome back, ${userDisplayName}!`, `Willkommen zurück, ${userDisplayName}!`)}{' '}
              {general
                ? say('Desde su panel puede registrar a sus compañeros animales, descargar su código QR de collar y reportar cualquier hallazgo o extravío.', 'From your dashboard you can register your animal companions, download their collar QR code, and report any find or missing animal.', 'Über Ihr Dashboard können Sie Ihre Haustiere registrieren, ihren QR-Code herunterladen und Funde oder Vermisstenfälle melden.')
                : say('Gestione expedientes con identificación QR, consulte el censo activo por distrito y coordine avisos y adopciones del cantón central de San José.', 'Manage QR identification records, review the active district census, and coordinate reports and adoptions for central San José.', 'Verwalten Sie Tierakten mit QR-Code, prüfen Sie den aktiven Bezirksbestand und koordinieren Sie Meldungen und Adoptionen.')}
            </p>
          </div>
          <div className="vl-welcome-art" aria-hidden="true">
            <img src={registrationImage} alt="" />
          </div>
        </section>

        <div className="vl-sneat-kpi-grid">
          {canCensus && <article className="panel vl-kpi-card" onClick={() => setActiveView('censo')}>
            <div className="vl-kpi-top">
              <span className="vl-kpi-icon is-blue" aria-hidden="true">📊</span>
              <span className="vl-kpi-tag">{say('Censo activo', 'Active census', 'Aktiver Bestand')}</span>
            </div>
            <strong className="vl-kpi-value">{new Intl.NumberFormat(language).format(totalCensus)}</strong>
            <p className="vl-kpi-label">{say('Compañeros censados en San José', 'Animals counted in San José', 'Erfasste Tiere in San José')}</p>
          </article>}

          {(manager || general) && <article className="panel vl-kpi-card" onClick={() => setActiveView('expedientes')}>
            <div className="vl-kpi-top">
              <span className="vl-kpi-icon is-emerald" aria-hidden="true">🐾</span>
              <span className="vl-kpi-tag">{general ? say('Mis fichas', 'My records', 'Meine Akten') : say('Expedientes QR', 'QR records', 'QR-Akten')}</span>
            </div>
            <strong className="vl-kpi-value">{animals.length}</strong>
            <p className="vl-kpi-label">🐶 {dogsCount} {say('perros activos', 'active dogs', 'aktive Hunde')}</p>
          </article>}

          <article className="panel vl-kpi-card" onClick={() => setActiveView('hallazgo')}>
            <div className="vl-kpi-top">
              <span className="vl-kpi-icon is-amber" aria-hidden="true">📍</span>
              <span className="vl-kpi-tag">{say('Atención ciudadana', 'Citizen reports', 'Bürgermeldungen')}</span>
            </div>
            <strong className="vl-kpi-value">{say('Avisos', 'Reports', 'Meldungen')}</strong>
            <p className="vl-kpi-label">{say('Hallazgos y extravíos', 'Found & missing reports', 'Fund- & Vermisstenmeldungen')}</p>
          </article>

          <article className="panel vl-kpi-card" onClick={() => setActiveView('adopciones')}>
            <div className="vl-kpi-top">
              <span className="vl-kpi-icon is-rose" aria-hidden="true">🏡</span>
              <span className="vl-kpi-tag">{say('Hogares responsables', 'Responsible homes', 'Verantwortungsvolle Heime')}</span>
            </div>
            <strong className="vl-kpi-value">{say('Adopción', 'Adoption', 'Adoption')}</strong>
            <p className="vl-kpi-label">{say('Galería y solicitudes', 'Gallery & applications', 'Galerie & Anfragen')}</p>
          </article>
        </div>
      </div>
    </div>;
  }

  const content = <>
    {error && <p className="notice" role="alert">{error}</p>}
    {replyToken ? <PrivateReportReply token={replyToken} api={api} submit={submit} /> : adoptionPath ? <AdoptionGallery code={adoptionPath[1]} api={api} submit={submit} /> : reportKind || profile?.lost ? (!code || profile) && <ReportForm kind={reportKind || 'hallazgo'} code={code} profile={profile} api={api} submit={submit} /> : code ? (profile ? <article className="panel public-profile">
      <p className="eyebrow">{say('Ficha pública', 'Public profile', 'Öffentliches Profil')}</p>
      <h1>{profile.name}</h1>
      {profile.photo && <img src={profile.photo} alt={`${say('Foto de', 'Photo of', 'Foto von')} ${profile.name}`} />}
      <p>{say('Perro', 'Dog', 'Hund')} · {profile.district}</p>
      <a className="button mt-4 inline-block" href={`/ficha/${code}/hallazgo`}>{say('Encontré a este compañero', 'I found this animal', 'Ich habe dieses Tier gefunden')}</a>
    </article> : !error && <p role="status">{say('Abriendo ficha…', 'Opening profile…', 'Profil wird geöffnet…')}</p>) : session ? <>
      {renderAuthenticatedView()}
      {confirmState && <ConfirmDialog prompt={confirmState.prompt} onCancel={() => setConfirmState(null)}
        onConfirm={() => { const act = confirmState.action; setConfirmState(null); act(); }} />}
    </> : session === null ? <section className="panel login">
      <p className="eyebrow">{say('Demostración local', 'Local demo', 'Lokale Demo')}</p>
      <h1>{signUp ? say('Crear cuenta', 'Create account', 'Konto erstellen') : say('Ingresar a Tortuguero Huellas', 'Sign in to Tortuguero Huellas', 'Bei Tortuguero Huellas anmelden')}</h1>
      <form onSubmit={login} key={String(signUp)}>
        {signUp && <><label>{say('Nombre completo', 'Full name', 'Vollständiger Name')}<input name="display_name" autoComplete="name" required maxLength={120} /></label>
          <label>{say('Correo electrónico', 'Email address', 'E-Mail-Adresse')}<input name="email" type="email" autoComplete="email" required maxLength={254} /></label></>}
        <label>{say('Usuario', 'Username', 'Benutzername')}<input name="username" autoComplete={signUp ? 'username' : 'off'} required minLength={signUp ? 3 : undefined} maxLength={signUp ? 40 : undefined} /></label>
        <label>{say('Contraseña', 'Password', 'Passwort')}<input name="password" type="password" autoComplete="off" required minLength={signUp ? 4 : undefined} /></label>
        {signUp && <label>{say('Confirmar contraseña', 'Confirm password', 'Passwort bestätigen')}<input name="password_confirmation" type="password" autoComplete="off" required minLength={4} /></label>}
        {!signUp && <label className="flex items-center gap-2"><input name="remember" type="checkbox" />{say('Mantener mi sesión iniciada', 'Keep me signed in', 'Angemeldet bleiben')}</label>}
        <button disabled={busy}>{busy ? say('Procesando…', 'Working…', 'Wird verarbeitet…') : signUp ? say('Crear cuenta', 'Create account', 'Konto erstellen') : say('Ingresar', 'Sign in', 'Anmelden')}</button>
      </form>
      <button className="secondary mt-3" type="button" disabled={busy} onClick={() => { setError(''); setSignUp(!signUp); }}>
        {signUp ? say('¿Ya tiene cuenta? Ingresar', 'Already have an account? Sign in', 'Schon ein Konto? Anmelden') : say('¿No tiene cuenta? Registrarse', 'No account yet? Register', 'Noch kein Konto? Registrieren')}
      </button>
      {busy && <div className="vl-loading" role="status">
        <span aria-hidden="true">🐾</span>{say('Abriendo Tortuguero Huellas…', 'Opening Tortuguero Huellas…', 'Tortuguero Huellas wird geöffnet…')}
      </div>}
      <nav className="mt-5 grid gap-2" aria-label="Avisos públicos">
        <a href="/hallazgo">{say('Encontré a un animal', 'I found an animal', 'Ich habe ein Tier gefunden')}</a>
        <a href="/extravio">{say('Reportar extravío', 'Report a missing animal', 'Ein Tier als vermisst melden')}</a>
        <a href="/adopciones">{say('Compañeros animales en adopción', 'Animals for adoption', 'Tiere zur Adoption')}</a>
      </nav>
    </section> : !error && <div className="vl-paw-inline-container" role="status"><PawCircle /></div>}
  </>;

  if (session) {
    return <Shell
      user={session}
      manager={manager}
      canCensus={canCensus}
      activeView={activeView}
      onSelectView={(view) => setActiveView(view)}
      counts={{ animals: animals.length, census: totalCensus }}
      onSaveProfile={async (fields) => {
        const { user } = await submit('perfil', fields);
        setSession(user);
      }}
      onLogout={() => run(async () => {
        await submit('salir');
        location.replace('/');
      })}
    >{content}</Shell>;
  }

  return <>
    <header className="flex items-center justify-between gap-4"><a className="brand" href="/">Tortuguero Huellas</a><LanguageSelect /></header>
    <main>{content}</main>
    <footer>© 2026 Tortuguero Huellas · Finding Home Project by BIENVET</footer>
  </>;
}

function parseRoute(pathname) {
  const publicPath = pathname.match(/^\/ficha\/([a-f0-9]{32})(?:\/(hallazgo))?\/?$/);
  const reportKind = publicPath?.[2] ?? pathname.match(/^\/(hallazgo|extravio)\/?$/)?.[1];
  const adoptionPath = pathname.match(/^\/adopciones(?:\/([a-f0-9]{32}))?\/?$/);
  const replyToken = pathname.match(/^\/responder\/([a-f0-9]{64})\/?$/)?.[1];
  return {
    pathname,
    code: publicPath?.[1],
    isFicha: Boolean(publicPath?.[1]),
    directHallazgo: publicPath?.[2] === 'hallazgo',
    reportKind,
    adoptionPath,
    replyToken,
  };
}

function Root() {
  const [route, setRoute] = useState(() => parseRoute(location.pathname));

  useEffect(() => {
    const sync = () => setRoute(parseRoute(location.pathname));
    window.addEventListener('popstate', sync);
    window.addEventListener('tortuguero-huellas:navigate', sync);
    window.addEventListener('vitalink:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tortuguero-huellas:navigate', sync);
      window.removeEventListener('vitalink:navigate', sync);
    };
  }, []);

  function navigate(target) {
    history.pushState(null, '', target);
    setRoute(parseRoute(location.pathname));
  }

  function clearFichaUrl() {
    if (location.pathname !== '/') {
      history.replaceState(null, '', '/');
      setRoute(parseRoute('/'));
    }
  }

  const isLandingRoute = route.pathname === '/' || route.isFicha;

  return (
    <LocaleProvider>
      <PawSplash />
      {isLandingRoute ? (
        <Landing
          api={api}
          submit={submit}
          onNavigate={navigate}
          initialFicha={route.isFicha ? { code: route.code, directHallazgo: route.directHallazgo } : null}
          onClearFicha={clearFichaUrl}
        />
      ) : (
        <App
          code={route.code}
          reportKind={route.reportKind}
          adoptionPath={route.adoptionPath}
          replyToken={route.replyToken}
        />
      )}
    </LocaleProvider>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
