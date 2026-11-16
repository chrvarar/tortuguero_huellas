import { useEffect, useId, useRef, useState } from 'react';
import { LOGO_DATA_URI as logo, REGISTRO_DATA_URI as registrationImage } from './logo-data.js';
import poster from './assets/pets1.jpeg';
import collarPhoto from './assets/pets2-cutout.png';
import lostCollarPhoto from './assets/pets1-cutout.png';
import team from './assets/colaboradores4.jpeg';
import fieldwork from './assets/colaboradores5.jpeg';
import surgerySupport from './assets/colaboradores1.jpeg';
import sampleDog from './assets/adopciones/dog1.jpeg';
import registrationHoverImage from './assets/registro-hover.png';
import foundImage from './assets/encontrado.png';
import foundHoverImage from './assets/encontrado-hover.png';
import missingImage from './assets/perdido.png';
import missingHoverImage from './assets/perdido-hover.png';
import { FlagLanguageSelect, useLocale } from './locale.jsx';
import { ReportForm } from './reports.jsx';
import { AdoptionApplyForm, DEMO_ADOPTION_PROFILES, resolveDemoPhoto } from './adoptions.jsx';
import { PawCircle } from './splash.jsx';
import './landing.css';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Hero({ openModal }) {
  const { say } = useLocale();

  return <><section className="vl-hero" aria-labelledby="hero-title">
    <img src={poster} className="vl-hero-media" alt="" fetchPriority="high" />
    <div className="vl-hero-copy">
      <p className="vl-kicker">{say('COSTA RICA · BIENESTAR ANIMAL', 'COSTA RICA · ANIMAL WELFARE', 'COSTA RICA · TIERSCHUTZ')}</p>
      <h1 id="hero-title">Tortuguero <span>Huellas</span></h1>
      <p className="vl-hero-subtitle">{say('Identificación y bienestar animal en Costa Rica', 'Animal identification and welfare in Costa Rica', 'Tierkennzeichnung und Tierschutz in Costa Rica')}</p>
      <p>{say('Una identidad para cada compañero animal.', 'An identity for every animal companion.', 'Eine Identität für jedes Haustier.')}</p>
    </div>
  </section>
    <div className="vl-primary-actions" aria-label={say('Acciones principales', 'Main actions', 'Hauptaktionen')}>
      <button type="button" onClick={() => openModal('registro')}>
        <span className="vl-action-art" aria-hidden="true">
          <img src={registrationImage} className="vl-art-base" alt="" />
          <img src={registrationHoverImage} className="vl-art-hover" alt="" />
        </span>
        <strong>{say('Registrar a mi compañero animal', 'Register my animal companion', 'Mein Haustier registrieren')}</strong>
      </button>
      <button type="button" onClick={() => openModal('hallazgo')}>
        <span className="vl-action-art" aria-hidden="true">
          <img src={foundImage} className="vl-art-base" alt="" />
          <img src={foundHoverImage} className="vl-art-hover" alt="" />
        </span>
        <strong>{say('Encontré a un compañero animal', 'I found an animal companion', 'Ich habe ein Haustier gefunden')}</strong>
      </button>
      <button type="button" onClick={() => openModal('extravio')}>
        <span className="vl-action-art" aria-hidden="true">
          <img src={missingImage} className="vl-art-base" alt="" />
          <img src={missingHoverImage} className="vl-art-hover" alt="" />
        </span>
        <strong>{say('Mi compañero animal se extravió', 'My animal companion is missing', 'Mein Haustier wird vermisst')}</strong>
      </button>
    </div>
  </>;
}

function Footprints() {
  const durations = [3.4, 4.6, 5.2, 4.0];
  const delays = [0, 0.9, 1.8, 2.7];
  const angles = [-28, 22, -16, 32];
  const [positions, setPositions] = useState(Array(durations.length).fill(null));
  const positionsRef = useRef([]);
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  function place(index, firstPlacement = false) {
    const main = document.querySelector('#contenido');
    const sections = ['guia', 'adopcion', 'comunidad', 'organizaciones']
      .map((id) => document.getElementById(id)).filter(Boolean);
    if (!main || !sections.length) return;

    const mainBox = main.getBoundingClientRect();
    const viewHeight = window.innerHeight || 800;
    const pawSize = Math.min(74, Math.max(45, window.innerWidth * 0.05));
    const pad = 12;
    const occupied = positionsRef.current.filter((position, other) => other !== index && position);

    const visibleSections = sections.filter((section) => {
      const rect = section.getBoundingClientRect();
      const overlap = Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0);
      return overlap > pawSize * 1.5;
    });
    const pool = !firstPlacement && !scrollingRef.current && visibleSections.length
      ? visibleSections
      : sections;

    let chosen = null;
    let bestDistance = -Infinity;
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const useVisibleWindow = !firstPlacement && !scrollingRef.current && visibleSections.length;
      const section = firstPlacement && attempt === 0
        ? sections[index % sections.length]
        : pool[Math.floor(Math.random() * pool.length)];
      const box = section.getBoundingClientRect();

      const minX = box.left + pad;
      const maxX = box.right - pawSize - pad;
      const vpX = maxX > minX
        ? minX + Math.random() * (maxX - minX)
        : box.left;

      let minY = box.top + pad;
      let maxY = box.bottom - pawSize - pad;
      if (useVisibleWindow) {
        const clampedTop = Math.max(box.top + pad, pad);
        const clampedBottom = Math.min(box.bottom - pawSize - pad, viewHeight - pawSize - pad);
        if (clampedBottom > clampedTop) {
          minY = clampedTop;
          maxY = clampedBottom;
        }
      }
      const vpY = maxY > minY
        ? minY + Math.random() * (maxY - minY)
        : minY;

      const x = vpX - mainBox.left;
      const y = vpY - mainBox.top;

      const distance = occupied.length
        ? Math.min(...occupied.map((position) => Math.hypot(x - position.x, y - position.y)))
        : pawSize * 4;
      if (distance > bestDistance) {
        bestDistance = distance;
        chosen = { x, y, angle: angles[index] + Math.round(Math.random() * 40 - 20) };
      }
      if (distance >= pawSize * 1.8) break;
    }
    positionsRef.current[index] = chosen;
    setPositions([...positionsRef.current]);
  }

  useEffect(() => {
    const reset = () => {
      positionsRef.current = [];
      for (let index = 0; index < durations.length; index += 1) place(index, true);
    };
    const onScroll = () => {
      scrollingRef.current = true;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        scrollingRef.current = false;
      }, 180);
    };
    reset();
    window.addEventListener('resize', reset);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', reset);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  return <div className="vl-paws" aria-hidden="true">{positions.map((position, index) =>
    <i key={index} style={{ left: position?.x, top: position?.y, '--life': `${durations[index]}s`,
      '--delay': `${delays[index]}s`,
      '--angle': `${position?.angle ?? angles[index]}deg`,
      visibility: position ? 'visible' : 'hidden' }} onAnimationIteration={() => place(index)} />)}</div>;
}

