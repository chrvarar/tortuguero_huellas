import { useEffect, useRef, useState } from 'react';
import { LOGO_DATA_URI as logo } from './logo-data.js';
import { FlagLanguageSelect, useLocale } from './locale.jsx';

export function Avatar({ user }) {
  const [failed, setFailed] = useState(false);
  const name = user.display_name || user.username || 'VL';
  return user.avatar && !failed ? <img className="vl-avatar-image" src={user.avatar} alt="" onError={() => setFailed(true)} />
    : <span aria-hidden="true">{Array.from(name).slice(0, 2).join('').toUpperCase()}</span>;
}

export function roleBadgeLabel(role, say) {
  if (role === 'superusuario') return say('Superusuario', 'Superuser', 'Superuser');
  if (role === 'administrador') return say('Administración', 'Administrator', 'Administration');
  if (role === 'colaborador') return say('Colaborador', 'Collaborator', 'Mitarbeitende');
  return say('Usuario general', 'General user', 'Allgemeines Konto');
}

function NavIcon({ name }) {
  switch (name) {
    case 'dashboard':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></svg>;
    case 'crear-registro':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="M9 15h6" /></svg>;
    case 'expedientes':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></svg>;
    case 'hallazgo':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
    case 'extravio':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
    case 'adopciones':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
    case 'censo':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="8" rx="1" /><rect x="12" y="6" width="3" height="12" rx="1" /><rect x="17" y="13" width="3" height="5" rx="1" /></svg>;
    case 'usuarios':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    default:
      return null;
  }
}

