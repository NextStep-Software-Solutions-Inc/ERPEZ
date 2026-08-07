import type { PPMPItem } from '../types'

/**
 * PPMP Mock Data
 *
 * Realistic test data for PPMP (Procurement Plans) with various:
 * - Offices/Departments
 * - Budget ranges
 * - Item quantities
 * - Fund sources
 * - Categories
 *
 * Used for development and testing until API is available
 */

export const MOCK_OFFICES = [
  'Planning & Development Office',
  'Finance Department',
  'Human Resources',
  'Operations Division',
  'IT Services',
  'Procurement Department',
  'Legal Affairs',
  'Quality Assurance',
]

export const MOCK_FUND_SOURCES = [
  'General Appropriations Act (GAA)',
  'Special Purposes',
  'Loan Funds',
  'Foreign Assisted Project',
]

export const MOCK_ITEM_CATEGORIES = [
  'IT Equipment',
  'Office Supplies',
  'Vehicles',
  'Construction',
  'Consultancy Services',
  'Maintenance & Repair',
  'Training & Development',
]

export const MOCK_PPMPS: PPMPItem[] = [
  // PPMP-2024-001
  {
    id: 'PPMP-2024-001-IT-001',
    code: 'IT-001',
    description: 'Desktop Computers (Intel Core i7, 16GB RAM, 512GB SSD)',
    unit: 'unit',
    quantity: 25,
    unitCost: 45000,
    totalAmount: 1125000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'CO',
    ppmpVersion: 1,
    remarks: 'Required for new workstations in the IT labs',
  },
  {
    id: 'PPMP-2024-001-IT-002',
    code: 'IT-002',
    description: 'Laser Printers (Color, Network-enabled)',
    unit: 'unit',
    quantity: 8,
    unitCost: 28000,
    totalAmount: 224000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-001-OS-001',
    code: 'OS-001',
    description: 'A4 Bond Paper (80gsm, 500 sheets per ream)',
    unit: 'ream',
    quantity: 1000,
    unitCost: 210,
    totalAmount: 210000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Office Supplies',
    office: 'Planning & Development Office',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-001-OS-002',
    code: 'OS-002',
    description: 'Ballpoint Pens (Box of 50)',
    unit: 'box',
    quantity: 50,
    unitCost: 350,
    totalAmount: 17500,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Office Supplies',
    office: 'Planning & Development Office',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },

  // PPMP-2024-002
  {
    id: 'PPMP-2024-002-VEH-001',
    code: 'VEH-001',
    description: 'Pickup Truck 4x4 (Diesel, Manual)',
    unit: 'unit',
    quantity: 3,
    unitCost: 1250000,
    totalAmount: 3750000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Special Purposes',
    itemCategory: 'Vehicles',
    office: 'Operations Division',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-002-VEH-002',
    code: 'VEH-002',
    description: 'Vehicle Maintenance Service (Annual contract)',
    unit: 'contract',
    quantity: 3,
    unitCost: 150000,
    totalAmount: 450000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Maintenance & Repair',
    office: 'Operations Division',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },

  // PPMP-2024-003
  {
    id: 'PPMP-2024-003-CON-001',
    code: 'CON-001',
    description: 'Office Building Renovation (Phase 1)',
    unit: 'project',
    quantity: 1,
    unitCost: 5000000,
    totalAmount: 5000000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Loan Funds',
    itemCategory: 'Construction',
    office: 'Finance Department',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-003-CON-002',
    code: 'CON-002',
    description: 'Design & Engineering Services',
    unit: 'service',
    quantity: 1,
    unitCost: 250000,
    totalAmount: 250000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Loan Funds',
    itemCategory: 'Consultancy Services',
    office: 'Finance Department',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },

  // PPMP-2024-004
  {
    id: 'PPMP-2024-004-TRAIN-001',
    code: 'TRAIN-001',
    description: 'Advanced Excel Training (20 participants)',
    unit: 'session',
    quantity: 1,
    unitCost: 50000,
    totalAmount: 50000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Training & Development',
    office: 'Human Resources',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-004-TRAIN-002',
    code: 'TRAIN-002',
    description: 'Procurement & Supply Chain Management Course',
    unit: 'course',
    quantity: 1,
    unitCost: 75000,
    totalAmount: 75000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'Foreign Assisted Project',
    itemCategory: 'Training & Development',
    office: 'Procurement Department',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },

  // PPMP-2024-005
  {
    id: 'PPMP-2024-005-QA-001',
    code: 'QA-001',
    description: 'Quality Assurance Software (License for 5 users)',
    unit: 'license',
    quantity: 1,
    unitCost: 180000,
    totalAmount: 180000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Quality Assurance',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-005-QA-002',
    code: 'QA-002',
    description: 'Testing & Quality Assurance Consultancy',
    unit: 'service',
    quantity: 1,
    unitCost: 120000,
    totalAmount: 120000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Consultancy Services',
    office: 'Quality Assurance',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-005-QA-003',
    code: 'QA-003',
    description: 'Test Automation Tools (2 licenses)',
    unit: 'license',
    quantity: 2,
    unitCost: 95000,
    totalAmount: 190000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Quality Assurance',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },

  // PPMP-2024-006
  {
    id: 'PPMP-2024-006-LEGAL-001',
    code: 'LEGAL-001',
    description: 'Legal Consultation Services (Monthly)',
    unit: 'contract',
    quantity: 12,
    unitCost: 35000,
    totalAmount: 420000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Consultancy Services',
    office: 'Legal Affairs',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-006-LEGAL-002',
    code: 'LEGAL-002',
    description: 'Legal Document Storage & Management System',
    unit: 'license',
    quantity: 1,
    unitCost: 150000,
    totalAmount: 150000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Legal Affairs',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-006-LEGAL-003',
    code: 'LEGAL-003',
    description: 'Reference Books & Legal Materials',
    unit: 'set',
    quantity: 5,
    unitCost: 25000,
    totalAmount: 125000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Office Supplies',
    office: 'Legal Affairs',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },

  // PPMP-2024-007
  {
    id: 'PPMP-2024-007-HR-001',
    code: 'HR-001',
    description: 'Human Resource Management System (HRMS)',
    unit: 'license',
    quantity: 1,
    unitCost: 280000,
    totalAmount: 280000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Special Purposes',
    itemCategory: 'IT Equipment',
    office: 'Human Resources',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-007-HR-002',
    code: 'HR-002',
    description: 'Employee Wellness Program (Annual)',
    unit: 'contract',
    quantity: 1,
    unitCost: 60000,
    totalAmount: 60000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Training & Development',
    office: 'Human Resources',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-007-HR-003',
    code: 'HR-003',
    description: 'Recruitment & Staffing Services',
    unit: 'service',
    quantity: 1,
    unitCost: 125000,
    totalAmount: 125000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'Special Purposes',
    itemCategory: 'Consultancy Services',
    office: 'Human Resources',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },

  // PPMP-2024-008
  {
    id: 'PPMP-2024-008-IT-001',
    code: 'IT-SRV-001',
    description: 'Server Maintenance & Support (Annual)',
    unit: 'contract',
    quantity: 1,
    unitCost: 250000,
    totalAmount: 250000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Maintenance & Repair',
    office: 'IT Services',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-008-IT-002',
    code: 'IT-SRV-002',
    description: 'Antivirus & Security Software (50 licenses)',
    unit: 'license',
    quantity: 50,
    unitCost: 8000,
    totalAmount: 400000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-008-IT-003',
    code: 'IT-SRV-003',
    description: 'Network Infrastructure Upgrade',
    unit: 'project',
    quantity: 1,
    unitCost: 1200000,
    totalAmount: 1200000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Loan Funds',
    itemCategory: 'Construction',
    office: 'IT Services',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },

  // PPMP-2024-009
  {
    id: 'PPMP-2024-009-FIN-001',
    code: 'FIN-001',
    description: 'Accounting Software & Modules',
    unit: 'license',
    quantity: 1,
    unitCost: 320000,
    totalAmount: 320000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Special Purposes',
    itemCategory: 'IT Equipment',
    office: 'Finance Department',
    allotmentClass: 'CO',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-009-FIN-002',
    code: 'FIN-002',
    description: 'Financial Audit Services (Quarterly)',
    unit: 'service',
    quantity: 4,
    unitCost: 45000,
    totalAmount: 180000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Consultancy Services',
    office: 'Finance Department',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
  {
    id: 'PPMP-2024-009-FIN-003',
    code: 'FIN-003',
    description: 'Financial Reports & Statements Software',
    unit: 'license',
    quantity: 1,
    unitCost: 85000,
    totalAmount: 85000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Finance Department',
    allotmentClass: 'MOOE',
    ppmpVersion: 1,
  },
]

// ─── AMENDED PPMP MOCK DATA ────────────────────────────────────────────────────
// Mid-year amendments with quantity increases, new items, and removals
// These represent PPMP v1.1 amendments based on the baseline PPMPs above

export const MOCK_AMENDED_PPMPS: PPMPItem[] = [
  // ─── PPMP-2024-001-v1.1 Amendment ────────────────────────────────────────
  // Delta: IT-001 quantity increased (25→30), IT-002 new item added
  {
    id: 'PPMP-2024-001-v1.1-IT-001',
    code: 'IT-001',
    description: 'Desktop Computers (Intel Core i7, 16GB RAM, 512GB SSD)',
    unit: 'unit',
    quantity: 30, // INCREASED from 25 (+5 delta)
    unitCost: 45000,
    totalAmount: 1350000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-001-v1.1-IT-002',
    code: 'IT-002',
    description: 'Laser Printers (Color, Network-enabled)',
    unit: 'unit',
    quantity: 12, // INCREASED from 8 (+4 delta)
    unitCost: 28000,
    totalAmount: 336000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-001-v1.1-OS-001',
    code: 'OS-001',
    description: 'A4 Bond Paper (80gsm, 500 sheets per ream)',
    unit: 'ream',
    quantity: 1000,
    unitCost: 210,
    totalAmount: 210000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Office Supplies',
    office: 'Planning & Development Office',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-001-v1.1-IT-NEW-001',
    code: 'IT-003',
    description: 'UPS Systems & Power Backup (3KVA)', // NEW ITEM
    unit: 'unit',
    quantity: 5,
    unitCost: 35000,
    totalAmount: 175000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },

  // ─── PPMP-2024-002-v1.1 Amendment ────────────────────────────────────────
  // Delta: VEH-001 quantity increased, new maintenance service added
  {
    id: 'PPMP-2024-002-v1.1-VEH-001',
    code: 'VEH-001',
    description: 'Pickup Truck 4x4 (Diesel, Manual)',
    unit: 'unit',
    quantity: 5, // INCREASED from 3 (+2 delta)
    unitCost: 1250000,
    totalAmount: 6250000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Special Purposes',
    itemCategory: 'Vehicles',
    office: 'Operations Division',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-002-v1.1-VEH-002',
    code: 'VEH-002',
    description: 'Vehicle Maintenance Service (Annual contract)',
    unit: 'contract',
    quantity: 5, // INCREASED from 3 (+2 delta for new vehicles)
    unitCost: 150000,
    totalAmount: 750000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Maintenance & Repair',
    office: 'Operations Division',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-002-v1.1-VEH-NEW-001',
    code: 'VEH-003',
    description: 'Vehicle Insurance (Annual policy)', // NEW ITEM
    unit: 'policy',
    quantity: 5,
    unitCost: 125000,
    totalAmount: 625000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Maintenance & Repair',
    office: 'Operations Division',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },

  // ─── PPMP-2024-003-v1.1 Amendment ────────────────────────────────────────
  // Delta: Construction item remains same, new equipment added
  {
    id: 'PPMP-2024-003-v1.1-CON-001',
    code: 'CON-001',
    description: 'Office Building Renovation (Phase 1)',
    unit: 'project',
    quantity: 1,
    unitCost: 5000000,
    totalAmount: 5000000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Loan Funds',
    itemCategory: 'Construction',
    office: 'Procurement Department',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-003-v1.1-CONS-NEW-001',
    code: 'CONS-001',
    description: 'Safety & Compliance Equipment for Renovation', // NEW ITEM
    unit: 'set',
    quantity: 1,
    unitCost: 350000,
    totalAmount: 350000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Office Supplies',
    office: 'Procurement Department',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-003-v1.1-CONS-NEW-002',
    code: 'CONS-002',
    description: 'Project Management & Supervision (Monthly)', // NEW ITEM
    unit: 'service',
    quantity: 6,
    unitCost: 75000,
    totalAmount: 450000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'Loan Funds',
    itemCategory: 'Consultancy Services',
    office: 'Procurement Department',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },

  // ─── PPMP-2024-005-v1.1 Amendment ────────────────────────────────────────
  // Delta: QA items with expanded licenses and additional tools
  {
    id: 'PPMP-2024-005-v1.1-QA-001',
    code: 'QA-001',
    description: 'Quality Assurance Software (License for 5 users)',
    unit: 'license',
    quantity: 2, // INCREASED from 1 (+1 delta for second instance)
    unitCost: 180000,
    totalAmount: 360000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Quality Assurance',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-005-v1.1-QA-002',
    code: 'QA-002',
    description: 'Testing & Quality Assurance Consultancy',
    unit: 'service',
    quantity: 1,
    unitCost: 120000,
    totalAmount: 120000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Consultancy Services',
    office: 'Quality Assurance',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-005-v1.1-QA-003',
    code: 'QA-003',
    description: 'Test Automation Tools (2 licenses)',
    unit: 'license',
    quantity: 3, // INCREASED from 2 (+1 delta)
    unitCost: 95000,
    totalAmount: 285000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Quality Assurance',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-005-v1.1-QA-NEW-001',
    code: 'QA-004',
    description: 'Performance Testing Tools (License)', // NEW ITEM
    unit: 'license',
    quantity: 1,
    unitCost: 110000,
    totalAmount: 110000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'Quality Assurance',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },

  // ─── PPMP-2024-008-v1.1 Amendment ────────────────────────────────────────
  // Delta: IT services expanded with new security tools
  {
    id: 'PPMP-2024-008-v1.1-IT-001',
    code: 'IT-SRV-001',
    description: 'Server Maintenance & Support (Annual)',
    unit: 'contract',
    quantity: 1,
    unitCost: 280000, // INCREASED from 250000 (+30000)
    totalAmount: 280000,
    modeOfProcurement: 'Direct Contracting',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'Maintenance & Repair',
    office: 'IT Services',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-008-v1.1-IT-002',
    code: 'IT-SRV-002',
    description: 'Antivirus & Security Software (50 licenses)',
    unit: 'license',
    quantity: 75, // INCREASED from 50 (+25 delta)
    unitCost: 8000,
    totalAmount: 600000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'General Appropriations Act (GAA)',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'MOOE',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-008-v1.1-IT-003',
    code: 'IT-SRV-003',
    description: 'Network Infrastructure Upgrade',
    unit: 'project',
    quantity: 1,
    unitCost: 1200000,
    totalAmount: 1200000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Loan Funds',
    itemCategory: 'Construction',
    office: 'IT Services',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },
  {
    id: 'PPMP-2024-008-v1.1-IT-NEW-001',
    code: 'IT-SRV-004',
    description: 'Firewall & Intrusion Prevention System', // NEW ITEM
    unit: 'unit',
    quantity: 2,
    unitCost: 320000,
    totalAmount: 640000,
    modeOfProcurement: 'Competitive Bidding',
    fundSource: 'Special Purposes',
    itemCategory: 'IT Equipment',
    office: 'IT Services',
    allotmentClass: 'CO',
    ppmpVersion: 1.1,
  },
]

/**
 * Get all mock PPMPs
 */
export function getMockPPMPs(): PPMPItem[] {
  return MOCK_PPMPS
}

/**
 * Get all amended mock PPMPs
 */
export function getMockAmendedPPMPs(): PPMPItem[] {
  return MOCK_AMENDED_PPMPS
}

/**
 * Get amended mock PPMPs by PPMP ID prefix (e.g., 'PPMP-2024-001-v1.1')
 */
export function getMockAmendedPPMPsByPPMPId(ppmpId: string): PPMPItem[] {
  // Match items for the amended version (v1.1)
  const prefix = ppmpId.replace('-v1.1', '').split('-').slice(0, 3).join('-')
  return MOCK_AMENDED_PPMPS.filter((ppmp) => ppmp.id.startsWith(prefix) && ppmp.ppmpVersion === 1.1)
}

/**
 * Compare baseline vs amended PPMP to calculate delta
 */
export function calculatePPMPAmendmentDelta(baselinePPMPId: string) {
  const baseline = getMockPPMPsByPPMPId(baselinePPMPId)
  const amended = getMockAmendedPPMPsByPPMPId(baselinePPMPId)

  if (!baseline.length || !amended.length) {
    return null
  }

  const baselineMap = new Map(baseline.map((item) => [item.code, item]))
  const amendedMap = new Map(amended.map((item) => [item.code, item]))

  const delta = {
    added: amended.filter((item) => !baselineMap.has(item.code)),
    removed: baseline.filter((item) => !amendedMap.has(item.code)),
    increased: amended.filter((item) => {
      const base = baselineMap.get(item.code)
      return base && item.quantity > base.quantity
    }),
    decreased: amended.filter((item) => {
      const base = baselineMap.get(item.code)
      return base && item.quantity < base.quantity
    }),
    totalDeltaBudget: amended.reduce((sum, item) => sum + item.totalAmount, 0) -
      baseline.reduce((sum, item) => sum + item.totalAmount, 0),
  }

  return delta
}

/**
 * Get combined view of baseline + amendments (for full supplemental review)
 */
export function getMockSupplementalPPMPItems(baselinePPMPId: string): PPMPItem[] {
  return [...getMockPPMPsByPPMPId(baselinePPMPId), ...getMockAmendedPPMPsByPPMPId(baselinePPMPId)]
}

/**
 * Get mock PPMPs by status (filtered by itemCategory)
 */
export function getMockPPMPsByStatus(status: string): PPMPItem[] {
  return MOCK_PPMPS.filter((ppmp) => ppmp.itemCategory === status)
}

/**
 * Get mock PPMPs by office
 */
export function getMockPPMPsByOffice(office: string): PPMPItem[] {
  return MOCK_PPMPS.filter((ppmp) => ppmp.office === office)
}

/**
 * Get mock PPMPs by PPMP ID (group items by PPMP prefix - e.g., 'PPMP-2024-001')
 */
export function getMockPPMPsByPPMPId(ppmpId: string): PPMPItem[] {
  // Match items whose ID starts with the PPMP prefix (e.g., PPMP-2024-001-IT-001 matches PPMP-2024-001)
  const prefix = ppmpId.match(/^PPMP-\d{4}-\d{3}/) ? ppmpId : ppmpId.split('-').slice(0, 3).join('-')
  return MOCK_PPMPS.filter((ppmp) => ppmp.id.startsWith(prefix))
}

/**
 * Get mock PPMPs by code prefix (group items by PPMP)
 */
export function getMockPPMPsByCodePrefix(codePrefix: string): PPMPItem[] {
  return MOCK_PPMPS.filter((ppmp) => ppmp.code?.startsWith(codePrefix))
}

/**
 * Get mock PPMP summary (group items)
 */
export function getMockPPMPSummary(codePrefix: string): {
  codePrefix: string
  itemCount: number
  totalBudget: number
  offices: string[]
  fundSources: string[]
  categories: string[]
  allotmentClasses: ('CO' | 'MOOE')[]
} {
  const items = getMockPPMPsByCodePrefix(codePrefix)
  if (items.length === 0) {
    throw new Error(`PPMP ${codePrefix} not found`)
  }

  const offices = Array.from(new Set(items.map((item) => item.office).filter((o) => o !== undefined)))
  const fundSources = Array.from(new Set(items.map((item) => item.fundSource).filter((f) => f !== undefined)))
  const categories = Array.from(new Set(items.map((item) => item.itemCategory).filter((c) => c !== undefined)))
  const allotmentClasses = Array.from(new Set(items.map((item) => item.allotmentClass)))
  const totalBudget = items.reduce((sum, item) => sum + item.totalAmount, 0)

  return {
    codePrefix,
    itemCount: items.length,
    totalBudget,
    offices: offices as string[],
    fundSources: fundSources as string[],
    categories: categories as string[],
    allotmentClasses: allotmentClasses as ('CO' | 'MOOE')[],
  }
}

/**
 * Get unique PPMP summaries (one entry per PPMP prefix)
 * Returns format expected by SelectPPMPDialog
 */
export function getMockPPMPSummaries(): Array<{
  ppmpId: string
  ppmpNumber: string
  fiscalYear: number
  offices: string[]
  fundSources: string[]
  itemCount: number
  totalBudget: number
}> {
  // Group by PPMP prefix (e.g., PPMP-2024-001)
  const ppmpGroups = new Map<string, PPMPItem[]>()
  
  MOCK_PPMPS.forEach((item) => {
    // Extract PPMP prefix from item ID
    const match = item.id.match(/^(PPMP-\d{4}-\d{3})/)
    if (match) {
      const ppmpId = match[1]
      if (!ppmpGroups.has(ppmpId)) {
        ppmpGroups.set(ppmpId, [])
      }
      ppmpGroups.get(ppmpId)!.push(item)
    }
  })

  // Convert to summary format
  return Array.from(ppmpGroups.entries()).map(([ppmpId, items]) => {
    const offices = Array.from(new Set(items.map((item) => item.office).filter((o) => o !== undefined)))
    const fundSources = Array.from(new Set(items.map((item) => item.fundSource).filter((f) => f !== undefined)))
    const totalBudget = items.reduce((sum, item) => sum + item.totalAmount, 0)

    return {
      ppmpId,
      ppmpNumber: ppmpId,
      fiscalYear: parseInt(ppmpId.split('-')[1], 10),
      offices: offices as string[],
      fundSources: fundSources as string[],
      itemCount: items.length,
      totalBudget,
    }
  })
}
