/**
 * Mock APR Items from PSDBM Catalog
 * 
 * Fallback mock data for APR when PSDBM catalog URL doesn't return data
 * Based on PS-PhilGEPS catalog HTML response parsing
 * 
 * Usage: When getPSDBMItemsRequest fails or returns empty, use this data
 * for development and testing
 * 
 * Source data extracted from PSDBM catalog items
 * Reference: parseItemsFromHTML.ts, convertToAPRItem.ts
 */

import type { PSDBMItem, PSDBMItemAvailability } from '../types'

/**
 * Comprehensive office supplies catalog from PSDBM
 * Includes available, limited, and out-of-stock items
 */
export const mockAPRCatalogItems: PSDBMItem[] = [
  // Writing & Marking Supplies
  {
    itemCode: '44121708-MP-B01',
    description: 'MARKER, Permanent, Black',
    unitPrice: 15.84,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121708-MP-B01_091825021931.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44121708-MP-B02',
    description: 'MARKER, Permanent, Blue',
    unitPrice: 15.3,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121708-MP-B02_091825021946.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44121708-MP-B03',
    description: 'MARKER, Permanent, Red',
    unitPrice: 15.03,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121708-MP-B03_091825021958.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G07',
    description: 'SIGN PEN, Medium Tip, Black',
    unitPrice: 62.08,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G07_090525085811.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44121708-MW-B01',
    description: 'MARKER, Whiteboard, Black',
    unitPrice: 22.17,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121708-MW-B01_072122115447.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G08',
    description: 'SIGN PEN, Medium Tip, Blue',
    unitPrice: 61.76,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G08_090525085917.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G05',
    description: 'SIGN PEN, Fine Tip, Blue',
    unitPrice: 25.86,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G05_022425094610.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G04',
    description: 'SIGN PEN, Fine Tip, Black',
    unitPrice: 25.07,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G04_022425094552.jpg',
    availability: 'Available',
  },
  
  // Paper & Office Materials
  {
    itemCode: '14111507-PP-M02',
    description: 'PAPER, MULTICOPY, Legal',
    unitPrice: 227.64,
    unit: 'REAM',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111507-PP-M02_072122095827.jpg',
    availability: 'Available',
  },
  {
    itemCode: '31151804-SW-S01',
    description: 'STAPLE WIRE, standard',
    unitPrice: 28.5,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31151804-SW-S01_072122101941.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G06',
    description: 'SIGN PEN, Fine Tip, Red',
    unitPrice: 28.76,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G06_022425094624.jpg',
    availability: 'Available',
  },
  {
    itemCode: '12191601-AL-E04',
    description: 'ALCOHOL, Ethyl, 500ml',
    unitPrice: 58.9,
    unit: 'BOTTLE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/12191601-AL-E04_101321020902.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G09',
    description: 'SIGN PEN, Medium Tip, Red',
    unitPrice: 63.62,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G09_090525085953.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G01',
    description: 'SIGN PEN, Extra Fine Tip, Black',
    unitPrice: 38.1,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G01_022725105157.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G02',
    description: 'SIGN PEN, Extra Fine Tip, Blue',
    unitPrice: 36.96,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G02_022725105116.jpg',
    availability: 'Available',
  },
  {
    itemCode: '31201512-TA-T02',
    description: 'TAPE, Transparent, 48mm',
    unitPrice: 28.08,
    unit: 'ROLL',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201512-TA-T02_082024104451.jpg',
    availability: 'Available',
  },
  
  // Cleaning & Maintenance
  {
    itemCode: '47131805-CL-P01',
    description: 'CLEANSER, Scouring Powder',
    unitPrice: 42.22,
    unit: 'CAN',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/47131805-CL-P01_102225045736.jpg',
    availability: 'Available',
  },
  {
    itemCode: '14111514-NB-S02',
    description: 'STENO NOTEBOOK',
    unitPrice: 16.35,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111514-NB-S02_102225033431.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121524-SP-G03',
    description: 'SIGN PEN, Extra fine tip, Red',
    unitPrice: 35.09,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121524-SP-G03_022725105347.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44111912-ER-B01',
    description: 'ERASER, Felt',
    unitPrice: 13.77,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44111912-ER-B01_102225032132.jpg',
    availability: 'Available',
  },
  {
    itemCode: '47131830-FC-A01',
    description: 'FURNITURE CLEANER',
    unitPrice: 168.57,
    unit: 'CAN',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/47131830-FC-A01_073020013218.jpg',
    availability: 'Available',
  },
  {
    itemCode: '14111531-RE-B01',
    description: 'RECORD BOOK, 300 pages',
    unitPrice: 89.73,
    unit: 'BOOK',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111531-RE-B01_090525085542.jpg',
    availability: 'Available',
  },
  {
    itemCode: '14111531-PP-R01',
    description: 'PAD PAPER, ruled',
    unitPrice: 35.42,
    unit: 'PAD',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111531-PP-R01_112023121950.jpg',
    availability: 'Available',
  },
  {
    itemCode: '47131803-DS-A01',
    description: 'DISINFECTANT SPRAY',
    unitPrice: 289.75,
    unit: 'CAN',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/47131803-DS-A01_073020013157.jpg',
    availability: 'Available',
  },
  
  // Office Equipment & Accessories
  {
    itemCode: '44122101-RU-B01',
    description: 'RUBBER BAND',
    unitPrice: 143.95,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122101-RU-B01_102225034902.jpg',
    availability: 'Available',
  },
  {
    itemCode: '47131602-SC-N01',
    description: 'SCOURING PAD',
    unitPrice: 114.46,
    unit: 'PACK',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/47131602-SC-N01_101421015815.jpg',
    availability: 'Available',
  },
  {
    itemCode: '14111514-NP-S03',
    description: 'NOTEPAD, Stick-on, 76mm x 76mm',
    unitPrice: 21.95,
    unit: 'PAD',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111514-NP-S03_102425093048.jpg',
    availability: 'Available',
  },
  {
    itemCode: '31201503-TA-M02',
    description: 'TAPE, Masking, 48mm',
    unitPrice: 133.46,
    unit: 'ROLL',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201503-TA-M02_111524022644.jpg',
    availability: 'Available',
  },
  {
    itemCode: '14111525-CA-A01',
    description: 'CARTOLINA, assorted colors',
    unitPrice: 201.87,
    unit: 'PACK',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111525-CA-A01_052621101034.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44122008-IT-T01',
    description: 'INDEX TAB',
    unitPrice: 79.03,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122008-IT-T01_111124112222.jpg',
    availability: 'Available',
  },
  
  // IT & Technology Supplies
  {
    itemCode: '13111201-CF-P02',
    description: 'CARBON FILM, Legal Size',
    unitPrice: 349.48,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/13111201-CF-P02_073020013432.jpg',
    availability: 'Available',
  },
  {
    itemCode: '47121702-WB-P01',
    description: 'WASTEBASKET',
    unitPrice: 73.55,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/47121702-WB-P01_020226102115.jpg',
    availability: 'Available',
  },
  {
    itemCode: '14111531-RE-B02',
    description: 'RECORD BOOK, 500 pages',
    unitPrice: 121.35,
    unit: 'BOOK',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111531-RE-B02_110421103400.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44121615-ST-S01',
    description: 'STAPLER, Standard Type',
    unitPrice: 90.46,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121615-ST-S01_111225104312.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44101602-PU-P01',
    description: 'PUNCHER, Paper, Heavy Duty',
    unitPrice: 151.68,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44101602-PU-P01_112425022710.jpg',
    availability: 'Available',
  },
  {
    itemCode: '12191601-AL-E03',
    description: 'ALCOHOL, Ethyl, 1 Gallon',
    unitPrice: 405.8,
    unit: 'GALLON',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/12191601-AL-E03_090621014912.jpg',
    availability: 'Available',
  },
  
  // Paper Clips & Fasteners
  {
    itemCode: '44122104-PC-J02',
    description: 'PAPER CLIP, Vinyl/Plastic Coated, Jumbo, 50mm',
    unitPrice: 18.2,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122104-PC-J02_020226101641.jpg',
    availability: 'Available',
  },
  {
    itemCode: '39101628-LB-L01',
    description: 'LIGHT EMITTING DIODE (LED), Light Bulb, 7 watts',
    unitPrice: 89.73,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/39101628-LB-L01_121625095041.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44121619-PS-M01',
    description: 'PENCIL SHARPENER',
    unitPrice: 258.59,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121619-PS-M01_073020020024.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121413-CB-P02',
    description: 'CLEARBOOK, Legal size',
    unitPrice: 37.04,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121413-CB-P02_092225100605.jpg',
    availability: 'Available',
  },
  
  // Furniture
  {
    itemCode: '56101504-CM-W01',
    description: 'MONOBLOC CHAIR, White',
    unitPrice: 354.19,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/56101504-CM-W01_022625024910.jpg',
    availability: 'Available',
  },
  {
    itemCode: '31151507-TW-P01',
    description: 'TWINE, plastic',
    unitPrice: 76.95,
    unit: 'ROLL',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31151507-TW-P01_092520021959.jpg',
    availability: 'Available',
  },
  {
    itemCode: '56101504-CM-B01',
    description: 'MONOBLOC CHAIR, Beige',
    unitPrice: 354.47,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/56101504-CM-B01_022625024845.jpg',
    availability: 'Available',
  },
  {
    itemCode: '60121124-WR-P01',
    description: 'WRAPPING PAPER, kraft',
    unitPrice: 328.41,
    unit: 'PACK',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/60121124-WR-P01_040621022958.jpg',
    availability: 'Available',
  },
  
  // File & Storage
  {
    itemCode: '44122011-FO-T02',
    description: 'FOLDER WITH TAB, LEGAL',
    unitPrice: 396.93,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122011-FO-T02_102425090402.jpg',
    availability: 'Available',
  },
  {
    itemCode: '44111515-FO-X01',
    description: 'FILE ORGANIZER',
    unitPrice: 121.82,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44111515-FO-X01_032621013907.jpg',
    availability: 'Available',
  },
  {
    itemCode: '31151804-SW-H01',
    description: 'STAPLE WIRE, Heavy Duty (Binder Type), 23/13',
    unitPrice: 21.15,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31151804-SW-H01_072122102548.jpg',
    availability: 'Available',
  },
  {
    itemCode: '13111203-AC-F01',
    description: 'ACETATE',
    unitPrice: 1262.5,
    unit: 'ROLL',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/13111203-AC-F01_032621013708.jpg',
    availability: 'Available',
  },
  {
    itemCode: '39101628-LT-L01',
    description: 'LIGHT EMITTING DIODE (LED), Linear Tube, 18 watts',
    unitPrice: 208.9,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/39101628-LT-L01_121725085445.jpg',
    availability: 'Available',
  },
  
  // Out of Stock Items
  {
    itemCode: '31201517-TA-P01',
    description: 'TAPE, Packaging, 48mm',
    unitPrice: 29.56,
    unit: 'ROLL',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201517-TA-P01_020226102016.jpg',
    availability: 'Out of Stock',
  },
  {
    itemCode: '31201610-GL-J01',
    description: 'GLUE, All Purpose',
    unitPrice: 63.07,
    unit: 'JAR',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/31201610-GL-J01_102325095115.jpg',
    availability: 'Out of Stock',
  },
  {
    itemCode: '31201610-GL-J02',
    description: 'Glue, All-Purpose',
    unitPrice: 62.14,
    unit: 'BOTTLE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/no_image.jpg',
    availability: 'Out of Stock',
  },
  
  // For Replenishment Items
  {
    itemCode: '14111507-PP-M01',
    description: 'PAPER, MULTICOPY, A4',
    unitPrice: 213.86,
    unit: 'REAM',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111507-PP-M01_072122095811.jpg',
    availability: 'Limited',
  },
  {
    itemCode: '44121801-CT-R02',
    description: 'CORRECTION TAPE',
    unitPrice: 23.03,
    unit: 'PIECE',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44121801-CT-R02_041724035724.jpg',
    availability: 'Limited',
  },
  {
    itemCode: '44122105-BF-C01',
    description: 'CLIP, Backfold, 19mm',
    unitPrice: 11.29,
    unit: 'BOX',
    imageUrl: 'https://sys.ps-philgeps.gov.ph/catalogue/user_images/44122105-BF-C01_032621013727.jpg',
    availability: 'Limited',
  },
]