function AdoptionCard({ profile, onStory, openModal, isClone = false, reduced = false }) {
  const { say } = useLocale();
  const [flipStep, setFlipStep] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [imgFallback, setImgFallback] = useState(false);
  const frontToggleRef = useRef(null);
  const backToggleRef = useRef(null);
  const flipTimerRef = useRef(null);
  const storyId = useId();
  const flipped = flipStep % 2 === 1;
  const demo = Number(profile.is_demo) === 1;
  const fallbackAsset = DEMO_ADOPTION_PROFILES.find((item) => item.name === profile.name)?.fallback_photo || sampleDog;
  const image = imgFallback ? fallbackAsset : resolveDemoPhoto(profile);

  useEffect(() => () => {
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
  }, []);

  function toggleStory() {
    const nextStep = flipStep + 1;
    const nextFlipped = nextStep % 2 === 1;
    const focusedFront = document.activeElement === frontToggleRef.current;
    const focusedBack = document.activeElement === backToggleRef.current;
    onStory(profile.code, nextFlipped);
    setFlipStep(nextStep);
    if (!reduced) {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      const startLift = () => {
        setFlipping(true);
        flipTimerRef.current = setTimeout(() => setFlipping(false), 700);
      };
      if (flipping) {
        setFlipping(false);
        requestAnimationFrame(startLift);
      } else {
        startLift();
      }
    }
    if (nextFlipped && focusedFront) {
      requestAnimationFrame(() => backToggleRef.current?.focus({ preventScroll: true }));
    } else if (!nextFlipped && focusedBack) {
      requestAnimationFrame(() => frontToggleRef.current?.focus({ preventScroll: true }));
    }
  }

  return <article
    className={`vl-adopt-card ${flipped ? 'has-flipped' : ''} ${flipping ? 'is-flipping' : ''}`}
    style={{ '--vl-flip-deg': `${flipStep * 180}deg`, '--vl-icon-deg': `${flipStep * 180}deg` }}
    aria-hidden={isClone ? 'true' : undefined}
    inert={isClone}
  >
    <div className="vl-card-scene">
      <div className="vl-card-lift">
        <div className={`vl-card-inner ${flipped ? 'is-flipped' : ''}`}>
          <div className="vl-card-front" aria-hidden={flipped || undefined} inert={flipped}>
            <div className="vl-card-media">
              {image ? <img src={image} alt={profile.photo ? `Foto de ${profile.name}` : 'Foto ilustrativa de un perro'} loading="lazy" draggable={false} onError={() => { if (!imgFallback) setImgFallback(true); }} />
                : <div className="vl-card-placeholder" aria-hidden="true">Tortuguero Huellas</div>}
              <span className="vl-species-badge">{`🐶 ${say('Perro', 'Dog', 'Hund')}`}</span>
            </div>
            <div className="vl-card-copy">
              {demo && <p className="vl-kicker">{say('PERFIL DE DEMOSTRACIÓN', 'DEMO PROFILE', 'DEMOPROFIL')}</p>}
              <h3>{profile.name}</h3>
              <p className="vl-card-meta">{profile.age_label} · {profile.shelter_name}</p>
              <p className="vl-card-location">📍 {profile.province} · {profile.canton} · {profile.district}</p>
              <button type="button" className="vl-button" onClick={() => openModal('adopcion', profile)}>{say('Quiero adoptar', 'I want to adopt', 'Ich möchte adoptieren')}</button>
            </div>
            <button ref={frontToggleRef} className="vl-story" type="button" aria-expanded={flipped} aria-controls={storyId} onClick={toggleStory}>
              <span>{say('Conozca su historia', 'Read their story', 'Geschichte lesen')}</span>
              <span className="vl-story-icon" aria-hidden="true">↻</span>
            </button>
          </div>
          <div id={storyId} className="vl-card-back" aria-hidden={!flipped || undefined} inert={!flipped}>
            <div className="vl-card-back-body">
              <div className="vl-card-back-head">
                {image && <img src={image} alt="" className="vl-card-back-avatar" aria-hidden="true" />}
                <div>
                  <p className="vl-kicker">{say('CONOZCA SU HISTORIA', 'READ THEIR STORY', 'LIES DIE GESCHICHTE')}</p>
                  <h3>{profile.name}</h3>
                </div>
              </div>
              <p className="vl-card-story-text whitespace-pre-wrap">{profile.story}</p>
              <button type="button" className="vl-button vl-card-back-cta" onClick={() => openModal('adopcion', profile)}>
                {say('Darle un hogar', 'Give them a home', 'Ein Zuhause schenken')} ♥
              </button>
            </div>
            <button ref={backToggleRef} className="vl-story vl-story-back" type="button" aria-expanded={flipped} aria-controls={storyId} onClick={toggleStory}>
              <span>{say('Volver a la ficha', 'Back to profile', 'Zurück zum Profil')}</span>
              <span className="vl-story-icon" aria-hidden="true">↻</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>;
}

