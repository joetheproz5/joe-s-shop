export const LEBANON_COUNTRY = 'Lebanon'
export const LEBANESE_PHONE_PLACEHOLDER = '+961 71 234 567'

export const LEBANON_LOCATIONS = {
  Akkar: [
    'Halba', 'Aakkar Al Atika', 'Bebnine', 'Bireh', 'Qoubaiyat', 'Miniara',
    'Rahbeh', 'Andaket', 'Berkayel', 'Cheikh Taba', 'Kousha', 'Machha',
  ],
  'Baalbek-Hermel': [
    'Baalbek', 'Hermel', 'Arsal', 'Ras Baalbek', 'Labweh', 'Chmistar',
    'Deir El Ahmar', 'Brital', 'Douris', 'Iaat', 'Nabi Chit', 'Yammouneh',
  ],
  Beirut: [
    'Achrafieh', 'Ain El Mreisseh', 'Bachoura', 'Beirut Central District',
    'Clemenceau', 'Hamra', 'Karakas', 'Manara', 'Mar Elias', 'Mar Mikhael',
    'Mazraa', 'Moussaitbeh', 'Ras Beirut', 'Saifi', 'Tariq El Jdideh', 'Verdun',
  ],
  Bekaa: [
    'Zahle', 'Chtaura', 'Bar Elias', 'Qab Elias', 'Riyaq', 'Anjar', 'Taanayel',
    'Saadnayel', 'Jdita', 'Majdal Anjar', 'Rachaya', 'Machghara', 'Sohmor',
  ],
  'Keserwan-Jbeil': [
    'Jounieh', 'Jbeil (Byblos)', 'Ajaltoun', 'Ballouneh', 'Ghazir', 'Haret Sakher',
    'Jeita', 'Kaslik', 'Kfar Hbab', 'Mayrouba', 'Nahr Ibrahim', 'Safra', 'Tabarja',
    'Zouk Mikael', 'Zouk Mosbeh', 'Amchit', 'Ehmej', 'Kartaba', 'Mastita',
  ],
  'Mount Lebanon': [
    'Baabda', 'Aley', 'Beit Mery', 'Bhamdoun', 'Broummana', 'Choueifat',
    'Damour', 'Deir El Qamar', 'Dora', 'Hazmieh', 'Jal El Dib', 'Jdeideh',
    'Mansourieh', 'Sin El Fil', 'Antelias', 'Dbayeh', 'Bchamoun', 'Khaldeh',
    'Beiteddine', 'Barja', 'Chhim', 'Jiyeh', 'Naameh', 'Baakline',
  ],
  Nabatieh: [
    'Nabatieh', 'Bint Jbeil', 'Marjayoun', 'Hasbaya', 'Kfar Roummane', 'Arnoun',
    'Tebnine', 'Khiam', 'Kfar Kila', 'Meiss El Jabal', 'Ain Ebel', 'Harouf',
  ],
  'North Lebanon': [
    'Tripoli', 'El Mina', 'Zgharta', 'Ehden', 'Bsharri', 'Batroun', 'Amioun',
    'Kousba', 'Chekka', 'Anfeh', 'Balamand', 'Miniyeh', 'Sir El Danniyeh',
    'Ras Maska', 'Kfar Hazir', 'Bterram',
  ],
  'South Lebanon': [
    'Saida (Sidon)', 'Sour (Tyre)', 'Jezzine', 'Ghazieh', 'Sarafand', 'Naqoura',
    'Abra', 'Maghdoucheh', 'Zahrani', 'Qana', 'Jouaya', 'Bazourieh', 'Chehabiyeh',
  ],
} as const

export type LebanonGovernorate = keyof typeof LEBANON_LOCATIONS

export const LEBANON_GOVERNORATES = Object.keys(LEBANON_LOCATIONS) as LebanonGovernorate[]

export function isLebanonGovernorate(value: string): value is LebanonGovernorate {
  return LEBANON_GOVERNORATES.includes(value as LebanonGovernorate)
}

export function getLebanonCities(governorate: string): readonly string[] {
  return isLebanonGovernorate(governorate) ? LEBANON_LOCATIONS[governorate] : []
}

export function normalizeLebanonLocation<T extends { country: string; state: string; city: string }>(value: T): T {
  const validGovernorate = isLebanonGovernorate(value.state)
  return {
    ...value,
    country: LEBANON_COUNTRY,
    state: validGovernorate ? value.state : '',
    city: validGovernorate ? value.city : '',
  }
}