/**
 * Get fallback mock data when API fails
 * Call this function when getPSDBMItemsRequest fails or times out
 */
export function getAPRCatalogMockData(options?: {
  limit?: number
  availability?: 'Available' | 'Limited' | 'Out of Stock' | 'All'
}): PSDBMItem[] {
  let items = [...mockAPRCatalogItems]

  // Filter by availability
  if (options?.availability && options.availability !== 'All') {
    items = items.filter((item) => item.availability === options.availability)
  }

  // Apply limit
  if (options?.limit && options.limit > 0) {
    items = items.slice(0, options.limit)
  }

  return items
}

/**
 * Get random subset of catalog items
 * Useful for paginated mock responses
 */
export function getRandomAPRCatalogItems(count: number = 10): PSDBMItem[] {
  const shuffled = [...mockAPRCatalogItems].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Search mock catalog items
 * Simple string matching on description and item code
 */
export function searchAPRCatalogItems(query: string): PSDBMItem[] {
  const lowerQuery = query.toLowerCase()
  return mockAPRCatalogItems.filter(
    (item) =>
      item.description.toLowerCase().includes(lowerQuery) ||
      item.itemCode.toLowerCase().includes(lowerQuery) ||
      item.unit.toLowerCase().includes(lowerQuery)
  )
}