function AdoptionCarousel({ api, reduced, openModal }) {
  const { say } = useLocale();
  const [profiles, setProfiles] = useState(null);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [openStories, setOpenStories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const track = useRef(null);
  const drag = useRef(null);
  const indexRef = useRef(0);
  const animFrameRef = useRef(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    api('adopciones')
      .then((data) => {
        if (Array.isArray(data?.profiles) && data.profiles.length === 1 && data.profiles[0]?.name === 'Mora' && Number(data.profiles[0]?.is_demo) === 1) {
          const merged = [
            { ...DEMO_ADOPTION_PROFILES[0], ...data.profiles[0], story: DEMO_ADOPTION_PROFILES[0].story, age_label: DEMO_ADOPTION_PROFILES[0].age_label },
            ...DEMO_ADOPTION_PROFILES.slice(1),
          ];
          setProfiles(merged);
        } else {
          setProfiles(data.profiles);
        }
      })
      .catch(() => setProfiles(DEMO_ADOPTION_PROFILES));
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [api]);

  function getStep(element) {
    if (!element || element.children.length < 2) return 0;
    return element.children[1].offsetLeft - element.children[0].offsetLeft;
  }

  function animateScrollTo(element, targetLeft, duration = 850, onComplete) {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const startLeft = element.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) {
      element.scrollLeft = targetLeft;
      animatingRef.current = false;
      onComplete?.();
      return;
    }
    animatingRef.current = true;
    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function stepFrame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      element.scrollLeft = startLeft + distance * easeInOutCubic(progress);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(stepFrame);
      } else {
        element.scrollLeft = targetLeft;
        animatingRef.current = false;
        animFrameRef.current = null;
        onComplete?.();
      }
    }
    animFrameRef.current = requestAnimationFrame(stepFrame);
  }

  function scrollToIndex(targetIndex) {
    const element = track.current;
    const count = profiles?.length ?? 0;
    if (!element || count < 1) return;
    const normalized = ((targetIndex % count) + count) % count;
    const step = getStep(element);
    animateScrollTo(element, normalized * step, 850);
    indexRef.current = normalized;
    setActiveIndex(normalized);
  }

  function advance(direction) {
    const element = track.current;
    const count = profiles?.length ?? 0;
    if (!element || count < 2) return;
    const step = getStep(element);
    if (step <= 0) return;
    const setWidth = count * step;

    if (direction > 0) {
      const nextRaw = indexRef.current + 1;
      const nextMod = nextRaw % count;
      setActiveIndex(nextMod);
      indexRef.current = nextRaw;
      animateScrollTo(element, nextRaw * step, 850, () => {
        if (indexRef.current >= count) {
          indexRef.current = nextMod;
          element.scrollLeft = nextMod * step;
        }
      });
    } else {
      if (indexRef.current === 0) {
        element.scrollLeft = setWidth;
        indexRef.current = count;
      }
      const prevRaw = indexRef.current - 1;
      const prevMod = ((prevRaw % count) + count) % count;
      setActiveIndex(prevMod);
      indexRef.current = prevMod;
      animateScrollTo(element, prevRaw * step, 850);
    }
  }

  useEffect(() => {
    if (paused || focused || dragging || openStories.length || (profiles?.length ?? 0) < 2) return;
    const timer = setInterval(() => advance(1), 4000);
    return () => clearInterval(timer);
  }, [paused, focused, dragging, openStories, profiles]);

  function startDrag(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a,button,.vl-card-story-text')
      || track.current.scrollWidth <= track.current.clientWidth) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animatingRef.current = false;
    drag.current = { x: event.clientX, left: track.current.scrollLeft };
    track.current.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  return <section className="vl-section vl-adoption" id="adopcion" aria-labelledby="adopcion-title">
    <div className="vl-section-head">
      <div><p className="vl-kicker">03 / {say('ADOPCIÓN', 'ADOPTION', 'ADOPTION')}</p><h2 id="adopcion-title">{say('Compañeros animales en adopción', 'Animals waiting for a home', 'Tiere, die ein Zuhause suchen')}</h2></div>
      <a className="vl-text-link vl-view-all" href="/adopciones">{say('Ver todos los perfiles', 'See all profiles', 'Alle Profile ansehen')} <span aria-hidden="true">↗</span></a>
    </div>
    <p className="vl-section-intro">{say('Conozca a quienes esperan un hogar y descubra su historia. Gire cada tarjeta para leer cómo fueron rescatados.', 'Meet the animals waiting for a home and discover their stories. Flip each card to read how they were rescued.', 'Lerne die Tiere kennen, die auf ein Zuhause warten, und entdecke ihre Geschichten.')}</p>
    {!profiles ? <p role="status">{say('Cargando perfiles…', 'Loading profiles…', 'Profile werden geladen…')}</p>
      : profiles.length === 0 ? <p>{say('Por ahora no hay perfiles disponibles.', 'There are no profiles available right now.', 'Derzeit sind keine Profile verfügbar.')}</p> : <div
        className="vl-carousel-stage">
        {profiles.length > 1 && <div className="vl-carousel-toolbar">
          <div className="vl-carousel-controls" aria-label="Controles de la galería">
            <button type="button" aria-label={say('Tarjeta anterior', 'Previous card', 'Vorherige Karte')} onClick={() => advance(-1)}>←</button>
            <button type="button" aria-label={say('Tarjeta siguiente', 'Next card', 'Nächste Karte')} onClick={() => advance(1)}>→</button>
            <button type="button" className="vl-carousel-pause" onClick={() => setPaused(!paused)}>{paused ? say('Reanudar', 'Resume', 'Fortsetzen') : say('Pausar', 'Pause', 'Pausieren')}</button>
          </div>
          <div className="vl-carousel-dots" aria-hidden="true">
            {profiles.map((item, idx) => <span key={item.code} className={`vl-dot ${idx === activeIndex ? 'is-active' : ''}`} onClick={() => scrollToIndex(idx)} />)}
          </div>
        </div>}
        <div ref={track} className={`vl-carousel ${dragging ? 'is-dragging' : ''}`}
          onScroll={(event) => {
            if (animatingRef.current) return;
            const el = event.currentTarget;
            const step = getStep(el);
            const count = profiles.length;
            if (step > 0 && count > 1) {
              const setWidth = count * step;
              if (el.scrollLeft >= setWidth) {
                el.scrollLeft -= setWidth;
              }
              const computed = ((Math.round(el.scrollLeft / step) % count) + count) % count;
              indexRef.current = computed;
              setActiveIndex(computed);
            }
          }}
          onFocus={() => setFocused(true)} onBlur={(event) => setFocused(event.currentTarget.contains(event.relatedTarget))}
          onTouchStart={() => setPaused(true)} onPointerDown={startDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
          onLostPointerCapture={endDrag} onPointerMove={(event) => {
            if (drag.current) track.current.scrollLeft = drag.current.left + drag.current.x - event.clientX;
          }}>
          {profiles.map((profile) => <AdoptionCard key={profile.code} profile={profile} reduced={reduced} openModal={openModal} onStory={(code, open) => {
            setOpenStories((stories) => open ? [...stories, code] : stories.filter((item) => item !== code));
          }} />)}
          {profiles.length > 1 && profiles.map((profile) => <AdoptionCard key={`clone-${profile.code}`} profile={profile} isClone reduced={reduced} openModal={openModal} onStory={(code, open) => {
            setOpenStories((stories) => open ? [...stories, code] : stories.filter((item) => item !== code));
          }} />)}
        </div>
      </div>}
  </section>;
}

