/**
 * Mock PSDBM Items Data
 * 
 * Realistic mock data from PS-PhilGEPS catalog
 * Used for development and testing when backend API is not available
 * 
 * Data based on actual PSDBM "Office Supplies" category items
 */

import { PSDBMItemAvailability } from '../types'
import type { PSDBMItem } from '../types'

export const mockPSDBMItems: PSDBMItem[] = [
  {
    itemCode: '44122105-BF-C02',
    description: 'CLIP, Backfold, 25mm',
    unitPrice: 19.91,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122105-BF-C02_111524025107.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122104-PC-J02',
    description: 'PAPER CLIP, Vinyl/Plastic Coated, Jumbo, 50mm',
    unitPrice: 18.2,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122104-PC-J02_020226101641.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122104-PC-G01',
    description: 'PAPER CLIP, vinyl/plastic coated, 33mm',
    unitPrice: 8.15,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122104-PC-G01_073020015851.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '31201512-TA-T02',
    description: 'TAPE, Transparent, 48mm',
    unitPrice: 28.08,
    unit: 'ROLL',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201512-TA-T02_082024104451.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '12191601-AL-E04',
    description: 'ALCOHOL, Ethyl, 500ml',
    unitPrice: 58.9,
    unit: 'BOTTLE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/12191601-AL-E04_101321020902.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122105-BF-C04',
    description: 'CLIP, Backfold, 50mm',
    unitPrice: 63.83,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122105-BF-C04_090624024728.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '31201503-TA-M02',
    description: 'TAPE, Masking, 48mm',
    unitPrice: 133.46,
    unit: 'ROLL',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201503-TA-M02_111524022644.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122105-BF-C03',
    description: 'CLIP, Backfold, 32mm',
    unitPrice: 29.35,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122105-BF-C03_032621013757.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44121613-SR-P02',
    description: 'STAPLE REMOVER, plier type',
    unitPrice: 32.57,
    unit: 'PIECE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121613-SR-P02_050624094458.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44101602-PU-P01',
    description: 'PUNCHER, Paper, Heavy Duty',
    unitPrice: 151.68,
    unit: 'PIECE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44101602-PU-P01_112425022710.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '12171703-SI-P01',
    description: 'STAMP PAD, Ink',
    unitPrice: 37.86,
    unit: 'BOTTLE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/12171703-SI-P01_031924113721.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '31151804-SW-S01',
    description: 'STAPLE WIRE, standard',
    unitPrice: 28.5,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31151804-SW-S01_072122101941.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44121615-ST-S01',
    description: 'STAPLER, Standard Type',
    unitPrice: 90.46,
    unit: 'PIECE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121615-ST-S01_111225104312.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44121619-PS-M01',
    description: 'PENCIL SHARPENER',
    unitPrice: 258.59,
    unit: 'PIECE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121619-PS-M01_073020020024.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '12191601-AL-E03',
    description: 'ALCOHOL, Ethyl, 1 Gallon',
    unitPrice: 405.8,
    unit: 'GALLON',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/12191601-AL-E03_090621014912.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '31151507-TW-P01',
    description: 'TWINE, plastic',
    unitPrice: 76.95,
    unit: 'ROLL',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31151507-TW-P01_092520021959.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44121612-CU-H01',
    description: 'CUTTER/UTILITY KNIFE, Heavy Duty',
    unitPrice: 30.08,
    unit: 'PIECE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121612-CU-H01_031525100615.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122008-IT-T01',
    description: 'INDEX TAB',
    unitPrice: 79.03,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122008-IT-T01_111124112222.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44121612-BL-H01',
    description: 'BLADE, for general purpose cutter/utility knife',
    unitPrice: 16.62,
    unit: 'TUBE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121612-BL-H01_102425091918.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122101-RU-B01',
    description: 'RUBBER BAND',
    unitPrice: 143.95,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122101-RU-B01_102225034902.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122037-RB-P10',
    description: 'BINDING RING/COMB, plastic, 32mm',
    unitPrice: 222.49,
    unit: 'BUNDLE',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122037-RB-P10_030725041020.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '13111201-CF-P02',
    description: 'CARBON FILM, Legal Size',
    unitPrice: 349.48,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/13111201-CF-P02_073020013432.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '31201517-TA-P01',
    description: 'TAPE, Packaging, 48mm',
    unitPrice: 29.56,
    unit: 'ROLL',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201517-TA-P01_020226102016.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '31151804-SW-H01',
    description: 'STAPLE WIRE, Heavy Duty (Binder Type), 23/13',
    unitPrice: 21.15,
    unit: 'BOX',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31151804-SW-H01_072122102548.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
  {
    itemCode: '44122011-FO-L01',
    description: 'FOLDER, L-type, A4',
    unitPrice: 183.91,
    unit: 'PACK',
    imageUrl:
      'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122011-FO-L01_090622104948.jpg',
    availability: PSDBMItemAvailability.AVAILABLE,
  },
]

/**
 * Filter mock items by search term and category
 */
export function filterMockPSDBMItems(
  items: PSDBMItem[],
  searchTerm?: string,
  category?: string
): PSDBMItem[] {
  return items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    // All mock items are in "Office Supplies" category
    const matchesCategory =
      !category || category === 'All' || category === 'Office Supplies'

    return matchesSearch && matchesCategory
  })
}

/**
 * Get paginated results from mock items
 */
export function paginateMockPSDBMItems(
  items: PSDBMItem[],
  page: number = 1,
  pageSize: number = 25
): { items: PSDBMItem[]; total: number } {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    items: items.slice(start, end),
    total: items.length,
  }
}