function ProfileForm({ user, onSave, onClose }) {
  const { say } = useLocale();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setStatus('');
    setError('');
    try {
      await onSave(fields);
      form.elements.avatar.value = '';
      if (form.elements.remove_avatar) form.elements.remove_avatar.checked = false;
      setStatus(say('Perfil actualizado.', 'Profile updated.', 'Profil aktualisiert.'));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel vl-sneat-card vl-profile-form" aria-labelledby="perfil-title">
    <div className="vl-card-header">
      <div>
        <p className="eyebrow">{say('Preferencias de cuenta', 'Account preferences', 'Kontoeinstellungen')}</p>
        <h1 id="perfil-title" tabIndex={-1}>{say('Editar perfil', 'Edit profile', 'Profil bearbeiten')}</h1>
      </div>
      <button className="secondary" type="button" disabled={busy} onClick={onClose}>{say('Volver', 'Back', 'Zurück')}</button>
    </div>
    <div className="vl-profile-hero">
      <div className="vl-avatar-preview"><Avatar key={user.avatar} user={user} /></div>
      <div>
        <strong className="vl-profile-name">{user.display_name || user.username}</strong>
        <p className="vl-profile-meta">{say('Usuario', 'Username', 'Benutzername')}: <strong>{user.username}</strong> · <span className="vl-role-pill">{roleBadgeLabel(user.role, say)}</span></p>
      </div>
    </div>
    <form onSubmit={save} className="vl-sneat-form">
      <label>{say('Nombre para mostrar', 'Display name', 'Anzeigename')}<input name="display_name" maxLength={120} defaultValue={user.display_name || ''} /></label>
      <label>{say('Foto de perfil', 'Profile photo', 'Profilfoto')}<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      <p className="vl-form-hint">JPEG, PNG, WebP · 2 MB</p>
      {user.avatar && <label className="vl-check-inline"><input className="w-auto" name="remove_avatar" type="checkbox" value="1" />
        {say('Quitar foto', 'Remove photo', 'Foto entfernen')}</label>}
      <div><button disabled={busy}>{say('Guardar perfil', 'Save profile', 'Profil speichern')}</button></div>
    </form>
    {status && <p role="status" className="vl-status-ok mt-3">{status}</p>}
    {error && <p role="alert" className="notice mt-3">{error}</p>}
  </section>;
}

export function Shell({
  user,
  manager,
  canCensus,
  activeView = 'dashboard',
  onSelectView,
  counts = {},
  onLogout,
  onSaveProfile,
  children,
}) {
  const { say } = useLocale();
  const [menu, setMenu] = useState(() => matchMedia('(min-width: 56.01rem)').matches);
  const [dark, setDark] = useState(() => (localStorage.getItem('tortuguero-huellas-theme') || localStorage.getItem('vitalink-theme')) === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const content = useRef(null);
  const account = useRef(null);

  useEffect(() => { localStorage.setItem('tortuguero-huellas-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    if (profileOpen) {
      content.current?.scrollTo({ top: 0, behavior: 'smooth' });
      content.current?.querySelector('#perfil-title')?.focus();
    }
  }, [profileOpen]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (account.current?.open && !account.current.contains(event.target)) {
        account.current.open = false;
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  function go(viewId, event) {
    if (event) event.preventDefault();
    setProfileOpen(false);
    onSelectView?.(viewId);
    content.current?.scrollTo({ top: 0, behavior: 'smooth' });
    if (matchMedia('(max-width: 56rem)').matches) setMenu(false);
  }

  const viewTitles = {
    dashboard: {
      group: say('Panel principal', 'Main panel', 'Hauptbereich'),
      title: say('Dashboard', 'Dashboard', 'Dashboard'),
    },
    'crear-registro': {
      group: say('Gestiones de compañeros', 'Companion management', 'Tierverwaltung'),
      title: say('Crear registro', 'Create record', 'Eintrag erstellen'),
    },
    expedientes: {
      group: say('Gestiones de compañeros', 'Companion management', 'Tierverwaltung'),
      title: user.role === 'general'
        ? say('Mi compañero animal', 'My animal companion', 'Mein Haustier')
        : say('Expedientes registrados', 'Animal records', 'Tierakten'),
    },
    hallazgo: {
      group: say('Gestiones de compañeros', 'Companion management', 'Tierverwaltung'),
      title: say('Encontré un compañero', 'Found a companion', 'Tier gefunden'),
    },
    extravio: {
      group: say('Gestiones de compañeros', 'Companion management', 'Tierverwaltung'),
      title: say('Se me extravió mi compañero', 'Missing companion', 'Tier vermisst'),
    },
    adopciones: {
      group: say('Gestiones de compañeros', 'Companion management', 'Tierverwaltung'),
      title: say('Adopciones', 'Adoptions', 'Adoptionen'),
    },
    censo: {
      group: say('Reportes', 'Reports', 'Berichte'),
      title: say('Reporte de censo', 'Census report', 'Bestandsbericht'),
    },
    usuarios: {
      group: say('Administración', 'Administration', 'Verwaltung'),
      title: say('Usuarios', 'Users', 'Benutzer'),
    },
  };

  const currentMeta = viewTitles[activeView] || viewTitles.dashboard;

  return <div className={`vl-shell ${dark ? 'vl-dark' : ''} ${menu ? 'vl-menu-open' : ''}`}>
    <header className="vl-shell-header">
      <div className="vl-shell-header-left">
        <button type="button" className="vl-menu-toggle" aria-expanded={menu} aria-controls="shell-menu" onClick={() => setMenu(!menu)}>
          <span aria-hidden="true">☰</span> <span className="vl-menu-toggle-text">{say('Menú', 'Menu', 'Menü')}</span>
        </button>
        <a className="vl-shell-logo" href="/" aria-label="Tortuguero Huellas"><img src={logo} alt="Tortuguero Huellas" /></a>
        <div className="vl-shell-breadcrumb" aria-hidden="true">
          <span className="vl-crumb-group">{currentMeta.group}</span>
          <span className="vl-crumb-sep">/</span>
          <strong className="vl-crumb-current">{currentMeta.title}</strong>
        </div>
      </div>
      <div className="vl-shell-controls">
        <span className="vl-canton-badge"><span className="vl-canton-dot" aria-hidden="true" />San José · {say('Piloto', 'Pilot', 'Pilot')}</span>
        <FlagLanguageSelect />
        <button type="button" className="vl-theme-btn" aria-pressed={dark} onClick={() => setDark(!dark)}>
          <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
          <span>{dark ? say('Claro', 'Light', 'Hell') : say('Oscuro', 'Dark', 'Dunkel')}</span>
        </button>
        <details className="vl-profile-menu" ref={account}>
          <summary aria-label={say('Cuenta', 'Account', 'Konto')}>
            <span className="vl-avatar-ring">
              <Avatar key={user.avatar} user={user} />
              <i className="vl-online-dot" aria-hidden="true" />
            </span>
          </summary>
          <div className="vl-profile-dropdown">
            <div className="vl-profile-dropdown-head">
              <div className="vl-avatar-ring vl-avatar-lg"><Avatar key={user.avatar} user={user} /></div>
              <div className="min-w-0">
                <strong className="block truncate">{user.display_name || user.username}</strong>
                <span className="vl-role-pill">{roleBadgeLabel(user.role, say)}</span>
              </div>
            </div>
            <hr className="vl-dropdown-divider" />
            <button type="button" className="vl-dropdown-item" onClick={() => { account.current.open = false; setProfileOpen(true); }}>
              <span aria-hidden="true">👤</span> {say('Editar perfil', 'Edit profile', 'Profil bearbeiten')}
            </button>
            <button type="button" className="vl-dropdown-item vl-dropdown-danger" onClick={onLogout}>
              <span aria-hidden="true">🚪</span> {say('Cerrar sesión', 'Sign out', 'Abmelden')}
            </button>
          </div>
        </details>
      </div>
    </header>
    <div className="vl-shell-body">
      <nav id="shell-menu" className="vl-sneat-sidebar" aria-label={say('Navegación principal', 'Main navigation', 'Hauptnavigation')}>
        <div className="vl-sidebar-group">
          <a href="#dashboard" className={`vl-nav-link ${activeView === 'dashboard' && !profileOpen ? 'is-active' : ''}`}
            onClick={(e) => go('dashboard', e)}>
            <span className="vl-nav-icon"><NavIcon name="dashboard" /></span>
            <span className="vl-nav-text">{say('Dashboard', 'Dashboard', 'Dashboard')}</span>
          </a>
        </div>

        <div className="vl-sidebar-group">
          <p className="vl-sidebar-heading"><span>{say('Gestiones de compañeros', 'Companion management', 'Tierverwaltung')}</span></p>
          {(manager || user.role === 'general' || user.role === 'colaborador') && (
            <a href="#crear-registro" className={`vl-nav-link ${activeView === 'crear-registro' && !profileOpen ? 'is-active' : ''}`}
              onClick={(e) => go('crear-registro', e)}>
              <span className="vl-nav-icon"><NavIcon name="crear-registro" /></span>
              <span className="vl-nav-text">{say('Crear registro', 'Create record', 'Eintrag erstellen')}</span>
            </a>
          )}
          {(manager || user.role === 'general' || user.role === 'colaborador') && (
            <a href="#expedientes" className={`vl-nav-link ${activeView === 'expedientes' && !profileOpen ? 'is-active' : ''}`}
              onClick={(e) => go('expedientes', e)}>
              <span className="vl-nav-icon"><NavIcon name="expedientes" /></span>
              <span className="vl-nav-text">{user.role === 'general'
                ? say('Mi compañero animal', 'My animal companion', 'Mein Haustier')
                : say('Gestión de compañeros animales', 'Animal records', 'Tierakten')}</span>
              {typeof counts.animals === 'number' && <span className="vl-nav-badge">{counts.animals}</span>}
            </a>
          )}
          <a href="#hallazgo" className={`vl-nav-link ${activeView === 'hallazgo' && !profileOpen ? 'is-active' : ''}`}
            onClick={(e) => go('hallazgo', e)}>
            <span className="vl-nav-icon"><NavIcon name="hallazgo" /></span>
            <span className="vl-nav-text">{say('Encontré un compañero', 'Found a companion', 'Tier gefunden')}</span>
          </a>
          <a href="#extravio" className={`vl-nav-link ${activeView === 'extravio' && !profileOpen ? 'is-active' : ''}`}
            onClick={(e) => go('extravio', e)}>
            <span className="vl-nav-icon"><NavIcon name="extravio" /></span>
            <span className="vl-nav-text">{say('Se me extravió mi compañero', 'Missing companion', 'Tier vermisst')}</span>
          </a>
          <a href="#adopciones" className={`vl-nav-link ${activeView === 'adopciones' && !profileOpen ? 'is-active' : ''}`}
            onClick={(e) => go('adopciones', e)}>
            <span className="vl-nav-icon"><NavIcon name="adopciones" /></span>
            <span className="vl-nav-text">{say('Adopciones', 'Adoptions', 'Adoptionen')}</span>
          </a>
        </div>

        {canCensus && (
          <div className="vl-sidebar-group">
            <p className="vl-sidebar-heading"><span>{say('Reportes', 'Reports', 'Berichte')}</span></p>
            <a href="#censo" className={`vl-nav-link ${activeView === 'censo' && !profileOpen ? 'is-active' : ''}`}
              onClick={(e) => go('censo', e)}>
              <span className="vl-nav-icon"><NavIcon name="censo" /></span>
              <span className="vl-nav-text">{say('Reporte de censo', 'Census report', 'Bestandsbericht')}</span>
              {typeof counts.census === 'number' && <span className="vl-nav-badge">{counts.census}</span>}
            </a>
          </div>
        )}

        {manager && (
          <div className="vl-sidebar-group">
            <p className="vl-sidebar-heading"><span>{say('Administración', 'Administration', 'Verwaltung')}</span></p>
            <a href="#usuarios" className={`vl-nav-link ${activeView === 'usuarios' && !profileOpen ? 'is-active' : ''}`}
              onClick={(e) => go('usuarios', e)}>
              <span className="vl-nav-icon"><NavIcon name="usuarios" /></span>
              <span className="vl-nav-text">{say('Usuarios', 'Users', 'Benutzer')}</span>
            </a>
          </div>
        )}
      </nav>
      <main className="vl-shell-main" id="inicio" ref={content}>
        <div className="vl-protagonist-container">
          {profileOpen ? <ProfileForm user={user} onSave={onSaveProfile} onClose={() => {
            setProfileOpen(false);
            account.current?.querySelector('summary')?.focus();
          }} /> : children}
        </div>
      </main>
    </div>
    <footer className="vl-shell-footer">© 2026 Tortuguero Huellas · {say('En asociación con', 'In partnership with', 'In Zusammenarbeit mit')} Finding Home Project by BIENVET</footer>
  </div>;
}
