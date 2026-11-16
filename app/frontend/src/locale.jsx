import { createContext, useContext, useEffect, useRef, useState } from 'react';
import flagCr from './assets/flag-cr.svg';
import flagUs from './assets/flag-us.svg';
import flagDe from './assets/flag-de.svg';

const languages = [
  ['es-CR', '🇨🇷 Español'], ['en', '🇺🇸 English'], ['de', '🇩🇪 Deutsch'],
];
const flagLanguages = [
  { code: 'es-CR', name: 'Español', flag: flagCr },
  { code: 'en', name: 'English', flag: flagUs },
  { code: 'de', name: 'Deutsch', flag: flagDe },
];
const Locale = createContext(null);

export function LocaleProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('vitalink-language');
    return languages.some(([code]) => code === saved) ? saved : 'es-CR';
  });
  useEffect(() => {
    localStorage.setItem('vitalink-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const say = (es, en, de) => language === 'en' ? en : language === 'de' ? de : es;
  return <Locale.Provider value={{ language, setLanguage, say }}>{children}</Locale.Provider>;
}

export function useLocale() {
  return useContext(Locale);
}

export function LanguageSelect() {
  const { language, setLanguage, say } = useLocale();
  return <select className="vl-language" aria-label={say('Idioma', 'Language', 'Sprache')} value={language}
    onChange={(event) => setLanguage(event.target.value)}>
    {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
  </select>;
}

export function FlagLanguageSelect() {
  const { language, setLanguage, say } = useLocale();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const selected = flagLanguages.find((item) => item.code === language) ?? flagLanguages[0];

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  function choose(code) {
    setLanguage(code);
    setOpen(false);
    trigger.current?.focus();
  }

  function handleKey(event) {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      trigger.current?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        requestAnimationFrame(() => root.current?.querySelector('[aria-selected="true"]')?.focus());
      } else {
        const options = [...root.current.querySelectorAll('[role="option"]')];
        const current = options.indexOf(document.activeElement);
        options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
      }
    }
  }

  return <div ref={root} className="vl-flag-picker" onKeyDown={handleKey}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" className="vl-flag-trigger" role="combobox"
      aria-label={say('Idioma', 'Language', 'Sprache')} aria-haspopup="listbox" aria-expanded={open}
      aria-controls={open ? 'vl-language-options' : undefined} onClick={() => setOpen((value) => !value)}>
      <img src={selected.flag} alt="" /><span>{selected.name}</span><span className="vl-flag-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <div id="vl-language-options" className="vl-flag-menu" role="listbox" aria-label={say('Idioma', 'Language', 'Sprache')}>
      {flagLanguages.map((item) => <button key={item.code} type="button" role="option"
        aria-selected={language === item.code} onClick={() => choose(item.code)}>
        <img src={item.flag} alt="" /><span>{item.name}</span>
      </button>)}
    </div>}
  </div>;
}