function AccessForm({ kind, intent, submit, onSwitch, onNavigate }) {
  const { say } = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState(null);
  const registration = kind === 'registro';

  async function save(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (registration && fields.password !== fields.password_confirmation) {
      setError(say('Las contraseñas no coinciden.', 'Passwords do not match.', 'Die Passwörter stimmen nicht überein.'));
      setErrorField('password_confirmation');
      return;
    }
    setBusy(true);
    setError('');
    setErrorField(null);
    try {
      await submit(registration ? 'registro' : 'sesion', JSON.stringify({
        ...fields, ...(!registration ? { remember: fields.remember === 'on' } : {}),
      }));
      const target = intent === 'animal' ? '/ingresar?registrar-animal=1' : '/ingresar';
      if (onNavigate) onNavigate(target);
      else location.assign(target);
    } catch (failure) {
      setError(failure.message);
      setErrorField(failure.field ?? null);
      setBusy(false);
    }
  }

  return <div className="vl-access-form">
    <p>{registration ? say('Complete sus datos para crear una cuenta de Usuario general.', 'Enter your details to create a general user account.', 'Geben Sie Ihre Daten ein, um ein allgemeines Benutzerkonto zu erstellen.')
      : intent === 'animal' ? say('Ingrese para registrar a su compañero animal.', 'Sign in to register your animal companion.', 'Melden Sie sich an, um Ihr Haustier zu registrieren.')
        : say('Ingrese con su cuenta de Tortuguero Huellas.', 'Sign in with your Tortuguero Huellas account.', 'Melden Sie sich mit Ihrem Tortuguero Huellas-Konto an.')}</p>
    {error && !errorField && <p role="alert" className="notice">{error}</p>}
    <form onSubmit={save}>
      {registration && <><label>{say('Nombre completo', 'Full name', 'Vollständiger Name')}<input name="display_name" autoComplete="name" required maxLength={120} aria-invalid={errorField === 'display_name'} aria-describedby={errorField === 'display_name' ? 'vl-access-error' : undefined} /></label>
        {errorField === 'display_name' && <p id="vl-access-error" role="alert" className="notice">{error}</p>}
        <label>{say('Correo electrónico', 'Email address', 'E-Mail-Adresse')}<input name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={errorField === 'email'} aria-describedby={errorField === 'email' ? 'vl-access-error' : undefined} /></label>
        {errorField === 'email' && <p id="vl-access-error" role="alert" className="notice">{error}</p>}</>}
      <label>{say('Usuario', 'Username', 'Benutzername')}<input name="username" autoComplete={registration ? 'username' : 'off'} required minLength={registration ? 3 : undefined} maxLength={40} aria-invalid={errorField === 'username'} aria-describedby={errorField === 'username' ? 'vl-access-error' : undefined} /></label>
      {errorField === 'username' && <p id="vl-access-error" role="alert" className="notice">{error}</p>}
      <label>{say('Contraseña', 'Password', 'Passwort')}<input name="password" type="password" autoComplete="off" required minLength={registration ? 4 : undefined} aria-invalid={errorField === 'password'} aria-describedby={errorField === 'password' ? 'vl-access-error' : undefined} /></label>
      {errorField === 'password' && <p id="vl-access-error" role="alert" className="notice">{error}</p>}
      {registration && <><label>{say('Confirmar contraseña', 'Confirm password', 'Passwort bestätigen')}<input name="password_confirmation" type="password" autoComplete="off" required minLength={4} aria-invalid={errorField === 'password_confirmation'} aria-describedby={errorField === 'password_confirmation' ? 'vl-access-error' : undefined} /></label>
        {errorField === 'password_confirmation' && <p id="vl-access-error" role="alert" className="notice">{error}</p>}</>}
      {!registration && <label className="vl-modal-check"><input type="checkbox" name="remember" />{say('Mantener mi sesión iniciada', 'Keep me signed in', 'Angemeldet bleiben')}</label>}
      <button disabled={busy}>{busy ? say('Procesando…', 'Working…', 'Wird verarbeitet…') : registration ? say('Crear cuenta', 'Create account', 'Konto erstellen') : say('Ingresar', 'Sign in', 'Anmelden')}</button>
    </form>
    <button type="button" className="vl-switch-access" disabled={busy} onClick={() => onSwitch(registration ? 'ingreso' : 'registro')}>
      {registration ? say('¿Ya tiene cuenta? Ingresar', 'Already have an account? Sign in', 'Schon ein Konto? Anmelden') : say('¿No tiene cuenta? Registrarse', 'No account yet? Register', 'Noch kein Konto? Registrieren')}
    </button>
  </div>;
}

