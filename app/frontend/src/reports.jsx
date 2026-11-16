import { useEffect, useRef, useState } from 'react';
import { useLocale } from './locale.jsx';
import { TerritoryFields } from './territory.jsx';

export function PhotoUploadArea({ photos, onChange, maxPhotos = 3, formal = false }) {
  const { say } = useLocale();
  const inputRef = useRef(null);
  const [feedback, setFeedback] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const slotHints = [
    say('1. Rostro / Frente', '1. Face / Front', '1. Gesicht / Vorne'),
    say('2. Cuerpo entero', '2. Full body', '2. Ganzer Körper'),
    say('3. Señas o collar', '3. Markings or collar', '3. Besondere Merkmale / Halsband'),
  ];

  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p?.preview) URL.revokeObjectURL(p.preview);
      });
    };
  }, []);

  function handleFiles(selectedFiles) {
    setFeedback('');
    if (!selectedFiles || selectedFiles.length === 0) return;
    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    for (const file of Array.from(selectedFiles)) {
      if (!allowedTypes.includes(file.type)) {
        setFeedback(say('Por favor seleccione únicamente imágenes en formato JPEG, PNG o WebP.',
          'Please select images in JPEG, PNG, or WebP format only.',
          'Bitte nur Bilder im JPEG-, PNG- oder WebP-Format auswählen.'));
        return;
      }
      if (file.size > maxSizeBytes) {
        setFeedback(say('Cada fotografía debe pesar menos de 5 MB.',
          'Each photo must be under 5 MB.',
          'Jedes Foto muss kleiner als 5 MB sein.'));
        return;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }

    const availableSlots = maxPhotos - photos.length;
    if (validFiles.length > availableSlots) {
      setFeedback(say(`Solo puede subir hasta ${maxPhotos} fotografías. Se conservaron las primeras ${maxPhotos}.`,
        `You can only upload up to ${maxPhotos} photos. The first ${maxPhotos} were kept.`,
        `Sie können nur bis zu ${maxPhotos} Fotos hochladen. Die ersten ${maxPhotos} wurden übernommen.`));
    }

    const nextPhotos = [...photos, ...validFiles.slice(0, availableSlots)];
    onChange(nextPhotos);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removePhoto(indexToRemove) {
    const target = photos[indexToRemove];
    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    setFeedback('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="vl-photo-field">
      <div className="vl-photo-header">
        <label className="vl-photo-label" htmlFor="vl-report-photos">
          {say('Fotografías del animalito', 'Photos of the animal', 'Fotos des Tieres')}{' '}
          <span className="vl-optional-badge">({say('opcional pero recomendado', 'optional but recommended', 'optional, aber empfohlen')})</span>
        </label>
        <span className="vl-photo-counter" aria-live="polite">
          {photos.length} {say('de', 'of', 'von')} {maxPhotos} {say('fotos', 'photos', 'Fotos')}
        </span>
      </div>

      <p className="vl-field-help">
        {say(formal ? 'Suba fotografías claras de la cara, cuerpo o marcas particulares para que su familia pueda reconocerlo.'
          : 'Subí fotografías claras de la cara, cuerpo o marcas particulares para que su familia pueda reconocerlo.',
          'Upload clear photos of the face, body, or markings to help their family recognize them.',
          'Laden Sie deutliche Fotos von Gesicht, Körper oder Merkmalen hoch, damit die Familie das Tier wiedererkennt.')}
      </p>

      <input
        ref={inputRef}
        id="vl-report-photos"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        className={`vl-photo-slots ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
      >
        {Array.from({ length: maxPhotos }).map((_, index) => {
          const item = photos[index];
          if (item) {
            return (
              <div key={item.preview || index} className="vl-photo-slot is-filled">
                <img
                  src={item.preview}
                  alt={say(`Fotografía ${index + 1} del animalito`, `Photo ${index + 1} of the animal`, `Foto ${index + 1} des Tieres`)}
                  className="vl-photo-thumb"
                />
                <span className="vl-slot-caption">{slotHints[index] || `#${index + 1}`}</span>
                <button
                  type="button"
                  className="vl-photo-remove"
                  onClick={() => removePhoto(index)}
                  title={say(`Eliminar fotografía ${index + 1}`, `Remove photo ${index + 1}`, `Foto ${index + 1} entfernen`)}
                  aria-label={say(`Eliminar fotografía ${index + 1}`, `Remove photo ${index + 1}`, `Foto ${index + 1} entfernen`)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              className="vl-photo-slot is-empty"
              onClick={() => inputRef.current?.click()}
              aria-label={say(`Agregar fotografía ${index + 1}: ${slotHints[index] || ''}`, `Add photo ${index + 1}: ${slotHints[index] || ''}`, `Foto ${index + 1} hinzufügen`)}
            >
              <div className="vl-slot-empty-content">
                <span className="vl-slot-icon" aria-hidden="true">📷</span>
                <span className="vl-slot-text">{slotHints[index] || `#${index + 1}`}</span>
                <span className="vl-slot-add-text">+ {say('Agregar', 'Add', 'Hinzufügen')}</span>
              </div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className="vl-photo-feedback" role="alert">
          ℹ️ {feedback}
        </p>
      )}
    </div>
  );
}

export function PrivateReportReply({ token, api, submit }) {
  const { say } = useLocale();
  const [available, setAvailable] = useState(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endpoint = `respuestas/${token}`;

  useEffect(() => {
    api(endpoint).then(() => setAvailable(true)).catch((failure) => {
      setAvailable(false);
      setError(failure.message);
    });
  }, [api, endpoint]);

  async function reply(event) {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await submit(endpoint, body);
      setSent(true);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel public-profile">
    <h1>{say('Responder al aviso', 'Reply to the report', 'Auf Meldung antworten')}</h1>
    {error && <p className="notice" role="alert">{error}</p>}
    {available === null && <p role="status">{say('Verificando el enlace…', 'Checking the link…', 'Link wird geprüft…')}</p>}
    {sent ? <p role="status">{say('Tu respuesta quedó registrada.', 'Your reply was recorded.', 'Deine Antwort wurde gespeichert.')}</p> : available && <form onSubmit={reply}>
      <p>{say('Escribí un mensaje para coordinar con la persona que envió el aviso.', 'Write a message to coordinate with the person who sent the report.', 'Schreib eine Nachricht, um dich mit der meldenden Person abzustimmen.')}</p>
      <label>{say('Respuesta', 'Reply', 'Antwort')}<textarea name="message" maxLength={2000} required /></label>
      <button disabled={busy}>{busy ? say('Guardando…', 'Saving…', 'Wird gespeichert…') : say('Enviar respuesta', 'Send reply', 'Antwort senden')}</button>
    </form>}
  </section>;
}

export function ReportForm({ kind, code, profile, api, submit, onSuccess, formal = false }) {
  const { say } = useLocale();
  const [catalog, setCatalog] = useState({ provinces: [], cantons: [], districts: [] });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const lost = kind === 'extravio';

  useEffect(() => {
    api('distritos').then(setCatalog).catch((failure) => setError(failure.message));
  }, [api]);

  async function save(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    photos.forEach((item) => {
      fields.append('photos[]', item.file);
    });
    if (photos.length > 0) {
      fields.append('photo', photos[0].file);
    }
    setError('');
    setBusy(true);
    try {
      await submit(code ? `ficha/${code}/hallazgo` : `avisos/${kind}`, fields);
      setSent(true);
      onSuccess?.();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel public-profile">
    <h1>{lost ? say('Reportar extravío', 'Report a missing animal', 'Vermisstes Tier melden') : say('Encontré a un animal', 'I found an animal', 'Ich habe ein Tier gefunden')}</h1>
    {profile && <p>{say('Vas a reportar el hallazgo de', 'You are reporting the finding of', 'Du meldest den Fund von')} <strong>{profile.name}</strong>.</p>}
    {error && <p className="notice" role="alert">{error}</p>}
    {sent ? <p role="status">{say('Tu aviso quedó registrado.', 'Your report was recorded.', 'Deine Meldung wurde gespeichert.')}</p> : <form onSubmit={save}>
      {!code && <>
        {lost && <label>{say('Nombre del animal', 'Animal name', 'Name des Tieres')}<input name="animal_name" maxLength={120} required /></label>}
        <label>{say('Especie', 'Species', 'Tierart')}<input type="text" readOnly value={say('🐶 Perro', '🐶 Dog', '🐶 Hund')} aria-readonly="true" /><input type="hidden" name="species" value="perro" /></label>
      </>}
      <TerritoryFields catalog={catalog} />
      <label>{say('Dirección exacta', 'Exact address', 'Genaue Adresse')}<input name="address" maxLength={255} required /></label>
      <label>{lost ? say(formal ? 'Cuéntenos cómo se extravió' : 'Contanos cómo se extravió', 'Tell us how the animal went missing', 'Beschreibe, wie das Tier verschwunden ist') : say(formal ? 'Cuéntenos qué observó' : 'Contanos qué observaste', 'Tell us what you observed', 'Beschreibe deine Beobachtung')}<textarea name="description" maxLength={2000} required /></label>
      <PhotoUploadArea photos={photos} onChange={setPhotos} maxPhotos={lost ? 1 : 3} formal={formal} />
      {!lost && <label>{say('Lugar donde está bajo resguardo (opcional)', 'Where the animal is being kept (optional)', 'Aufenthaltsort des Tieres (optional)')}<input name="shelter_address" maxLength={255} /></label>}
      <label>{lost ? say(formal ? 'Su nombre' : 'Tu nombre', 'Your name', 'Dein Name') : say(formal ? 'Su nombre (opcional)' : 'Tu nombre (opcional)', 'Your name (optional)', 'Dein Name (optional)')}<input name="contact_name" maxLength={120} required={lost} /></label>
      {lost && <p>{say(formal ? 'Indique al menos un correo o teléfono de contacto.' : 'Indicá al menos un correo o teléfono de contacto.', 'Provide at least an email address or phone number.', 'Gib mindestens eine E-Mail-Adresse oder Telefonnummer an.')}</p>}
      <label>{say('Correo electrónico', 'Email address', 'E-Mail-Adresse')}<input name="contact_email" type="email" maxLength={254} /></label>
      <p>{say(formal ? 'Si deja un correo, VitaLink puede gestionar una respuesta privada.' : 'Si dejás un correo, VitaLink puede gestionar una respuesta privada.', 'If you provide an email address, VitaLink can arrange a private reply.', 'Wenn du eine E-Mail-Adresse angibst, kann VitaLink eine private Antwort vermitteln.')}</p>
      <label>{say('Teléfono', 'Phone', 'Telefon')}<input name="contact_phone" type="tel" maxLength={40} /></label>
      <label className="flex items-start gap-2"><input className="mt-1 w-auto" type="checkbox" name="share_contact" value="1" /> {say('Autorizo compartir el contacto que dejé para coordinar el caso.', 'I agree to share my contact details to coordinate this case.', 'Ich stimme zu, meine Kontaktdaten zur Koordination dieses Falls weiterzugeben.')}</label>
      <p>{say('Los datos del aviso no aparecen en la ficha pública.', 'Report details do not appear on the public profile.', 'Meldungsdaten erscheinen nicht im öffentlichen Profil.')}</p>
      <button disabled={busy || catalog.districts.length === 0}>{busy ? say('Enviando…', 'Sending…', 'Wird gesendet…') : say('Enviar aviso', 'Send report', 'Meldung senden')}</button>
    </form>}
  </section>;
}

export function ReportInbox({ api, submit, animals }) {
  const { say } = useLocale();
  const [reports, setReports] = useState(null);
  const [canSimulateBounce, setCanSimulateBounce] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setError('');
    try {
      const data = await api('avisos');
      setReports(data.reports);
      setCanSimulateBounce(data.can_simulate_bounce);
    } catch (failure) {
      setError(failure.message);
    }
  }

  async function update(path, body) {
    setBusy(true);
    setError('');
    try {
      await submit(path, body);
      await refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel qr-panel">
    <h2>{say('Avisos recibidos', 'Received reports', 'Eingegangene Meldungen')}</h2>
    <button type="button" className="secondary" onClick={refresh}>{reports ? say('Actualizar avisos', 'Refresh reports', 'Meldungen aktualisieren') : say('Consultar avisos', 'View reports', 'Meldungen anzeigen')}</button>
    {error && <p role="alert">{error}</p>}
    {reports?.length === 0 && <p>{say('Sin avisos registrados.', 'No reports recorded.', 'Keine Meldungen vorhanden.')}</p>}
    {reports?.map((report) => <details key={report.id}>
      <summary>{report.kind === 'extravio' ? say('Extravío', 'Missing', 'Vermisst') : say('Hallazgo', 'Found', 'Gefunden')} · {report.linked_animal || report.animal_name || say('Perro', 'Dog', 'Hund')} · {report.district}</summary>
      <p>{report.address}</p><p>{report.description}</p>
      {((report.photos && report.photos.length > 0) || report.photo) && (
        <div className="my-2 flex flex-wrap gap-2">
          {(report.photos?.length ? report.photos : [report.photo]).map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noreferrer" title={say('Ver fotografía completa', 'View full photo', 'Vollbild anzeigen')}>
              <img
                className="h-24 w-24 rounded-lg object-cover border border-slate-200 shadow-sm hover:opacity-90 transition-opacity"
                src={url}
                alt={say(`Fotografía ${idx + 1} del aviso`, `Report photo ${idx + 1}`, `Foto ${idx + 1} der Meldung`)}
              />
            </a>
          ))}
        </div>
      )}
      {report.shelter_address && <p>{say('Resguardo', 'Current location', 'Aufenthaltsort')}: {report.shelter_address}</p>}
      {[report.contact_name, report.contact_email, report.contact_phone].filter(Boolean).length > 0 && <p>
        {say('Contacto interno', 'Internal contact', 'Interner Kontakt')}: {[report.contact_name, report.contact_email, report.contact_phone].filter(Boolean).join(' · ')}
        {report.share_contact === '1' || report.share_contact === 1 ? say(' (autorizado para coordinación)', ' (sharing authorized)', ' (Freigabe erteilt)') : say(' (privado)', ' (private)', ' (privat)')}
      </p>}
      {report.notifications.length > 0 && <div className="my-3 grid gap-2">
        <h3 className="font-bold">{say('Correo de demostración', 'Demo email', 'Demo-E-Mail')}</h3>
        {report.notifications.map((message) => <div key={message.id} className="rounded border p-2">
          <p>{message.subject}</p>
          <p>{say('Para', 'To', 'An')}: {message.recipient_email} · {message.bounced_at ? say('Rebotado', 'Bounced', 'Unzustellbar') : say('Capturado en el buzón local', 'Saved in the local mailbox', 'Im lokalen Postfach gespeichert')}</p>
          <p className="whitespace-pre-wrap">{message.body}</p>
          {message.reply_url && <a href={message.reply_url} target="_blank" rel="noreferrer">{say('Abrir enlace privado de respuesta', 'Open private reply link', 'Privaten Antwortlink öffnen')}</a>}
          {message.replied_at && <div className="mt-2 border-t pt-2">
            <p>{say('Respuesta capturada', 'Reply saved', 'Antwort gespeichert')} · {say('Para', 'To', 'An')}: {report.contact_email}</p>
            <p className="whitespace-pre-wrap">{message.reply_body}</p>
          </div>}
          {canSimulateBounce && message.recipient_type === 'owner' && !message.bounced_at && !message.replied_at &&
            <button className="secondary mt-2" type="button" disabled={busy}
              onClick={() => update(`notificaciones/${message.id}/rebote`)}>{say('Simular rebote', 'Simulate bounce', 'Unzustellbarkeit simulieren')}</button>}
        </div>)}
      </div>}
      {report.kind === 'extravio' && (report.resolved_at ? <p>{say('Extravío cerrado', 'Missing report closed', 'Vermisstenmeldung geschlossen')}</p> : <>
        {report.linked_animal ? <p>{say('Expediente vinculado', 'Linked record', 'Verknüpfte Tierakte')}: {report.linked_animal}</p> : <form onSubmit={(event) => {
          event.preventDefault();
          update(`avisos/${report.id}/vincular`, new FormData(event.currentTarget));
        }}>
          <label>{say('Expediente activo', 'Active record', 'Aktive Tierakte')}<select name="animal_id" required defaultValue="">
            <option value="" disabled>{say('Seleccioná el expediente', 'Choose a record', 'Tierakte auswählen')}</option>
            {animals.filter((animal) => animal.status === 'activo' && animal.species === report.species).map((animal) =>
              <option key={animal.id} value={animal.id}>{animal.name} · #{animal.id}</option>)}
          </select></label>
          <button disabled={busy}>{say('Vincular y marcar como extraviado', 'Link and mark as missing', 'Verknüpfen und als vermisst markieren')}</button>
        </form>}
        <button className="secondary mt-2" type="button" disabled={busy} onClick={() => update(`avisos/${report.id}/cerrar`)}>{say('Cerrar extravío', 'Close missing report', 'Vermisstenmeldung schließen')}</button>
      </>)}
    </details>)}
  </section>;
}
