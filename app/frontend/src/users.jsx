import { useEffect, useState } from 'react';
import { useLocale } from './locale.jsx';
import { roleBadgeLabel } from './shell.jsx';

export function UserManagement({ role, api, submit }) {
  const { say } = useLocale();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const targetRole = role === 'superusuario' ? 'administrador' : 'colaborador';

  useEffect(() => {
    api('usuarios').then(({ users: results }) => setUsers(results)).catch((failure) => setError(failure.message));
  }, [role]);

  async function create(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await submit('usuarios', JSON.stringify({ ...values, role: targetRole }));
      const { users: results } = await api('usuarios');
      setUsers(results);
      form.reset();
      setStatus(say('Cuenta creada. Compartí las credenciales por un canal privado.', 'Account created. Share the credentials privately.', 'Konto erstellt. Zugangsdaten privat weitergeben.'));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel vl-sneat-card vl-users" id="usuarios" aria-labelledby="usuarios-title">
    <div className="vl-card-header">
      <div>
        <p className="eyebrow">{say('Control de accesos y permisos', 'Access & permissions control', 'Zugriffs- & Rechteverwaltung')}</p>
        <h2 id="usuarios-title">{say('Usuarios', 'Users', 'Benutzer')}</h2>
        <p className="vl-card-subtitle">{role === 'superusuario' ? say('Creá una cuenta de Administración.', 'Create an administrator account.', 'Administratorkonto erstellen.')
          : say('Creá una cuenta de Colaborador.', 'Create a collaborator account.', 'Mitarbeiterkonto erstellen.')}</p>
      </div>
    </div>
    <div className="vl-users-grid">
      <div className="vl-users-form-col">
        <form onSubmit={create} autoComplete="off" className="vl-sneat-form">
          <label>{say('Usuario', 'Username', 'Benutzername')}<input name="username" required minLength={3} maxLength={40} pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,39}" autoComplete="off" /></label>
          <label>{say('Contraseña temporal', 'Temporary password', 'Temporäres Passwort')}<input name="password" type="password" required minLength={4} maxLength={72} autoComplete="off" /></label>
          <div><button disabled={busy}>{busy ? say('Creando…', 'Creating…', 'Wird erstellt…') : say('Crear cuenta', 'Create account', 'Konto erstellen')}</button></div>
        </form>
        {status && <p role="status" className="vl-status-ok mt-3">{status}</p>}
        {error && <p role="alert" className="notice mt-3">{error}</p>}
      </div>
      <div className="vl-users-list-col">
        <h3 className="vl-sub-heading">{say('Cuentas visibles', 'Visible accounts', 'Sichtbare Konten')}</h3>
        {users.length === 0 ? <p>{say('Todavía no hay cuentas.', 'No accounts yet.', 'Noch keine Konten.')}</p>
          : <ul className="vl-user-list">{users.map((user) => {
            const label = user.display_name || user.username;
            const initials = Array.from(label).slice(0, 2).join('').toUpperCase();
            return <li key={user.id} className="vl-user-row">
              <span className="vl-user-avatar" aria-hidden="true">{initials}</span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate">{label}</strong>
                <small className="vl-user-handle">@{user.username}</small>
              </div>
              <span className="vl-role-pill">{roleBadgeLabel(user.role, say)}</span>
            </li>;
          })}</ul>}
      </div>
    </div>
  </section>;
}
