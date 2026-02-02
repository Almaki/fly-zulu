import type { AirportRunwayData } from '../types'

// IATA to ICAO mapping for quick search
export const IATA_TO_ICAO: Record<string, string> = {
  // Mexico
  TIJ: 'MMTJ', MEX: 'MMMX', MTY: 'MMMY', GDL: 'MMGL',
  BJX: 'MMLO', CUN: 'MMUN', PVR: 'MMPR', SJD: 'MMSD',
  HMO: 'MMHO', CUU: 'MMCU', MID: 'MMMD', CZM: 'MMCZ',
  ACA: 'MMAA', OAX: 'MMOX', AGU: 'MMAS', QRO: 'MMQT',
  SLP: 'MMSP', VSA: 'MMVA', TAM: 'MMTM', ZIH: 'MMZI',
  PBC: 'MMPB', CME: 'MMCE', CTM: 'MMCM', TRC: 'MMTC',
  MLM: 'MMMM', CUL: 'MMCL', MZT: 'MMZT', LMM: 'MMLM',
  // US major
  LAX: 'KLAX', SFO: 'KSFO', JFK: 'KJFK', ORD: 'KORD',
  DFW: 'KDFW', ATL: 'KATL', MIA: 'KMIA', DEN: 'KDEN',
  SAN: 'KSAN', PHX: 'KPHX', LAS: 'KLAS', IAH: 'KIAH',
  EWR: 'KEWR', BOS: 'KBOS', SEA: 'KSEA', MSP: 'KMSP',
  DTW: 'KDTW', CLT: 'KCLT', MCO: 'KMCO', TPA: 'KTPA',
  FLL: 'KFLL', SLC: 'KSLC', BWI: 'KBWI', DCA: 'KDCA',
  IAD: 'KIAD', STL: 'KSTL', SNA: 'KSNA', ONT: 'KONT',
  BUR: 'KBUR', ELP: 'KELP', TUS: 'KTUS', AUS: 'KAUS',
  SAT: 'KSAT', HOU: 'KHOU', MDW: 'KMDW', OAK: 'KOAK',
  SJC: 'KSJC', PDX: 'KPDX', RDU: 'KRDU', IND: 'KIND',
  CMH: 'KCMH', PIT: 'KPIT', MKE: 'KMKE', BNA: 'KBNA',
  MSY: 'KMSY', ABQ: 'KABQ', OKC: 'KOKC', TUL: 'KTUL',
  JAX: 'KJAX', PBI: 'KPBI', RSW: 'KRSW', SMF: 'KSMF',
  LGA: 'KLGA', HNL: 'PHNL', ANC: 'PANC',
}

