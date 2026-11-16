import { useEffect, useState } from 'react';
import dog1Photo from './assets/adopciones/dog1.jpeg';
import dog2Photo from './assets/adopciones/dog2.jpeg';
import dog3Photo from './assets/adopciones/dog3.jpeg';
import dog4Photo from './assets/adopciones/dog4.jpeg';
import dog5Photo from './assets/adopciones/dog5.jpeg';
import dog6Photo from './assets/adopciones/dog6.jpeg';
import dog7Photo from './assets/adopciones/dog7.jpeg';
import dog8Photo from './assets/adopciones/dog8.jpeg';
import dog9Photo from './assets/adopciones/dog9.jpeg';
import dog10Photo from './assets/adopciones/dog10.jpeg';
import { useLocale } from './locale.jsx';

export const DEMO_ADOPTION_PROFILES = [
  {
    code: '3eb07ed1e84c6d91efe0d2685f7ac7fc',
    name: 'Mora',
    species: 'perro',
    age_label: '2 años · noble y leal',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Catedral',
    story: 'Historia de rescate (demo): Mora fue encontrada bajo un puente peatonal en Catedral después de un fuerte aguacero, buscando comida y refugio. Con atención veterinaria y cariño recuperó toda su alegría. Hoy luce su collar verde con orgullo y sueña con una familia que la lleve a caminar cada tarde.',
    photo: dog1Photo,
    fallback_photo: dog1Photo,
    is_demo: 1,
  },
  {
    code: 'a7e624689a472f019e4a08432937230d',
    name: 'Zorro',
    species: 'perro',
    age_label: '2 años · alegre y energético',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Carmen',
    story: 'Historia de rescate (demo): A Zorro lo rescataron cerca de un parque en el distrito Carmen mientras seguía a los transeúntes moviendo su cola esponjosa. Es un compañero vivaz de pelaje rojizo que disfruta jugar al aire libre y recibir caricias después de cada paseo.',
    photo: dog2Photo,
    fallback_photo: dog2Photo,
    is_demo: 1,
  },
  {
    code: '7dba0760b9c344ef5b7a04a7e14862f7',
    name: 'Lucas',
    species: 'perro',
    age_label: '5 meses · juguetón y fiel',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Zapote',
    story: 'Historia de rescate (demo): Lucas apareció solito cerca de una cancha en Zapote cuando apenas tenía tres meses. Fue resguardado de inmediato y ya cuenta con sus vacunas al día. Le encanta correr tras pelotas suaves y quedarse dormido junto a quien lo cuida.',
    photo: dog5Photo,
    fallback_photo: dog5Photo,
    is_demo: 1,
  },
  {
    code: '93d2a1518e4b923b74e308c95b6a9721',
    name: 'Oso',
    species: 'perro',
    age_label: '4 meses · tierno y curioso',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Catedral',
    story: 'Historia de rescate (demo): Oso fue rescatado junto a su camada en un lote baldío de Catedral. Este cachorrito de pelaje oscuro y patitas color fuego observa todo con curiosidad y adora explorar jardines tranquilos antes de acurrucarse en una cobija tibia.',
    photo: dog3Photo,
    fallback_photo: dog3Photo,
    is_demo: 1,
  },
  {
    code: '6ec61bf971a337b2e53c9df0a6eb724c',
    name: 'Pirata',
    species: 'perro',
    age_label: '3 años · sociable y aventurero',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Carmen',
    story: 'Historia de rescate (demo): Pirata, distinguido por la mancha canela en su ojito, sobrevivió varios meses en calles del Carmen hasta que una vecina avisó al albergue. Es muy sociable con personas y disfruta pasear con correa bajo el sol de la mañana.',
    photo: dog6Photo,
    fallback_photo: dog6Photo,
    is_demo: 1,
  },
  {
    code: '25f36230c685116a795f8eaa5b15a64f',
    name: 'Miel',
    species: 'perro',
    age_label: '1 año · dulce y afectuosa',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Zapote',
    story: 'Historia de rescate (demo): Miel fue encontrada desorientada y con su pelaje rizado enredado tras una tormenta en Zapote. Después de un baño tibio y revisión veterinaria, mostró su carácter sumamente tierno. Busca un hogar sereno donde compartir siestas sobre el césped.',
    photo: dog7Photo,
    fallback_photo: dog7Photo,
    is_demo: 1,
  },
  {
    code: '06ace4bec68f5559e2ed122b374ed304',
    name: 'Bruno',
    species: 'perro',
    age_label: '4 meses · dócil y protector',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Catedral',
    story: 'Historia de rescate (demo): Bruno llegó al albergue desde Catedral siendo muy pequeño y tímido, pero en pocas semanas se volvió un cachorro atento y muy dócil. Le gusta sentarse tranquilo a escuchar a las personas y esperar pacientemente su premio.',
    photo: dog4Photo,
    fallback_photo: dog4Photo,
    is_demo: 1,
  },
  {
    code: '025a3ef608c7c16593a2a784dc697de1',
    name: 'Barón',
    species: 'perro',
    age_label: '4 años · sereno y compañero',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Carmen',
    story: 'Historia de rescate (demo): Barón fue abandonado frente a un portón en el distrito Carmen, donde esperó en calma hasta ser auxiliado. Es un perro adulto de porte noble que cruza sus patitas para descansar y resulta ideal para una familia que busque paz y lealtad.',
    photo: dog8Photo,
    fallback_photo: dog8Photo,
    is_demo: 1,
  },
  {
    code: '3856b3f811dbb6b95a704077792b920f',
    name: 'Pecas',
    species: 'perro',
    age_label: '3 meses · curioso y cariñoso',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Zapote',
    story: 'Historia de rescate (demo): Pecas, llamado así por las simpáticas manchitas de su hocico y sus patas blancas, fue hallado dentro de una caja en Zapote. Hoy crece sano y fuerte, siempre dispuesto a jugar en el patio y regalar lamidas de cariño.',
    photo: dog9Photo,
    fallback_photo: dog9Photo,
    is_demo: 1,
  },
  {
    code: '38d3f4a70568deb019c8b66525b3849e',
    name: 'Roco',
    species: 'perro',
    age_label: '3 meses · valiente y mimoso',
    shelter_name: 'Albergue de demostración',
    province: 'San José',
    canton: 'San José',
    district: 'Catedral',
    story: 'Historia de rescate (demo): Roco apareció buscando abrigo cerca de una parada de autobús en Catedral. Aunque era el más pequeñito del grupo, demostró una valentía enorme al recuperarse por completo. Hoy espera una familia que lo vea crecer con amor.',
    photo: dog10Photo,
    fallback_photo: dog10Photo,
    is_demo: 1,
  },
];