function FichaModalContent({
  modal,
  api,
  submit,
  onSwitchSubView,
  onSuccess,
  onOpenGeneralFind,
  onClose,
}) {
  const { say } = useLocale();

  if (modal.loading) {
    return (
      <div className="vl-ficha-loading" role="status">
        <PawCircle />
      </div>
    );
  }

  if (modal.error) {
    const isRetired = modal.errorCode === 410;
    return (
      <div className="vl-ficha-error" role="alert">
        <div className="vl-ficha-error-icon" aria-hidden="true">{isRetired ? '🏷️' : '🔍'}</div>
        <h3>
          {isRetired
            ? say('Código fuera de servicio', 'QR code retired', 'QR-Code außer Betrieb')
            : say('Ficha no disponible', 'Profile not available', 'Profil nicht verfügbar')}
        </h3>
        <p>
          {isRetired
            ? say('Este collar QR fue desactivado o reemplazado por la persona responsable. Si encontró a este compañero, puede reportar el hallazgo para que Tortuguero Huellas brinde seguimiento.',
                'This QR collar was disabled or replaced. If you found this animal, you can report it so Tortuguero Huellas can follow up.',
                'Dieses QR-Halsband wurde deaktiviert oder ersetzt. Wenn Sie dieses Tier gefunden haben, können Sie einen Fund melden.')
            : say('No encontramos un expediente activo vinculado a este código. Puede deberse a un código no registrado o archivado.',
                'We could not find an active record linked to this code. It may be unregistered or archived.',
                'Keine aktive Akte für diesen Code gefunden. Er ist möglicherweise nicht registriert oder archiviert.')}
        </p>
        <div className="vl-ficha-error-actions">
          <button type="button" className="vl-button" onClick={onOpenGeneralFind}>
            {say('Reportar un hallazgo sin QR', 'Report a find without QR', 'Fund ohne QR melden')}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            {say('Ir a la portada', 'Go to home page', 'Zur Startseite')}
          </button>
        </div>
      </div>
    );
  }

  const profile = modal.profile;
  if (!profile) return null;

  if (modal.subView === 'hallazgo') {
    return (
      <div className="vl-ficha-hallazgo-wrap">
        <button
          type="button"
          className="vl-ficha-nav-back"
          onClick={() => onSwitchSubView('card')}
        >
          ← {say(`Volver a la ficha de ${profile.name}`, `Back to ${profile.name}’s profile`, `Zurück zum Profil von ${profile.name}`)}
        </button>

        <div className="vl-ficha-context-chip">
          <span className="vl-ficha-context-avatar" aria-hidden="true">
            {profile.photo ? (
              <img src={profile.photo} alt="" />
            ) : (
              <span>🐶</span>
            )}
          </span>
          <div>
            <strong>{say('Reportando hallazgo de', 'Reporting find of', 'Fundmeldung für')} {profile.name}</strong>
            <p>{say('Perro', 'Dog', 'Hund')} · {profile.district}</p>
          </div>
        </div>

        <ReportForm
          kind="hallazgo"
          code={modal.code}
          profile={profile}
          api={api}
          submit={submit}
          formal
          onSuccess={() =>
            onSuccess(
              say('¡Muchas gracias! Su aviso quedó registrado y se notificó a la persona responsable.',
                'Thank you! Your report has been recorded and the caregiver has been notified.',
                'Vielen Dank! Ihre Meldung wurde gespeichert und die zuständige Person benachrichtigt.')
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="vl-ficha-card">
      <div className="vl-ficha-media">
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={`${say('Foto de', 'Photo of', 'Foto von')} ${profile.name}`}
            className="vl-ficha-photo"
          />
        ) : (
          <div className="vl-ficha-placeholder" aria-hidden="true">
            <span className="vl-ficha-placeholder-icon">🐶</span>
            <span>{profile.name}</span>
          </div>
        )}
        <span className="vl-species-badge">
          {`🐶 ${say('Perro', 'Dog', 'Hund')}`}
        </span>
      </div>

      <div className="vl-ficha-body">
        {profile.lost ? (
          <div className="vl-ficha-alert-lost" role="alert">
            <span className="vl-alert-icon" aria-hidden="true">⚠️</span>
            <div>
              <strong>{say('¡Compañero animal reportado como extraviado!', 'Animal companion reported missing!', 'Haustier als vermisst gemeldet!')}</strong>
              <p>
                {say('Su familia o albergue responsable lo está buscando activamente en San José. Si lo tiene o lo ha visto, repórtelo aquí.',
                  'Their family or shelter is actively searching in San José. If you have or saw them, please report it here.',
                  'Die Familie oder das Tierheim sucht aktiv in San José nach diesem Tier. Bitte Fund melden.')}
              </p>
            </div>
          </div>
        ) : (
          <div className="vl-ficha-verified-tag">
            <span>✨ {say('Identificación activa con QR Tortuguero Huellas', 'Active Tortuguero Huellas QR Identification', 'Aktive Tortuguero Huellas QR-Kennzeichnung')} · San José</span>
          </div>
        )}

        <h3 className="vl-ficha-name">{profile.name}</h3>

        <dl className="vl-ficha-details">
          <div>
            <dt>{say('Especie', 'Species', 'Tierart')}</dt>
            <dd>{say('Perro', 'Dog', 'Hund')}</dd>
          </div>
          <div>
            <dt>{say('Distrito de registro', 'Registered district', 'Registrierter Bezirk')}</dt>
            <dd>📍 {profile.district}</dd>
          </div>
          <div>
            <dt>{say('Estado', 'Status', 'Status')}</dt>
            <dd className={profile.lost ? 'is-lost-text' : 'is-active-text'}>
              {profile.lost
                ? say('Extraviado (Búsqueda activa)', 'Missing (Active search)', 'Vermisst (Aktive Suche)')
                : say('Activo en censo', 'Active in census', 'Im Register erfasst')}
            </dd>
          </div>
        </dl>

        <p className="vl-ficha-privacy-note">
          🔒 {say('Tortuguero Huellas protege los datos personales. El contacto se realiza de forma privada y segura.',
            'Tortuguero Huellas protects personal data. Contact is mediated safely and privately.',
            'Tortuguero Huellas schützt personenbezogene Daten. Die Kontaktaufnahme erfolgt sicher und vertraulich.')}
        </p>

        <div className="vl-ficha-actions">
          <button
            type="button"
            className="vl-button vl-button-primary w-full"
            onClick={() => onSwitchSubView('hallazgo')}
          >
            📍 {say('Encontré a este compañero', 'I found this animal companion', 'Ich habe dieses Tier gefunden')}
          </button>
        </div>
      </div>
    </div>
  );
}

function LandingDialog({
  modal,
  api,
  submit,
  onClose,
  onSuccess,
  onSwitch,
  onSwitchSubView,
  onOpenGeneralFind,
  onNavigate,
}) {
  const { say } = useLocale();
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const oldOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    element.querySelector('h2')?.focus();
    return () => {
      document.body.style.overflow = oldOverflow;
      if (element.open) element.close();
    };
  }, []);
  useEffect(() => {
    dialog.current?.querySelector('h2')?.focus();
  }, [modal.kind, modal.subView]);

  const titles = {
    hallazgo: say('Encontré un animal', 'I found an animal', 'Ich habe ein Tier gefunden'),
    extravio: say('Reportar extravío', 'Report a missing animal', 'Tier als vermisst melden'),
    registro: say('Crear cuenta', 'Create account', 'Konto erstellen'),
    ingreso: say('Ingresar a Tortuguero Huellas', 'Sign in to Tortuguero Huellas', 'Bei Tortuguero Huellas anmelden'),
    adopcion: say('Quiero adoptar', 'I want to adopt', 'Ich möchte adoptieren'),
    ficha: modal.subView === 'hallazgo'
      ? say('Reportar hallazgo', 'Report found animal', 'Fund melden')
      : say('Ficha del compañero animal', 'Animal companion profile', 'Tierprofil'),
  };

  return <dialog ref={dialog} className="vl-modal" aria-labelledby="vl-modal-title" onClose={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
    <div className="vl-modal-panel">
      <div className="vl-modal-heading"><h2 id="vl-modal-title" tabIndex={-1}>{titles[modal.kind]}</h2>
        <button type="button" className="vl-modal-close" aria-label={say('Cerrar ventana', 'Close dialog', 'Dialog schließen')} onClick={() => dialog.current.close()}>×</button>
      </div>
      {modal.success ? <div className="vl-modal-success" role="status"><p>{modal.success}</p>
        <button type="button" onClick={() => dialog.current.close()}>{say('Aceptar', 'OK', 'OK')}</button></div>
        : modal.kind === 'ficha'
          ? <FichaModalContent
              modal={modal}
              api={api}
              submit={submit}
              onSwitchSubView={onSwitchSubView}
              onSuccess={onSuccess}
              onOpenGeneralFind={onOpenGeneralFind}
              onClose={() => dialog.current.close()}
            />
          : modal.kind === 'hallazgo' || modal.kind === 'extravio'
            ? <ReportForm kind={modal.kind} api={api} submit={submit} formal onSuccess={() => onSuccess(say('Su aviso quedó registrado.', 'Your report was recorded.', 'Ihre Meldung wurde gespeichert.'))} />
            : modal.kind === 'adopcion'
              ? <AdoptionApplyForm profile={modal.profile} submit={submit} onSuccess={() => onSuccess(say('Su solicitud quedó registrada.', 'Your application was recorded.', 'Ihre Anfrage wurde gespeichert.'))} />
              : <AccessForm key={modal.kind} kind={modal.kind} intent={modal.intent} submit={submit} onSwitch={onSwitch} onNavigate={onNavigate} />}
    </div>
  </dialog>;
}

