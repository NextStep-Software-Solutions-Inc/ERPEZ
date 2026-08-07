/**
 * HTML Parser for PSDBM Catalog Response
 * 
 * Extracts structured item data from the PS-PhilGEPS HTML catalog response
 * Uses native DOMParser API available in browser
 * 
 * Reference: parseItemsFromHTML.ts
 */

import type {
  PSDBMItem,
  PSDBMItemAvailability,
  PSDBMCatalogResponse,
} from '../types'

/**
 * Parse item code from item_preview.php URL
 * Example: "item_preview.php?item_code=44122105-BF-C02&cat=..."
 * Returns: "44122105-BF-C02"
 */
export function extractItemCode(href: string): string {
  const url = new URL(href, 'https://sys.ps-philgeps.gov.ph')
  return url.searchParams.get('item_code') || ''
}

/**
 * Parse price and unit from price text
 * Example: "Php 19.91 / BOX"
 * Returns: { amount: 19.91, unit: "BOX" }
 */
export function extractPrice(priceText: string): {
  amount: number
  unit: string
} {
  const match = priceText.match(/Php\s+([\d,]+\.?\d*)\s*\/\s*(\w+)/i)

  if (!match) {
    return { amount: 0, unit: '' }
  }

  const amount = parseFloat(match[1].replace(/,/g, ''))
  const unit = match[2].toUpperCase().trim()

  return { amount, unit }
}

/**
 * Normalize image URL for PSDBM catalog
 * Handles relative paths and converts to absolute URLs
 */
export function normalizeImageUrl(src: string): string {
  if (!src) return ''

  // If already absolute, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // Convert relative path to absolute
  // PSDBM images are typically stored at: ../catalogue/user_images/
  const baseUrl = 'https://sys.ps-philgeps.gov.ph/'
  const normalizedPath = src.startsWith('/') ? src.substring(1) : src

  // Resolve relative paths
  if (normalizedPath.includes('../../')) {
    return baseUrl + normalizedPath.replace('../../', '')
  }
  if (normalizedPath.includes('../')) {
    return baseUrl + normalizedPath.replace('../', '')
  }

  return baseUrl + normalizedPath
}

/**
 * Extract availability status from status badge
 * Usually displays "Available", "Limited", or "Out of Stock"
 */
export function extractAvailability(
  statusText: string
): PSDBMItemAvailability {
  const text = statusText.toLowerCase().trim()

  if (text.includes('available')) {
    if (text.includes('limited')) return 'Limited' as PSDBMItemAvailability
    return 'Available' as PSDBMItemAvailability
  }

  if (text.includes('out')) {
    return 'Out of Stock' as PSDBMItemAvailability
  }

  // Default to available if unsure
  return 'Available' as PSDBMItemAvailability
}

/**
 * Parse a single item card from PSDBM HTML
 * Each item is wrapped in a col-3 div with card class
 */
function parseItemCard(cardElement: Element): PSDBMItem | null {
  try {
    // Extract item code from link
    const itemLink = cardElement.querySelector('a')
    if (!itemLink) return null

    const href = itemLink.getAttribute('href') || ''
    const itemCode = extractItemCode(href)
    if (!itemCode) return null

    // Extract description
    const descElement = cardElement.querySelector('p#text-one-line strong')
    const description = descElement?.textContent?.trim() || ''

    // Extract price text
    const priceElements = Array.from(
      cardElement.querySelectorAll('p[style*="font-weight:bold"]')
    )
    const priceElement = priceElements.find((p) =>
      p.textContent?.toLowerCase().includes('php')
    )
    const priceText = priceElement?.textContent?.trim() || ''
    const { amount: unitPrice, unit } = extractPrice(priceText)

    // Extract image
    const imgElement = cardElement.querySelector('img')
    const imageSrc = imgElement?.getAttribute('src') || ''
    const imageUrl = normalizeImageUrl(imageSrc)

    // Extract availability status
    const statusDiv = cardElement.querySelector(
      'div[style*="background-color"]'
    )
    const statusText = statusDiv?.textContent?.trim() || 'Available'
    const availability = extractAvailability(statusText)

    if (!itemCode || !description || !unitPrice || !unit) {
      return null
    }

    return {
      itemCode,
      description,
      unitPrice,
      unit,
      imageUrl,
      availability,
    }
  } catch (error) {
    console.error('Error parsing item card:', error)
    return null
  }
}

/**
 * Main parser function: Extract all items from PSDBM HTML response
 * 
 * @param htmlString - Raw HTML response from PSDBM endpoint
 * @returns Array of parsed PSDBMItem objects
 */
export function parseItemsFromHTML(htmlString: string): PSDBMItem[] {
  try {
    // Create DOM parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    // Check for parse errors
    if (
      doc.documentElement.nodeName === 'parsererror' ||
      doc.body.innerHTML.includes('parsererror')
    ) {
      console.error('HTML Parse Error:', doc.body.innerHTML)
      return []
    }

    // Find all item cards (col-3 divs with card class)
    const cardElements = Array.from(
      doc.querySelectorAll('.col-3 .card, .col-3 > div')
    )

    // Parse each card into PSDBMItem
    const items: PSDBMItem[] = []
    for (const cardElement of cardElements) {
      const item = parseItemCard(cardElement)
      if (item) {
        items.push(item)
      }
    }

    return items
  } catch (error) {
    console.error('Error parsing PSDBM HTML response:', error)
    return []
  }
}

/**
 * Extract catalog metadata from HTML response
 * Returns category name being browsed
 */
export function extractCategoryFromHTML(htmlString: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    // Look for h1 in header containing category name
    const headerH1 = doc.querySelector('header center h1')
    const categoryName = headerH1?.textContent?.trim() || 'Uncategorized'

    return categoryName
  } catch (error) {
    console.error('Error extracting category:', error)
    return 'Uncategorized'
  }
}

/**
 * Extract search term from HTML response
 */
export function extractSearchTermFromHTML(htmlString: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    // Look for "Searching: <term>" text
    const searchTexts = Array.from(doc.querySelectorAll('p b'))
    const searchPara = searchTexts.find((p) =>
      p.textContent?.toLowerCase().includes('searching')
    )

    if (searchPara?.parentElement) {
      const text = searchPara.parentElement.textContent || ''
      const match = text.match(/Searching\s*:\s*(.+?)(?:\n|$)/i)
      return match?.[1]?.trim() || ''
    }

    return ''
  } catch (error) {
    console.error('Error extracting search term:', error)
    return ''
  }
}

/**
 * Complete parsing function: Returns full PSDBMCatalogResponse
 * 
 * @param htmlString - Raw HTML from PSDBM endpoint
 * @param category - Category being browsed
 * @param searchTerm - Search term used (optional)
 * @param mode - Catalog mode (main, regional, lgu)
 * @param depot - Depot name for regional/lgu modes
 * @returns Fully structured PSDBMCatalogResponse
 */
export function parsePSDBMCatalogResponse(
  htmlString: string,
  category: string,
  searchTerm?: string,
  mode?: string,
  depot?: string
): PSDBMCatalogResponse {
  const items = parseItemsFromHTML(htmlString)
  const extractedCategory = extractCategoryFromHTML(htmlString)
  const extractedSearchTerm =
    searchTerm || extractSearchTermFromHTML(htmlString)

  return {
    items,
    category: extractedCategory || category,
    searchTerm: extractedSearchTerm,
    mode: (mode as any) || 'main',
    depot,
    totalItems: items.length,
  }
}