export function resolveDemoPhoto(profile) {
  const byName = DEMO_ADOPTION_PROFILES.find((item) => item.name === profile.name);
  return profile.photo || byName?.fallback_photo || (Number(profile.is_demo) === 1 ? dog1Photo : null);
}

export function AdoptionApplyForm({ profile, submit, onSuccess }) {
  const { say } = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function apply(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await submit(`adopciones/${profile.code}/solicitudes`, new FormData(event.currentTarget));
      onSuccess();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="vl-apply-form">
    <p>{say('Solicitud para adoptar a', 'Application to adopt', 'Adoptionsanfrage für')} <strong>{profile.name}</strong> · {profile.shelter_name}</p>
    {error && <p role="alert" className="notice">{error}</p>}
    <form onSubmit={apply}>
      <label>{say('Nombre', 'Name', 'Name')}<input name="name" maxLength={120} required /></label>
      <label>{say('Correo electrónico', 'Email address', 'E-Mail-Adresse')}<input name="email" type="email" maxLength={254} required /></label>
      <label>{say('Teléfono (opcional)', 'Phone (optional)', 'Telefon (optional)')}<input name="phone" type="tel" maxLength={40} /></label>
      <label>{say('Cuéntenos por qué desea adoptar', 'Tell us why you want to adopt', 'Erzählen Sie uns, warum Sie adoptieren möchten')}<textarea name="message" maxLength={2000} required /></label>
      <p>{say('Solo el equipo autorizado puede consultar su solicitud.', 'Only authorized staff can view your application.', 'Nur berechtigte Mitarbeitende können Ihre Anfrage sehen.')}</p>
      <button disabled={busy}>{busy ? say('Enviando…', 'Sending…', 'Wird gesendet…') : say('Enviar solicitud', 'Send application', 'Anfrage senden')}</button>
    </form>
  </div>;
}

export function AdoptionGallery({ code, api, submit }) {
  const { say } = useLocale();
  const [profiles, setProfiles] = useState(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const selected = profiles?.find((profile) => profile.code === code);

  useEffect(() => {
    api('adopciones')
      .then((data) => setProfiles(data.profiles))
      .catch(() => setProfiles(DEMO_ADOPTION_PROFILES));
  }, [api]);

  async function apply(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setError('');
    setBusy(true);
    try {
      await submit(`adopciones/${code}/solicitudes`, fields);
      setSent(true);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section>
    <h1>{code ? say('Quiero adoptar', 'I want to adopt', 'Ich möchte adoptieren') : say('Compañeros animales en adopción', 'Animals for adoption', 'Tiere zur Adoption')}</h1>
    {error && <p className="notice" role="alert">{error}</p>}
    {!profiles && !error && <p role="status">{say('Cargando perfiles…', 'Loading profiles…', 'Profile werden geladen…')}</p>}
    {code ? <article className="panel public-profile">
      <a href="/adopciones">{say('Volver a adopciones', 'Back to adoptions', 'Zurück zu Adoptionen')}</a>
      {selected ? <><h2>{selected.name}</h2><p>{selected.shelter_name}</p>
        {sent ? <p role="status">{say('Tu solicitud quedó registrada. El equipo puede revisarla.', 'Your application was recorded. Our team can review it.', 'Deine Anfrage wurde gespeichert. Unser Team kann sie prüfen.')}</p> : <form onSubmit={apply}>
          <label>{say('Nombre', 'Name', 'Name')}<input name="name" maxLength={120} required /></label>
          <label>{say('Correo electrónico', 'Email address', 'E-Mail-Adresse')}<input name="email" type="email" maxLength={254} required /></label>
          <label>{say('Teléfono (opcional)', 'Phone (optional)', 'Telefon (optional)')}<input name="phone" type="tel" maxLength={40} /></label>
          <label>{say('Contanos por qué querés adoptar', 'Tell us why you want to adopt', 'Erzähl uns, warum du adoptieren möchtest')}<textarea name="message" maxLength={2000} required /></label>
          <p>{say('Solo el equipo autorizado puede consultar tu solicitud.', 'Only authorized staff can view your application.', 'Nur berechtigte Mitarbeitende können deine Anfrage sehen.')}</p>
          <button disabled={busy}>{busy ? say('Enviando…', 'Sending…', 'Wird gesendet…') : say('Enviar solicitud', 'Send application', 'Anfrage senden')}</button>
        </form>}
      </> : profiles && <p>{say('Este perfil ya no está disponible para adopción.', 'This profile is no longer available for adoption.', 'Dieses Tier steht nicht mehr zur Adoption.')}</p>}
    </article> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {profiles?.length === 0 && <p>{say('Por ahora no hay perfiles disponibles.', 'No profiles are available right now.', 'Zurzeit sind keine Profile verfügbar.')}</p>}
      {profiles?.map((profile) => {
        const demo = Number(profile.is_demo) === 1;
        const photo = resolveDemoPhoto(profile);
        return <article className="panel grid content-start gap-2" key={profile.code}>
          {photo && <img className="aspect-[4/3] w-full rounded-lg object-cover" src={photo}
            alt={profile.photo ? `${say('Foto de', 'Photo of', 'Foto von')} ${profile.name}` : say('Foto ilustrativa de un perro', 'Illustrative photo of a dog', 'Beispielfoto eines Hundes')} />}
          {demo && <p className="eyebrow">{say('Perfil de demostración', 'Demo profile', 'Demoprofil')}</p>}
          <h2>{profile.name}</h2>
          <p>{profile.age_label} · {profile.shelter_name}</p>
          <p>{profile.province} · {profile.canton} · {profile.district}</p>
          <details><summary>{say('Conocé su historia', 'Read their story', 'Lerne ihre Geschichte kennen')}</summary><p className="whitespace-pre-wrap">{profile.story}</p></details>
          <a className="button justify-self-start" href={`/adopciones/${profile.code}`}>{say('Quiero adoptar', 'I want to adopt', 'Ich möchte adoptieren')}</a>
        </article>;
      })}
    </div>}
  </section>;
}

export function AdoptionManagement({ api, submit, animals }) {
  const { say } = useLocale();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const current = data?.profiles.find((profile) => String(profile.animal_id) === selected);

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      if (action) await action();
      setData(await api('gestion/adopciones'));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel qr-panel">
    <h2>{say('Gestión de adopciones', 'Manage adoptions', 'Adoptionen verwalten')}</h2>
    <a href="/adopciones">{say('Ver galería pública', 'View public gallery', 'Öffentliche Galerie ansehen')}</a>
    <button className="secondary" type="button" disabled={busy} onClick={() => run()}>{data ? say('Actualizar adopciones', 'Refresh adoptions', 'Adoptionen aktualisieren') : say('Consultar adopciones', 'View adoptions', 'Adoptionen anzeigen')}</button>
    {error && <p role="alert">{error}</p>}
    {data && <>
      <label>{say('Expediente activo de albergue', 'Active shelter record', 'Aktive Tierheimakte')}<select value={selected} onChange={(event) => setSelected(event.target.value)}>
        <option value="">{say('Seleccioná el expediente', 'Choose a record', 'Tierakte auswählen')}</option>
        {animals.filter((animal) => animal.status === 'activo' && animal.living_condition === 'albergue').map((animal) =>
          <option key={animal.id} value={animal.id}>{animal.name} · #{animal.id}</option>)}
      </select></label>
      {selected && <form key={`${selected}-${current?.published ?? ''}`} onSubmit={(event) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        run(() => submit(`gestion/adopciones/${selected}/publicar`, fields));
      }}>
        <label>{say('Albergue', 'Shelter', 'Tierheim')}<input name="shelter_name" maxLength={120} defaultValue={current?.shelter_name} required /></label>
        <label>{say('Edad aproximada', 'Approximate age', 'Ungefähres Alter')}<input name="age_label" maxLength={80} defaultValue={current?.age_label} required /></label>
        <label>{say('Historia', 'Story', 'Geschichte')}<textarea name="story" maxLength={2000} defaultValue={current?.story} required /></label>
        <button disabled={busy}>{say('Publicar perfil', 'Publish profile', 'Profil veröffentlichen')}</button>
        {Number(current?.published) === 1 && <button className="secondary" type="button" disabled={busy}
          onClick={() => run(() => submit(`gestion/adopciones/${selected}/retirar`))}>{say('Retirar perfil', 'Unpublish profile', 'Profil zurückziehen')}</button>}
      </form>}
      <h3 className="font-bold">{say('Solicitudes recibidas', 'Applications received', 'Eingegangene Anfragen')}</h3>
      {data.requests.length === 0 && <p>{say('Sin solicitudes registradas.', 'No applications recorded.', 'Keine Anfragen vorhanden.')}</p>}
      {data.requests.map((request) => <details key={request.id}>
        <summary>{request.animal_name} · {request.name}</summary>
        <p>{[request.email, request.phone].filter(Boolean).join(' · ')}</p>
        <p className="whitespace-pre-wrap">{request.message}</p>
      </details>)}
    </>}
  </section>;
}