export function Landing({ api, submit, onNavigate, initialFicha, onClearFicha }) {
  const { say } = useLocale();
  const reduced = useReducedMotion();
  const [modal, setModal] = useState(() => {
    if (!initialFicha?.code) return null;
    return {
      kind: 'ficha',
      code: initialFicha.code,
      subView: initialFicha.directHallazgo ? 'hallazgo' : 'card',
      loading: true,
      profile: null,
      error: null,
      errorCode: null,
      success: null,
    };
  });
  const opener = useRef(null);

  useEffect(() => {
    if (!initialFicha?.code) return;
    let active = true;
    setModal({
      kind: 'ficha',
      code: initialFicha.code,
      subView: initialFicha.directHallazgo ? 'hallazgo' : 'card',
      loading: true,
      profile: null,
      error: null,
      errorCode: null,
      success: null,
    });

    api(`ficha/${initialFicha.code}`)
      .then((profile) => {
        if (!active) return;
        setModal((current) => {
          if (!current || current.code !== initialFicha.code) return current;
          return {
            ...current,
            loading: false,
            profile,
            subView: initialFicha.directHallazgo || profile.lost ? 'hallazgo' : 'card',
          };
        });
      })
      .catch((err) => {
        if (!active) return;
        setModal((current) => {
          if (!current || current.code !== initialFicha.code) return current;
          return {
            ...current,
            loading: false,
            error: err.message || say('No pudimos cargar la ficha.', 'Could not load profile.', 'Profil konnte nicht geladen werden.'),
            errorCode: err.status || 404,
          };
        });
      });

    return () => {
      active = false;
    };
  }, [initialFicha?.code, initialFicha?.directHallazgo]);

  function openModal(kind, profile) {
    opener.current = document.activeElement;
    setModal({ kind: kind === 'registro' ? 'ingreso' : kind === 'cuenta' ? 'registro' : kind,
      intent: kind === 'registro' ? 'animal' : null, profile, success: null });
  }

  function closeModal() {
    setModal(null);
    onClearFicha?.();
    opener.current?.focus();
  }

  function handleSwitchSubView(subView) {
    setModal((current) => {
      if (!current) return null;
      if (current.code) {
        const nextUrl = subView === 'hallazgo' ? `/ficha/${current.code}/hallazgo` : `/ficha/${current.code}`;
        history.replaceState(null, '', nextUrl);
      }
      return { ...current, subView };
    });
  }

  function handleOpenGeneralFind() {
    setModal({ kind: 'hallazgo', success: null });
    onClearFicha?.();
  }

  return <div className="vl-landing">
    <a className="vl-skip" href="#contenido">{say('Saltar al contenido', 'Skip to content', 'Zum Inhalt springen')}</a>
    <header className="vl-header">
      <a href="/" aria-label="Tortuguero Huellas, inicio"><img src={logo} alt="Tortuguero Huellas" /></a>
      <div className="vl-header-controls"><FlagLanguageSelect /><button type="button" className="vl-button" onClick={() => openModal('ingreso')}>{say('Iniciar sesión', 'Sign in', 'Anmelden')}</button></div>
    </header>
    <main id="contenido">
      <Footprints />
      <Hero openModal={openModal} />
      <section id="guia" className="vl-section vl-guide" aria-labelledby="guia-title">
        <p className="vl-kicker">02 / {say('GUÍA RÁPIDA', 'QUICK GUIDE', 'KURZANLEITUNG')}</p>
        <h2 id="guia-title">{say('¿Tiene un QR?', 'Does the animal have a QR code?', 'Hat das Tier einen QR-Code?')}</h2>
        <p className="vl-section-intro">{say('Si encontró un compañero animal o se extravió el suyo, aquí le explicamos cómo avisar.', 'If you found an animal or yours is missing, here is how to report it.', 'Wenn Sie ein Tier gefunden haben oder Ihres vermissen, erfahren Sie hier, wie Sie es melden.')}</p>
        <div className="vl-guide-grid">
          <article className="vl-guide-card">
            <img src={collarPhoto} alt={say('Perros con identificación QR en el collar', 'Dogs with QR collar identification', 'Hunde mit QR-Halsbandkennzeichnung')} loading="lazy" />
            <div><p className="vl-kicker">{say('HALLAZGO', 'FOUND ANIMAL', 'FUNDTIER')}</p><h3>{say('Encontré un animal: ¿cómo uso el QR?', 'Found an animal? How to use the QR code', 'Tier gefunden? So nutzt du den QR-Code')}</h3>
              <ol><li>{say('Abra la cámara del celular y apunte al QR del collar.', 'Open your phone camera and point it at the QR code on the collar.', 'Öffne die Handykamera und richte sie auf den QR-Code am Halsband.')}</li><li>{say('Toque el enlace. Se abrirá la ficha pública; si el animal figura como extraviado, se abrirá el formulario de hallazgo.', 'Tap the link to open the public profile or the form if the animal is listed as missing.', 'Tippe auf den Link. Das öffentliche Profil oder bei einer Vermisstenmeldung das Formular öffnet sich.')}</li><li>{say('Indique dónde lo encontró. Usted decide si desea dejar un medio de contacto.', 'Report where you found the animal and decide whether to leave contact details.', 'Melde den Fundort und entscheide, ob du Kontaktdaten angibst.')}</li></ol>
              <p>{say('¿No tiene collar o el QR no se puede leer?', 'No collar or unreadable QR code?', 'Kein Halsband oder QR-Code nicht lesbar?')}</p>
              <button type="button" className="vl-text-link" onClick={() => openModal('hallazgo')}>{say('Reportar un hallazgo sin QR', 'Report a find without a QR code', 'Fund ohne QR-Code melden')} <span aria-hidden="true">↗</span></button>
            </div>
          </article>
          <article className="vl-guide-card vl-guide-lost">
            <img src={lostCollarPhoto} alt={say('Perros con collares de identificación', 'Dogs wearing identification collars', 'Hunde mit Kennzeichnungshalsbändern')} loading="lazy" />
            <div><p className="vl-kicker">{say('EXTRAVÍO', 'MISSING ANIMAL', 'VERMISSTES TIER')}</p><h3>{say('Se extravió mi compañero animal', 'My animal companion is missing', 'Mein Haustier wird vermisst')}</h3>
              <ol><li>{say('Abra el formulario de extravío.', 'Open the missing animal form.', 'Öffne das Vermisstenformular.')}</li><li>{say('Indique su nombre y dónde se perdió. Puede adjuntar una foto para identificarlo.', 'Enter the name and where the animal went missing. You can attach a photo.', 'Gib den Namen und den Ort an, an dem das Tier verschwunden ist. Du kannst ein Foto anhängen.')}</li><li>{say('Deje un medio de contacto, revise los datos y envíe el aviso.', 'Leave a way to contact you, check the details and submit the report.', 'Gib eine Kontaktmöglichkeit an, prüfe die Daten und sende die Meldung ab.')}</li></ol>
              <button type="button" className="vl-text-link" onClick={() => openModal('extravio')}>{say('Reportar extravío', 'Report a missing animal', 'Tier als vermisst melden')} <span aria-hidden="true">↗</span></button>
            </div>
          </article>
        </div>
      </section>
      <AdoptionCarousel api={api} reduced={reduced} openModal={openModal} />
      <section id="comunidad" className="vl-section vl-community" aria-labelledby="comunidad-title">
        <div className="vl-split">
          <figure className="vl-community-figure">
            <img src={team} alt="Integrantes del equipo cuidando a un perro" loading="lazy" />
            <figcaption>{say('El equipo de Tortuguero Huellas en sus labores.', 'The Tortuguero Huellas team at work.', 'Das Tortuguero Huellas-Team bei der Arbeit.')}</figcaption>
          </figure>
          <div className="vl-community-intro">
            <p className="vl-kicker">04 / {say('BIENESTAR LOCAL', 'LOCAL ANIMAL WELFARE', 'TIERWOHL VOR ORT')}</p>
            <h2 id="comunidad-title">{say('Tortuguero Huellas en su comunidad', 'Tortuguero Huellas in your community', 'Tortuguero Huellas in deiner Gemeinde')}</h2>
            <p className="vl-pill"><span className="vl-pill-dot" aria-hidden="true" />San José · {say('Cantón central · Piloto de demostración', 'Central canton · Demo pilot', 'Zentralkanton · Pilotdemo')}</p>
            <p>{say('Cada reporte ayuda a conocer mejor a los perros registrados en el cantón. Esa información puede orientar futuras campañas de cuido y adopción.', 'Every report helps us understand which dogs are registered in the canton and plan future care and adoption initiatives.', 'Jede Meldung hilft, die registrierten Hunde im Kanton besser zu erfassen und künftige Pflege- und Adoptionsaktionen zu planen.')}</p>
            <p>{say('Tortuguero Huellas busca coordinar con organizaciones y profesionales veterinarios para impulsar vacunación, esterilización y atención cuando un animal lo necesite.', 'Tortuguero Huellas aims to work with organizations and veterinarians to support vaccination, sterilization and care when needed.', 'Tortuguero Huellas möchte mit Organisationen und Tierärzten zusammenarbeiten, um Impfungen, Kastrationen und die Versorgung von Tieren zu fördern.')}</p>
            <p className="vl-fine">{say('Correo de muestra: info@tortuguerohuellas.com (sin habilitar).', 'Example email: info@tortuguerohuellas.com (inactive).', 'Beispieladresse: info@tortuguerohuellas.com (inaktiv).')}</p>
          </div>
        </div>
        <div className="vl-community-pillars" aria-label={say('Pilares de acción comunitaria', 'Community action pillars', 'Säulen der Gemeindearbeit')}>
          <article className="vl-pillar-card">
            <div className="vl-pillar-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 28L32 11l22 17" />
                <path d="M16 25v24a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3V25" />
                <circle cx="32" cy="31" r="3.2" />
                <circle cx="25.5" cy="27.5" r="1.8" />
                <circle cx="29.5" cy="24.5" r="1.8" />
                <circle cx="34.5" cy="24.5" r="1.8" />
                <circle cx="38.5" cy="27.5" r="1.8" />
                <path d="M21 43c3.5 2.5 8 3.5 11 3.5s7.5-1 11-3.5" />
              </svg>
            </div>
            <h3 className="vl-pillar-title">
              <span>{say('PILOTO EN SAN JOSÉ', 'SAN JOSÉ PILOT', 'PILOTPROJEKT SAN JOSÉ')}</span>
              <strong>{say('CENSO Y REGISTRO ACTIVO', 'ACTIVE CENSUS & REGISTRY', 'AKTIVE ERFASSUNG & REGISTER')}</strong>
            </h3>
            <p>{say('Cada expediente de perro con hogar, en calle o en albergue nos permite organizar el registro cantonal y orientar campañas locales.', 'Every record of a dog in a home, on the street, or in a shelter helps organize the canton registry and guide local campaigns.', 'Jede Akte eines Hundes im Zuhause, auf der Straße oder im Tierheim hilft, das kantonale Register zu ordnen und Kampagnen zu planen.')}</p>
            <button type="button" className="vl-pillar-btn" onClick={() => openModal('cuenta')}>{say('Regístrese en Tortuguero Huellas', 'Create a Tortuguero Huellas account', 'Tortuguero Huellas-Konto erstellen')}</button>
          </article>
          <article className="vl-pillar-card">
            <div className="vl-pillar-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M32 53s-19-11.2-19-25.5A11.5 11.5 0 0 1 32 18.8a11.5 11.5 0 0 1 19 8.7C51 41.8 32 53 32 53Z" />
                <path d="M32 25v12M26 31h12" />
              </svg>
            </div>
            <h3 className="vl-pillar-title">
              <span>{say('SALUD Y BIENESTAR', 'HEALTH & WELFARE', 'GESUNDHEIT & TIERWOHL')}</span>
              <strong>{say('RED VETERINARIA Y CUIDO', 'VETERINARY CARE NETWORK', 'TIERÄRZTLICHES NETZWERK')}</strong>
            </h3>
            <p>{say('Coordinamos con profesionales veterinarios y refugios aliados para impulsar vacunación, esterilización, cirugías y atención oportuna.', 'We coordinate with veterinarians and partner shelters to support vaccination, sterilization, surgeries, and timely care.', 'Wir koordinieren uns mit Tierärzten und Tierheimen, um Impfungen, Kastrationen, Operationen und rechtzeitige Hilfe zu fördern.')}</p>
            <a href="#adopcion" className="vl-pillar-btn">{say('Ver compañeros en adopción', 'Meet companions for adoption', 'Tiere zur Adoption ansehen')}</a>
          </article>
          <article className="vl-pillar-card">
            <div className="vl-pillar-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 48V30l5-8 5 6h4l4-6 5 8v18" />
                <path d="M19 36h13" />
                <circle cx="25.5" cy="41.5" r="2.5" />
                <path d="M40 48V28c0-3.5 2.5-6 6-6h4l4 5v7h-5v14" />
                <path d="M10 48h44" />
              </svg>
            </div>
            <h3 className="vl-pillar-title">
              <span>{say('¿ENCONTRÓ UN ANIMAL?', 'FOUND AN ANIMAL?', 'TIER GEFUNDEN?')}</span>
              <strong>{say('AVISO CON O SIN QR', 'REPORT WITH OR WITHOUT QR', 'MELDUNG MIT ODER OHNE QR')}</strong>
            </h3>
            <p>{say('Escanee el código QR del collar con la cámara de su celular o envíe un reporte directo para ayudar a un compañero animal.', 'Scan the collar QR code with your phone camera or submit a direct report to help an animal companion.', 'Scannen Sie den QR-Code am Halsband mit Ihrer Handykamera oder senden Sie eine direkte Meldung, um einem Tier zu helfen.')}</p>
            <button type="button" className="vl-pillar-btn" onClick={() => openModal('hallazgo')}>{say('Reportar un hallazgo sin QR', 'Report a find without a QR code', 'Fund ohne QR-Code melden')}</button>
          </article>
        </div>
      </section>
      <section id="organizaciones" className="vl-section vl-organizations" aria-labelledby="organizaciones-title">
        <div className="vl-split vl-org-split">
          <div className="vl-org-copy">
            <p className="vl-kicker">05 / {say('TRABAJO CONJUNTO', 'WORKING TOGETHER', 'ZUSAMMENARBEIT')}</p>
            <h2 id="organizaciones-title">{say('Para municipalidades y organizaciones', 'For municipalities and organizations', 'Für Gemeinden und Organisationen')}</h2>
            <h3>{say('Datos del territorio para decidir dónde actuar', 'Local data to decide where to act', 'Lokale Daten für gezielte Maßnahmen')}</h3>
            <p>{say('Tortuguero Huellas reúne el censo de compañeros animales, la identificación por QR y el seguimiento de reportes. Así, cada organización puede conocer los casos registrados en su zona y coordinar qué hacer cuando un animal necesita atención.', 'Tortuguero Huellas brings together animal census data, QR identification and report tracking so organizations can review local cases and coordinate care.', 'Tortuguero Huellas bündelt Bestandsdaten, QR-Kennzeichnung und die Bearbeitung von Meldungen, damit Organisationen Fälle vor Ort prüfen und Hilfe koordinieren können.')}</p>
            <div className="vl-org-chips" aria-label={say('Capacidades clave del programa', 'Key program capabilities', 'Wichtige Programmfunktionen')}>
              <span className="vl-org-chip"><span className="vl-org-chip-dot" aria-hidden="true" />{say('Censo territorial activo', 'Active territorial census', 'Aktive Gebietserfassung')}</span>
              <span className="vl-org-chip"><span className="vl-org-chip-dot" aria-hidden="true" />{say('Trazabilidad con QR', 'QR traceability', 'QR-Rückverfolgbarkeit')}</span>
              <span className="vl-org-chip"><span className="vl-org-chip-dot" aria-hidden="true" />{say('Coordinación de emergencias', 'Emergency coordination', 'Notfallkoordination')}</span>
            </div>
            <div className="vl-program">
              <div className="vl-program-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5Z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="vl-program-head"><strong>{say('Conocer el programa', 'About the program', 'Über das Programm')}</strong><span className="vl-program-badge">{say('Próximamente', 'Coming soon', 'Demnächst')}</span></p>
                <p className="vl-program-sub">{say('Información del programa próximamente.', 'Program information coming soon.', 'Programminformationen folgen.')}</p>
              </div>
            </div>
          </div>
          <div className="vl-org-showcase" aria-label={say('Equipo de Tortuguero Huellas en campo y clínica', 'Tortuguero Huellas team in the field and clinic', 'Tortuguero Huellas-Team im Einsatz und in der Klinik')}>
            <figure className="vl-org-photo vl-org-photo-main">
              <img src={fieldwork} alt={say('Integrantes del equipo organizando materiales de trabajo en campo', 'Team members organizing fieldwork supplies', 'Teammitglieder beim Organisieren von Arbeitsmaterial im Außeneinsatz')} loading="lazy" />
              <figcaption><span className="vl-pill-dot" aria-hidden="true" />{say('Logística y censo en campo', 'Field logistics & census', 'Logistik & Erfassung vor Ort')}</figcaption>
            </figure>
            <figure className="vl-org-photo vl-org-photo-secondary">
              <img src={surgerySupport} alt={say('Profesionales veterinarios monitoreando una cirugía', 'Veterinary professionals monitoring a surgery', 'Tierärztliches Team bei der Operationsüberwachung')} loading="lazy" />
              <figcaption><span className="vl-pill-dot" aria-hidden="true" />{say('Atención quirúrgica y clínica', 'Surgical & clinical care', 'Chirurgische & klinische Versorgung')}</figcaption>
            </figure>
          </div>
        </div>
        <div className="vl-audiences">
          <article className="vl-audience-card">
            <div className="vl-audience-top">
              <div className="vl-audience-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 20L24 8l18 12" />
                  <path d="M10 20v18M19 20v18M29 20v18M38 20v18" />
                  <path d="M6 38h36M8 20h32" />
                </svg>
              </div>
              <span className="vl-audience-num" aria-hidden="true">01</span>
            </div>
            <p className="vl-audience-tag">{say('GOBIERNOS LOCALES', 'LOCAL GOVERNMENTS', 'KOMMUNALVERWALTUNGEN')}</p>
            <h3>{say('Municipalidades', 'Municipalities', 'Gemeinden')}</h3>
            <p>{say('Consulte cuántos perros registrados tienen hogar, viven en situación de calle o están en un albergue. El desglose por territorio ayuda a priorizar visitas y planificar campañas de vacunación y esterilización.', 'Review how many registered dogs have a home, live on the street, or are in a shelter. Territorial breakdowns help prioritize visits and plan vaccination and sterilization campaigns.', 'Prüfen Sie, wie viele registrierte Hunde ein Zuhause haben, auf der Straße leben oder im Tierheim sind, um Besuche und Impf- sowie Kastrationskampagnen zu planen.')}</p>
            <span className="vl-audience-foot">{say('Priorización por distrito y condición', 'District & condition prioritization', 'Priorisierung nach Bezirk & Zustand')} <span aria-hidden="true">→</span></span>
          </article>
          <article className="vl-audience-card">
            <div className="vl-audience-top">
              <div className="vl-audience-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 18l3-9h26l3 9" />
                  <path d="M8 18c0 3 2.5 5 5.3 5S18.6 21 18.6 18c0 3 2.4 5 5.4 5s5.4-2 5.4-5c0 3 2.5 5 5.3 5S40 21 40 18" />
                  <path d="M11 23v17h26V23" />
                  <path d="M20 40V30h8v10" />
                </svg>
              </div>
              <span className="vl-audience-num" aria-hidden="true">02</span>
            </div>
            <p className="vl-audience-tag">{say('HOSPEDAJES Y COMERCIOS', 'HOSPITALITY & BUSINESSES', 'GASTGEWERBE & HANDEL')}</p>
            <h3>{say('Comercios y turismo', 'Businesses and tourism', 'Gewerbe und Tourismus')}</h3>
            <p>{say('Reporte animales que necesiten ayuda cerca de hospedajes, restaurantes y espacios públicos. Compartir dónde está y qué se observó facilita el seguimiento y apoya una convivencia segura para animales, residentes y visitantes.', 'Report animals that need help near accommodations, restaurants, and public spaces. Sharing where they are and what was observed facilitates follow-up and supports safe coexistence.', 'Melden Sie Tiere, die in der Nähe von Unterkünften, Restaurants und öffentlichen Plätzen Hilfe benötigen, um die Nachverfolgung und ein sicheres Miteinander zu unterstützen.')}</p>
            <span className="vl-audience-foot">{say('Aviso rápido en zonas comerciales y turísticas', 'Quick reporting in commercial & tourist areas', 'Schnellmeldung in Gewerbe- & Tourismuszonen')} <span aria-hidden="true">→</span></span>
          </article>
          <article className="vl-audience-card">
            <div className="vl-audience-top">
              <div className="vl-audience-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="12" width="32" height="28" rx="4" />
                  <path d="M18 12V8h12v4" />
                  <path d="M24 20v12M18 26h12" />
                </svg>
              </div>
              <span className="vl-audience-num" aria-hidden="true">03</span>
            </div>
            <p className="vl-audience-tag">{say('RED DE SALUD Y ALBERGUES', 'HEALTH & SHELTER NETWORK', 'TIERARZT- & TIERHEIMNETZWERK')}</p>
            <h3>{say('Veterinarias y refugios', 'Veterinarians and shelters', 'Tierarztpraxen und Tierheime')}</h3>
            <p>{say('Coordine valoraciones, vacunación, desparasitación, esterilización y traslados cuando haya capacidad. Ante un hallazgo, el equipo puede consultar si un refugio tiene espacio y articular la atención oportuna.', 'Coordinate assessments, vaccination, deworming, sterilization, and transport when capacity is available. Upon a find, the team can check shelter space and coordinate timely care.', 'Koordinieren Sie Untersuchungen, Impfungen, Entwurmungen, Kastrationen und Transporte nach Kapazität sowie die Aufnahme in Tierheimen bei Fundtieren.')}</p>
            <span className="vl-audience-foot">{say('Enlace clínico, quirúrgico y de resguardo', 'Clinical, surgical & shelter coordination', 'Klinische, chirurgische & Tierheim-Koordination')} <span aria-hidden="true">→</span></span>
          </article>
        </div>
      </section>
    </main>
    <footer>© 2026 Tortuguero Huellas · {say('En asociación con', 'In partnership with', 'In Zusammenarbeit mit')} Finding Home Project by BIENVET</footer>
    {modal && <LandingDialog
      modal={modal}
      api={api}
      submit={submit}
      onClose={closeModal}
      onNavigate={onNavigate}
      onSwitch={(kind) => setModal((current) => ({ ...current, kind }))}
      onSwitchSubView={handleSwitchSubView}
      onOpenGeneralFind={handleOpenGeneralFind}
      onSuccess={(success) => setModal((current) => ({ ...current, success }))}
    />}
  </div>;
}
