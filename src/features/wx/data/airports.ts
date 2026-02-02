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
  // US common
  LAX: 'KLAX', SFO: 'KSFO', JFK: 'KJFK', ORD: 'KORD',
  DFW: 'KDFW', ATL: 'KATL', MIA: 'KMIA', DEN: 'KDEN',
  SAN: 'KSAN', PHX: 'KPHX', LAS: 'KLAS', IAH: 'KIAH',
  EWR: 'KEWR', BOS: 'KBOS', SEA: 'KSEA', MSP: 'KMSP',
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
}

// Resolve IATA or ICAO input to ICAO code
export function resolveIcao(input: string): string {
  const upper = input.toUpperCase().trim()
  return IATA_TO_ICAO[upper] || upper
}
