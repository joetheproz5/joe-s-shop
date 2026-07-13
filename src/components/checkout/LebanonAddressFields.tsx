import { useEffect, useMemo, useState } from 'react'
import { Input, Select } from '@/components/ui'
import {
  getLebanonCities,
  LEBANON_COUNTRY,
  LEBANON_GOVERNORATES,
} from '@/lib/lebanon'

const OTHER_CITY = '__other_city__'

export interface LebanonAddressValue {
  city: string
  state: string
  postal_code: string
  country: string
}

interface LebanonAddressFieldsProps {
  value: LebanonAddressValue
  onChange: (field: keyof LebanonAddressValue, value: string) => void
  required?: boolean
}

export function LebanonAddressFields({ value, onChange, required = false }: LebanonAddressFieldsProps) {
  const cities = useMemo(() => getLebanonCities(value.state), [value.state])
  const [manualCity, setManualCity] = useState(Boolean(value.city && !cities.includes(value.city)))

  useEffect(() => {
    setManualCity(Boolean(value.city && !getLebanonCities(value.state).includes(value.city)))
  }, [value.state])

  const changeGovernorate = (selection: string | string[] | null) => {
    const governorate = typeof selection === 'string' ? selection : ''
    setManualCity(false)
    onChange('state', governorate)
    onChange('city', '')
    onChange('country', LEBANON_COUNTRY)
  }

  const changeCity = (selection: string | string[] | null) => {
    const city = typeof selection === 'string' ? selection : ''
    if (city === OTHER_CITY) {
      setManualCity(true)
      onChange('city', '')
      return
    }
    setManualCity(false)
    onChange('city', city)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label={`Governorate${required ? ' *' : ''}`}
        value={value.state || null}
        onChange={changeGovernorate}
        options={LEBANON_GOVERNORATES.map((governorate) => ({ label: governorate, value: governorate }))}
        placeholder="Select governorate"
        clearable={false}
        searchable
      />
      <div>
        <Select
          label={`City / town${required ? ' *' : ''}`}
          value={manualCity ? OTHER_CITY : value.city || null}
          onChange={changeCity}
          options={[
            ...cities.map((city) => ({ label: city, value: city })),
            { label: 'Other city or village', value: OTHER_CITY },
          ]}
          placeholder={value.state ? 'Select city or town' : 'Select governorate first'}
          disabled={!value.state}
          clearable={false}
          searchable
        />
        {manualCity && (
          <Input
            className="mt-3"
            label={`City, town, or village${required ? ' *' : ''}`}
            value={value.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Enter your delivery area"
            autoComplete="address-level2"
            required={required}
          />
        )}
      </div>
      <Input
        label="Postal code (optional)"
        value={value.postal_code}
        onChange={(event) => onChange('postal_code', event.target.value)}
        placeholder="e.g. 1107 2800"
        autoComplete="postal-code"
        inputMode="numeric"
      />
      <Input label="Country" value={LEBANON_COUNTRY} readOnly autoComplete="country-name" />
    </div>
  )
}
