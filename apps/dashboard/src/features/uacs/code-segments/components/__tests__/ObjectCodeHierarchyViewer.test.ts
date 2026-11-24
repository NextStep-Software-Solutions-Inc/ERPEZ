import { describe, it, expect } from 'vitest'
import type { ObjectCode } from '../../types/objectCodeTypes'

// Replicating buildHierarchy & filterTree logic from ObjectCodeHierarchyViewer
interface HierarchyNode {
  id: string
  code: string
  name: string
  expenseClass: string
  isActive: boolean
  level: number
  children?: HierarchyNode[]
}

function buildHierarchy(codes: ObjectCode[]): HierarchyNode[] {
  const codeMap = new Map<string, ObjectCode>()
  codes.forEach((code) => codeMap.set(code.id, code))

  const buildNode = (code: ObjectCode, level: number): HierarchyNode => {
    const children = codes
      .filter((c) => c.parentId === code.id)
      .map((c) => buildNode(c, level + 1))
      .sort((a, b) => a.code.localeCompare(b.code))

    return {
      id: code.id,
      code: code.code,
      name: code.name,
      expenseClass: code.expenseClass,
      isActive: code.isActive,
      level,
      children: children.length > 0 ? children : undefined,
    }
  }

  return codes
    .filter((code) => !code.parentId || !codeMap.has(code.parentId))
    .map((code) => buildNode(code, 0))
    .sort((a, b) => a.code.localeCompare(b.code))
}

function filterHierarchy(hierarchyData: HierarchyNode[], searchQuery?: string): HierarchyNode[] {
  const query = searchQuery?.trim().toLowerCase()
  if (!query) return hierarchyData

  const filterTree = (nodes: HierarchyNode[]): HierarchyNode[] => {
    const result: HierarchyNode[] = []
    for (const node of nodes) {
      const selfMatch =
        node.code.toLowerCase().includes(query) ||
        node.name.toLowerCase().includes(query)
      const matchingChildren = node.children ? filterTree(node.children) : []

      if (selfMatch || matchingChildren.length > 0) {
        result.push({
          ...node,
          children: matchingChildren.length > 0 ? matchingChildren : (selfMatch ? node.children : undefined),
        })
      }
    }
    return result
  }

  return filterTree(hierarchyData)
}

describe('ObjectCodeHierarchyViewer filterTree', () => {
  const mockCodes: ObjectCode[] = [
    {
      id: '1',
      code: 'CLS:Assets',
      name: 'Assets',
      description: '',
      isActive: true,
      fiscalYear: '2026',
      createdAt: '',
      updatedAt: '',
      expenseClass: 'OTHER',
      isSubsidiary: false,
    },
    {
      id: '2',
      code: 'SC:Inventories',
      name: 'Inventories',
      description: '',
      isActive: true,
      fiscalYear: '2026',
      createdAt: '',
      updatedAt: '',
      expenseClass: 'OTHER',
      parentId: '1',
      isSubsidiary: true,
    },
    {
      id: '3',
      code: 'CLS:Equity',
      name: 'Equity',
      description: '',
      isActive: true,
      fiscalYear: '2026',
      createdAt: '',
      updatedAt: '',
      expenseClass: 'OTHER',
      isSubsidiary: false,
    },
    {
      id: '4',
      code: 'SC:Intermediate Accounts',
      name: 'Intermediate Accounts',
      description: '',
      isActive: true,
      fiscalYear: '2026',
      createdAt: '',
      updatedAt: '',
      expenseClass: 'OTHER',
      parentId: '3',
      isSubsidiary: true,
    },
    {
      id: '5',
      code: 'CLS:Expenses',
      name: 'Expenses',
      description: '',
      isActive: true,
      fiscalYear: '2026',
      createdAt: '',
      updatedAt: '',
      expenseClass: 'OTHER',
      isSubsidiary: false,
    },
    {
      id: '6',
      code: '50000000',
      name: 'Expenses',
      description: '',
      isActive: true,
      fiscalYear: '2026',
      createdAt: '',
      updatedAt: '',
      expenseClass: 'MOOE',
      parentId: '5',
      isSubsidiary: true,
    },
  ]

  it('filters hierarchy to only matching nodes', () => {
    const tree = buildHierarchy(mockCodes)
    const filtered = filterHierarchy(tree, 'expen')

    console.log('Filtered root nodes:', filtered.map((n) => n.code))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].code).toBe('CLS:Expenses')
  })

  it('correctly marks ancestors for auto-expansion', () => {
    const tree = buildHierarchy(mockCodes)
    const query = '50000000'
    const nodesToExpand = new Set<string>()

    const markAncestors = (nodeList: HierarchyNode[], path: string[]): boolean => {
      let anyMatch = false
      for (const node of nodeList) {
        const matches =
          node.code.toLowerCase().includes(query) ||
          node.name.toLowerCase().includes(query)
        const currentPath = [...path, node.id]
        let childMatches = false

        if (node.children && node.children.length > 0) {
          childMatches = markAncestors(node.children, currentPath)
        }

        if (matches || childMatches) {
          anyMatch = true
          for (const ancestorId of path) {
            nodesToExpand.add(ancestorId)
          }
          if (childMatches) {
            nodesToExpand.add(node.id)
          }
        }
      }
      return anyMatch
    }

    markAncestors(tree, [])
    console.log('Nodes to expand:', Array.from(nodesToExpand))
    // Node '5' is CLS:Expenses (parent of 6)
    expect(nodesToExpand.has('5')).toBe(true)
  })

  it('filters hierarchy by code search 50000000', () => {
    const tree = buildHierarchy(mockCodes)
    const filtered = filterHierarchy(tree, '50000000')

    console.log('Filtered by code:', filtered.map((n) => n.code))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].code).toBe('CLS:Expenses')
    expect(filtered[0].children).toHaveLength(1)
    expect(filtered[0].children![0].code).toBe('50000000')
  })
})
