/**
 * Mock PSDBM Depots Data
 * 
 * Regional depots and LGU locations for PSDBM catalog
 * Used for Regional and LGU catalog modes
 */

import type { PSDBMDepot } from '../types'

export const mockPSDBMDepots: PSDBMDepot[] = [
  {
    id: '1',
    name: 'BAGUIO',
    region: 'CAR',
  },
  {
    id: '2',
    name: 'CEBU',
    region: 'Central Visayas',
  },
  {
    id: '3',
    name: 'DAVAO',
    region: 'Davao Region',
  },
  {
    id: '4',
    name: 'MISAMIS ORIENTAL',
    region: 'Northern Mindanao',
  },
  {
    id: '5',
    name: 'MANILA',
    region: 'NCR',
  },
  {
    id: '6',
    name: 'ANGELES',
    region: 'Central Luzon',
  },
  {
    id: '7',
    name: 'ILOILO',
    region: 'Western Visayas',
  },
  {
    id: '8',
    name: 'CAGAYAN DE ORO',
    region: 'Northern Mindanao',
  },
  {
    id: '9',
    name: 'BACOLOD',
    region: 'Western Visayas',
  },
  {
    id: '10',
    name: 'BUTUAN',
    region: 'Caraga',
  },
  {
    id: '11',
    name: 'DAGUPAN',
    region: 'Ilocos Region',
  },
  {
    id: '12',
    name: 'TACLOBAN',
    region: 'Eastern Visayas',
  },
]