// Airport runway database - main Mexican airports
export const AIRPORT_RUNWAYS: Record<string, AirportRunwayData> = {
  MMTJ: {
    icao: 'MMTJ',
    name: 'Tijuana - Gral. Abelardo L. Rodriguez',
    runways: [{ label1: '09', label2: '27', heading: 90 }],
  },
  MMMX: {
    icao: 'MMMX',
    name: 'Mexico City - Benito Juarez Intl',
    runways: [
      { label1: '05L', label2: '23R', heading: 50 },
      { label1: '05R', label2: '23L', heading: 50 },
    ],
  },
  MMMY: {
    icao: 'MMMY',
    name: 'Monterrey - Gral. Mariano Escobedo',
    runways: [{ label1: '11', label2: '29', heading: 110 }],
  },
  MMGL: {
    icao: 'MMGL',
    name: 'Guadalajara - Miguel Hidalgo y Costilla',
    runways: [{ label1: '10', label2: '28', heading: 100 }],
  },
  MMLO: {
    icao: 'MMLO',
    name: 'Leon/Bajio - Del Bajio Intl',
    runways: [{ label1: '05', label2: '23', heading: 50 }],
  },
  MMUN: {
    icao: 'MMUN',
    name: 'Cancun Intl',
    runways: [
      { label1: '12L', label2: '30R', heading: 120 },
      { label1: '12R', label2: '30L', heading: 120 },
    ],
  },
  MMPR: {
    icao: 'MMPR',
    name: 'Puerto Vallarta - Gustavo Diaz Ordaz',
    runways: [{ label1: '04', label2: '22', heading: 40 }],
  },
  MMSD: {
    icao: 'MMSD',
    name: 'Los Cabos Intl',
    runways: [{ label1: '16', label2: '34', heading: 160 }],
  },
  MMHO: {
    icao: 'MMHO',
    name: 'Hermosillo - Gral. Ignacio Pesqueira Garcia',
    runways: [{ label1: '05', label2: '23', heading: 50 }],
  },
  MMCU: {
    icao: 'MMCU',
    name: 'Chihuahua - Gral. Roberto Fierro Villalobos',
    runways: [{ label1: '04', label2: '22', heading: 40 }],
  },
  MMMD: {
    icao: 'MMMD',
    name: 'Merida - Manuel Crescencio Rejon',
    runways: [{ label1: '10', label2: '28', heading: 100 }],
  },
  MMCZ: {
    icao: 'MMCZ',
    name: 'Cozumel Intl',
    runways: [{ label1: '05', label2: '23', heading: 50 }],
  },
  MMAA: {
    icao: 'MMAA',
    name: 'Acapulco - Gral. Juan N. Alvarez',
    runways: [{ label1: '10', label2: '28', heading: 100 }],
  },
  MMOX: {
    icao: 'MMOX',
    name: 'Oaxaca - Xoxocotlan',
    runways: [{ label1: '15', label2: '33', heading: 150 }],
  },
  MMQT: {
    icao: 'MMQT',
    name: 'Queretaro Intl',
    runways: [{ label1: '05', label2: '23', heading: 50 }],
  },
  MMTC: {
    icao: 'MMTC',
    name: 'Torreon - Francisco Sarabia',
    runways: [{ label1: '05', label2: '23', heading: 50 }],
  },
  MMMM: {
    icao: 'MMMM',
    name: 'Morelia - Gral. Francisco J. Mujica',
    runways: [{ label1: '05', label2: '23', heading: 50 }],
  },
  MMCL: {
    icao: 'MMCL',
    name: 'Culiacan - Bachigualato',
    runways: [{ label1: '02', label2: '20', heading: 20 }],
  },
  MMZT: {
    icao: 'MMZT',
    name: 'Mazatlan - Gral. Rafael Buelna',
    runways: [{ label1: '10', label2: '28', heading: 100 }],
  },
  MMVA: {
    icao: 'MMVA',
    name: 'Villahermosa - Carlos Rovirosa',
    runways: [{ label1: '10', label2: '28', heading: 100 }],
  },
  MMTM: {
    icao: 'MMTM',
    name: 'Tampico - Gral. Francisco Javier Mina',
    runways: [{ label1: '13', label2: '31', heading: 130 }],
  },
  MMZI: {
    icao: 'MMZI',
    name: 'Zihuatanejo Intl',
    runways: [{ label1: '10', label2: '28', heading: 100 }],
  },
  // US common
  KLAX: {
    icao: 'KLAX',
    name: 'Los Angeles Intl',
    runways: [
      { label1: '06L', label2: '24R', heading: 60 },
      { label1: '06R', label2: '24L', heading: 60 },
      { label1: '07L', label2: '25R', heading: 70 },
      { label1: '07R', label2: '25L', heading: 70 },
    ],
  },
  KSAN: {
    icao: 'KSAN',
    name: 'San Diego Intl',
    runways: [{ label1: '09', label2: '27', heading: 90 }],
  },
  KPHX: {
    icao: 'KPHX',
    name: 'Phoenix Sky Harbor',
    runways: [
      { label1: '07L', label2: '25R', heading: 70 },
      { label1: '07R', label2: '25L', heading: 70 },
      { label1: '08', label2: '26', heading: 80 },
    ],
  },
  KLAS: {
    icao: 'KLAS',
    name: 'Las Vegas Harry Reid',
    runways: [
      { label1: '01L', label2: '19R', heading: 10 },
      { label1: '01R', label2: '19L', heading: 10 },
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
    ],
  },
  KDFW: {
    icao: 'KDFW',
    name: 'Dallas/Fort Worth Intl',
    runways: [
      { label1: '13L', label2: '31R', heading: 130 },
      { label1: '13R', label2: '31L', heading: 130 },
      { label1: '17C', label2: '35C', heading: 170 },
      { label1: '17L', label2: '35R', heading: 170 },
      { label1: '17R', label2: '35L', heading: 170 },
      { label1: '18L', label2: '36R', heading: 180 },
      { label1: '18R', label2: '36L', heading: 180 },
    ],
  },
  KIAH: {
    icao: 'KIAH',
    name: 'Houston George Bush',
    runways: [
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
      { label1: '09', label2: '27', heading: 90 },
      { label1: '15L', label2: '33R', heading: 150 },
      { label1: '15R', label2: '33L', heading: 150 },
    ],
  },
  KSFO: {
    icao: 'KSFO',
    name: 'San Francisco Intl',
    runways: [
      { label1: '01L', label2: '19R', heading: 10 },
      { label1: '01R', label2: '19L', heading: 10 },
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
    ],
  },
  KJFK: {
    icao: 'KJFK',
    name: 'New York John F. Kennedy',
    runways: [
      { label1: '04L', label2: '22R', heading: 40 },
      { label1: '04R', label2: '22L', heading: 40 },
      { label1: '13L', label2: '31R', heading: 130 },
      { label1: '13R', label2: '31L', heading: 130 },
    ],
  },
  KORD: {
    icao: 'KORD',
    name: 'Chicago O\'Hare Intl',
    runways: [
      { label1: '09L', label2: '27R', heading: 90 },
      { label1: '09R', label2: '27L', heading: 90 },
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10C', label2: '28C', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
    ],
  },
  KATL: {
    icao: 'KATL',
    name: 'Atlanta Hartsfield-Jackson',
    runways: [
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
      { label1: '09L', label2: '27R', heading: 90 },
      { label1: '09R', label2: '27L', heading: 90 },
      { label1: '10', label2: '28', heading: 100 },
    ],
  },
  KMIA: {
    icao: 'KMIA',
    name: 'Miami Intl',
    runways: [
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
      { label1: '09', label2: '27', heading: 90 },
      { label1: '12', label2: '30', heading: 120 },
    ],
  },
  KDEN: {
    icao: 'KDEN',
    name: 'Denver Intl',
    runways: [
      { label1: '07', label2: '25', heading: 70 },
      { label1: '08', label2: '26', heading: 80 },
      { label1: '16L', label2: '34R', heading: 160 },
      { label1: '16R', label2: '34L', heading: 160 },
      { label1: '17L', label2: '35R', heading: 170 },
      { label1: '17R', label2: '35L', heading: 170 },
    ],
  },
  KEWR: {
    icao: 'KEWR',
    name: 'Newark Liberty Intl',
    runways: [
      { label1: '04L', label2: '22R', heading: 40 },
      { label1: '04R', label2: '22L', heading: 40 },
      { label1: '11', label2: '29', heading: 110 },
    ],
  },
  KBOS: {
    icao: 'KBOS',
    name: 'Boston Logan Intl',
    runways: [
      { label1: '04L', label2: '22R', heading: 40 },
      { label1: '04R', label2: '22L', heading: 40 },
      { label1: '09', label2: '27', heading: 90 },
      { label1: '15R', label2: '33L', heading: 150 },
    ],
  },
  KSEA: {
    icao: 'KSEA',
    name: 'Seattle-Tacoma Intl',
    runways: [
      { label1: '16L', label2: '34R', heading: 160 },
      { label1: '16C', label2: '34C', heading: 160 },
      { label1: '16R', label2: '34L', heading: 160 },
    ],
  },
  KMSP: {
    icao: 'KMSP',
    name: 'Minneapolis-St Paul Intl',
    runways: [
      { label1: '04', label2: '22', heading: 40 },
      { label1: '12L', label2: '30R', heading: 120 },
      { label1: '12R', label2: '30L', heading: 120 },
      { label1: '17', label2: '35', heading: 170 },
    ],
  },
  KDTW: {
    icao: 'KDTW',
    name: 'Detroit Metro Wayne County',
    runways: [
      { label1: '03L', label2: '21R', heading: 30 },
      { label1: '03R', label2: '21L', heading: 30 },
      { label1: '04L', label2: '22R', heading: 40 },
      { label1: '04R', label2: '22L', heading: 40 },
      { label1: '09L', label2: '27R', heading: 90 },
      { label1: '09R', label2: '27L', heading: 90 },
    ],
  },
  KCLT: {
    icao: 'KCLT',
    name: 'Charlotte Douglas Intl',
    runways: [
      { label1: '05', label2: '23', heading: 50 },
      { label1: '18L', label2: '36R', heading: 180 },
      { label1: '18C', label2: '36C', heading: 180 },
      { label1: '18R', label2: '36L', heading: 180 },
    ],
  },
  KMCO: {
    icao: 'KMCO',
    name: 'Orlando Intl',
    runways: [
      { label1: '17L', label2: '35R', heading: 170 },
      { label1: '17R', label2: '35L', heading: 170 },
      { label1: '18L', label2: '36R', heading: 180 },
      { label1: '18R', label2: '36L', heading: 180 },
    ],
  },
  KTPA: {
    icao: 'KTPA',
    name: 'Tampa Intl',
    runways: [
      { label1: '01L', label2: '19R', heading: 10 },
      { label1: '01R', label2: '19L', heading: 10 },
      { label1: '10', label2: '28', heading: 100 },
    ],
  },
  KFLL: {
    icao: 'KFLL',
    name: 'Fort Lauderdale-Hollywood Intl',
    runways: [
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
    ],
  },
  KSLC: {
    icao: 'KSLC',
    name: 'Salt Lake City Intl',
    runways: [
      { label1: '16L', label2: '34R', heading: 160 },
      { label1: '16R', label2: '34L', heading: 160 },
      { label1: '17', label2: '35', heading: 170 },
    ],
  },
  KBWI: {
    icao: 'KBWI',
    name: 'Baltimore/Washington Intl',
    runways: [
      { label1: '10', label2: '28', heading: 100 },
      { label1: '15L', label2: '33R', heading: 150 },
      { label1: '15R', label2: '33L', heading: 150 },
    ],
  },
  KDCA: {
    icao: 'KDCA',
    name: 'Washington Reagan National',
    runways: [
      { label1: '01', label2: '19', heading: 10 },
      { label1: '04', label2: '22', heading: 40 },
      { label1: '15', label2: '33', heading: 150 },
    ],
  },
  KIAD: {
    icao: 'KIAD',
    name: 'Washington Dulles Intl',
    runways: [
      { label1: '01L', label2: '19R', heading: 10 },
      { label1: '01C', label2: '19C', heading: 10 },
      { label1: '01R', label2: '19L', heading: 10 },
      { label1: '12', label2: '30', heading: 120 },
    ],
  },
  KSTL: {
    icao: 'KSTL',
    name: 'St. Louis Lambert Intl',
    runways: [
      { label1: '06', label2: '24', heading: 60 },
      { label1: '11', label2: '29', heading: 110 },
      { label1: '12L', label2: '30R', heading: 120 },
      { label1: '12R', label2: '30L', heading: 120 },
    ],
  },
  KAUS: {
    icao: 'KAUS',
    name: 'Austin-Bergstrom Intl',
    runways: [
      { label1: '17L', label2: '35R', heading: 170 },
      { label1: '17R', label2: '35L', heading: 170 },
    ],
  },
  KSAT: {
    icao: 'KSAT',
    name: 'San Antonio Intl',
    runways: [
      { label1: '04', label2: '22', heading: 40 },
      { label1: '12L', label2: '30R', heading: 120 },
      { label1: '12R', label2: '30L', heading: 120 },
    ],
  },
  KHOU: {
    icao: 'KHOU',
    name: 'Houston Hobby',
    runways: [
      { label1: '04', label2: '22', heading: 40 },
      { label1: '12L', label2: '30R', heading: 120 },
      { label1: '12R', label2: '30L', heading: 120 },
      { label1: '17', label2: '35', heading: 170 },
    ],
  },
  KMDW: {
    icao: 'KMDW',
    name: 'Chicago Midway Intl',
    runways: [
      { label1: '04L', label2: '22R', heading: 40 },
      { label1: '04R', label2: '22L', heading: 40 },
      { label1: '13C', label2: '31C', heading: 130 },
      { label1: '13L', label2: '31R', heading: 130 },
      { label1: '13R', label2: '31L', heading: 130 },
    ],
  },
  KOAK: {
    icao: 'KOAK',
    name: 'Oakland Intl',
    runways: [
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
      { label1: '12', label2: '30', heading: 120 },
    ],
  },
  KSJC: {
    icao: 'KSJC',
    name: 'San Jose Mineta Intl',
    runways: [
      { label1: '12L', label2: '30R', heading: 120 },
      { label1: '12R', label2: '30L', heading: 120 },
    ],
  },
  KPDX: {
    icao: 'KPDX',
    name: 'Portland Intl',
    runways: [
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
      { label1: '03', label2: '21', heading: 30 },
    ],
  },
  KSNA: {
    icao: 'KSNA',
    name: 'Orange County John Wayne',
    runways: [
      { label1: '02L', label2: '20R', heading: 20 },
      { label1: '02R', label2: '20L', heading: 20 },
    ],
  },
  KONT: {
    icao: 'KONT',
    name: 'Ontario Intl',
    runways: [
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
    ],
  },
  KBUR: {
    icao: 'KBUR',
    name: 'Hollywood Burbank',
    runways: [
      { label1: '08', label2: '26', heading: 80 },
      { label1: '15', label2: '33', heading: 150 },
    ],
  },
  KELP: {
    icao: 'KELP',
    name: 'El Paso Intl',
    runways: [
      { label1: '04', label2: '22', heading: 40 },
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
    ],
  },
  KTUS: {
    icao: 'KTUS',
    name: 'Tucson Intl',
    runways: [
      { label1: '03', label2: '21', heading: 30 },
      { label1: '11L', label2: '29R', heading: 110 },
      { label1: '11R', label2: '29L', heading: 110 },
    ],
  },
  KABQ: {
    icao: 'KABQ',
    name: 'Albuquerque Intl Sunport',
    runways: [
      { label1: '03', label2: '21', heading: 30 },
      { label1: '08', label2: '26', heading: 80 },
      { label1: '12', label2: '30', heading: 120 },
    ],
  },
  KBNA: {
    icao: 'KBNA',
    name: 'Nashville Intl',
    runways: [
      { label1: '02L', label2: '20R', heading: 20 },
      { label1: '02C', label2: '20C', heading: 20 },
      { label1: '02R', label2: '20L', heading: 20 },
      { label1: '13', label2: '31', heading: 130 },
    ],
  },
  KMSY: {
    icao: 'KMSY',
    name: 'New Orleans Louis Armstrong',
    runways: [
      { label1: '02', label2: '20', heading: 20 },
      { label1: '11', label2: '29', heading: 110 },
    ],
  },
  KRDU: {
    icao: 'KRDU',
    name: 'Raleigh-Durham Intl',
    runways: [
      { label1: '05L', label2: '23R', heading: 50 },
      { label1: '05R', label2: '23L', heading: 50 },
      { label1: '14', label2: '32', heading: 140 },
    ],
  },
  KIND: {
    icao: 'KIND',
    name: 'Indianapolis Intl',
    runways: [
      { label1: '05L', label2: '23R', heading: 50 },
      { label1: '05R', label2: '23L', heading: 50 },
      { label1: '14', label2: '32', heading: 140 },
    ],
  },
  KPIT: {
    icao: 'KPIT',
    name: 'Pittsburgh Intl',
    runways: [
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10C', label2: '28C', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
      { label1: '14', label2: '32', heading: 140 },
    ],
  },
  KPBI: {
    icao: 'KPBI',
    name: 'Palm Beach Intl',
    runways: [
      { label1: '10L', label2: '28R', heading: 100 },
      { label1: '10R', label2: '28L', heading: 100 },
      { label1: '14', label2: '32', heading: 140 },
    ],
  },
  KRSW: {
    icao: 'KRSW',
    name: 'Fort Myers Southwest Florida',
    runways: [
      { label1: '06', label2: '24', heading: 60 },
      { label1: '13', label2: '31', heading: 130 },
    ],
  },
  KLGA: {
    icao: 'KLGA',
    name: 'New York LaGuardia',
    runways: [
      { label1: '04', label2: '22', heading: 40 },
      { label1: '13', label2: '31', heading: 130 },
    ],
  },
  KSMF: {
    icao: 'KSMF',
    name: 'Sacramento Intl',
    runways: [
      { label1: '16L', label2: '34R', heading: 160 },
      { label1: '16R', label2: '34L', heading: 160 },
    ],
  },
  PHNL: {
    icao: 'PHNL',
    name: 'Honolulu Daniel K. Inouye',
    runways: [
      { label1: '04L', label2: '22R', heading: 40 },
      { label1: '04R', label2: '22L', heading: 40 },
      { label1: '08L', label2: '26R', heading: 80 },
      { label1: '08R', label2: '26L', heading: 80 },
    ],
  },
  PANC: {
    icao: 'PANC',
    name: 'Anchorage Ted Stevens',
    runways: [
      { label1: '07L', label2: '25R', heading: 70 },
      { label1: '07R', label2: '25L', heading: 70 },
      { label1: '15', label2: '33', heading: 150 },
    ],
  },
}

// Resolve IATA or ICAO input to ICAO code
export function resolveIcao(input: string): string {
  const upper = input.toUpperCase().trim()
  return IATA_TO_ICAO[upper] || upper
}
