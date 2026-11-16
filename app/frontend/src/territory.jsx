import { useEffect, useId, useState } from 'react';
import { useLocale } from './locale.jsx';

export function TerritoryFields({ catalog, initialDistrictId = '', initialCantonId = '', required = true }) {
  const { say } = useLocale();
  const id = useId();
  const [provinceId, setProvinceId] = useState('');
  const [cantonId, setCantonId] = useState('');
  const [districtId, setDistrictId] = useState('');

  useEffect(() => {
    const district = catalog.districts.find((item) => String(item.id) === String(initialDistrictId));
    const canton = catalog.cantons.find((item) => String(item.id) === String(district?.canton_id || initialCantonId));
    setProvinceId(canton ? String(canton.province_id) : '');
    setCantonId(canton ? String(canton.id) : '');
    setDistrictId(district ? String(district.id) : '');
  }, [catalog, initialDistrictId, initialCantonId]);

  const cantons = catalog.cantons.filter((item) => String(item.province_id) === provinceId);
  const districts = catalog.districts.filter((item) => String(item.canton_id) === cantonId);
  const all = say('Todos', 'All', 'Alle');

  return <>
    <div className="vl-territory-field"><label htmlFor={`${id}-province`}>{say('Provincia', 'Province', 'Provinz')}</label>
      <select id={`${id}-province`} name="province_id" value={provinceId} required={required} onChange={(event) => {
        setProvinceId(event.target.value); setCantonId(''); setDistrictId('');
      }}>
        <option value="">{required ? say('Seleccione una provincia', 'Choose a province', 'Provinz auswählen') : all}</option>
        {catalog.provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
    <div className="vl-territory-field"><label htmlFor={`${id}-canton`}>{say('Cantón', 'Canton', 'Kanton')}</label>
      <select id={`${id}-canton`} name="canton_id" value={cantonId} required={required} disabled={!provinceId} onChange={(event) => {
        setCantonId(event.target.value); setDistrictId('');
      }}>
        <option value="">{required ? say('Seleccione un cantón', 'Choose a canton', 'Kanton auswählen') : all}</option>
        {cantons.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
    <div className="vl-territory-field"><label htmlFor={`${id}-district`}>{say('Distrito', 'District', 'Bezirk')}</label>
      <select id={`${id}-district`} name="district_id" value={districtId} required={required} disabled={!cantonId} onChange={(event) => setDistrictId(event.target.value)}>
        <option value="">{required ? say('Seleccione un distrito', 'Choose a district', 'Bezirk auswählen') : all}</option>
        {districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
  </>;
}
