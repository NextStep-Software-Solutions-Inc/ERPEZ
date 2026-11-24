import { create } from 'zustand'

export type ProofFile = {
  id: string
  name: string
  url?: string
  fileId?: string
  fileType?: 'image' | 'pdf' | 'document'
  documentType?: string
  uploadedAt?: string
  size?: number
}

export type DirectAcquisition = {
  id: string
  daNumber: string
  /** Linked approved Consolidated PR number */
  consolidatedPrId?: string
  prNumber: string
  bacResolutionId?: string
  bacResolutionNumber?: string
  office: string
  category: string
  modeOfProcurement: string
  totalABC: number
  status:
    | 'draft'
    | 'purchase_entry'
    | 'approved'
    | 'for_disbursement'
    | 'returned'
  supplier?: string
  finalAmount?: number
  transactionDate?: string
  remarks?: string
  proofFiles?: ProofFile[]
  /** 'direct_vendor' pays the vendor directly; 'employee_reimbursement' generates a DV for the employee who fronted the purchase */
  paymentMethod?: 'direct_vendor' | 'employee_reimbursement'
  /** Employee name/id assigned as payee when paymentMethod is 'employee_reimbursement' */
  payeeName?: string
  /** TIN of the vendor/retail source — linked to vendor_id for audit trail */
  supplierTin?: string
  createdBy?: string
  createdAt: string
  selectedItemIds?: string[]
  /** Optional deadline for completing the DA (ISO date string) */
  deadline?: string
}

interface DirectAcquisitionStore {
  entries: DirectAcquisition[]
  addEntry: (e: DirectAcquisition) => void
  updateEntry: (id: string, patch: Partial<DirectAcquisition>) => void
  removeEntry: (id: string) => void
}

function genId(prefix = 'da') {
  return `${prefix}-${crypto.randomUUID()}`
}

export const useDirectAcquisitionStore = create<DirectAcquisitionStore>(
  (set) => {
    const isDevSeedEnabled = (() => {
      try {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env.NODE_ENV === 'development'
        )
          return true
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env.REACT_APP_ENABLE_DEV_SEED === 'true'
        )
          return true
        // Vite exposes import.meta.env.DEV / MODE
        const meta: any =
          typeof import.meta !== 'undefined' ? import.meta : undefined
        if (meta?.env?.DEV || meta?.env?.MODE === 'development') return true
      } catch {
        // ignore and fall through
      }
      return false
    })()

    const SAMPLE_ENTRIES: DirectAcquisition[] = [
      {
        id: genId('da'),
        daNumber: 'DA-2026-0001',
        consolidatedPrId: 'CPR-2026-M03',
        prNumber: 'CPR-2026-M03',
        bacResolutionId: 'bac-resolution-002',
        bacResolutionNumber: 'BAC-RES-2026-002',
        office: 'Office A',
        category: 'Office Supplies',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 18900,
        status: 'draft',
        supplier: 'OfficeWorld PH',
        finalAmount: 18500,
        transactionDate: '2026-05-01',
        proofFiles: [
          {
            id: 'pf-da-0001-1',
            name: 'receipt-DA-2026-0001.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0002',
        consolidatedPrId: 'CPR-2026-M02',
        prNumber: 'CPR-2026-M02',
        bacResolutionId: 'bac-resolution-001',
        bacResolutionNumber: 'BAC-RES-2026-001',
        office: 'Office B',
        category: 'Office Furniture',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 145000,
        status: 'for_disbursement',
        supplier: 'CleanPro Supplies',
        finalAmount: 143000,
        transactionDate: '2026-04-28',
        remarks: 'Purchased ergonomic furniture for Q2',
        proofFiles: [
          {
            id: 'pf-da-0002-1',
            name: 'receipt-DA-2026-0002.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        deadline: '2026-05-15',
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0003',
        consolidatedPrId: 'CPR-2026-M04',
        prNumber: 'CPR-2026-M04',
        bacResolutionId: 'bac-resolution-003',
        bacResolutionNumber: 'BAC-RES-2026-003',
        office: 'Office C',
        category: 'IT Equipment',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 46350,
        status: 'purchase_entry',
        supplier: 'TechSource Inc.',
        finalAmount: 45000,
        transactionDate: '2026-04-20',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        deadline: '2026-05-10',
        proofFiles: [
          {
            id: 'pf-da-0003-1',
            name: 'receipt-DA-2026-0003.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0004',
        consolidatedPrId: 'CPR-2026-M05',
        prNumber: 'CPR-2026-M05',
        office: 'Health Office',
        category: 'IT Equipment',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 49000,
        status: 'for_disbursement',
        supplier: 'QuickFix Repairs',
        finalAmount: 48000,
        transactionDate: '2026-04-15',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        deadline: '2026-05-05',
        proofFiles: [
          {
            id: 'pf-da-0004-1',
            name: 'receipt-DA-2026-0004.pdf',
            fileType: 'pdf',
            // Minimal sample PDF (data URL) so the file is clickable in the UI
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0005',
        consolidatedPrId: 'CPR-2026-M01',
        prNumber: 'CPR-2026-M01',
        office: 'Office A',
        category: 'IT Peripherals',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 188000,
        status: 'draft',
        supplier: 'TechGadgets PH',
        finalAmount: 185000,
        transactionDate: '2026-05-03',
        proofFiles: [
          {
            id: 'pf-da-0005-1',
            name: 'receipt-DA-2026-0005.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0006',
        consolidatedPrId: 'CPR-2026-M06',
        prNumber: 'CPR-2026-M06',
        office: 'Engineering Office',
        category: 'Construction Materials',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 72000,
        status: 'purchase_entry',
        supplier: 'BuildRight Corp.',
        finalAmount: 70500,
        transactionDate: '2026-04-30',
        remarks: 'Cement and steel bars for repair project',
        proofFiles: [
          {
            id: 'pf-da-0006-1',
            name: 'receipt-DA-2026-0006.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: '',
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0007',
        consolidatedPrId: 'CPR-2026-M07',
        prNumber: 'CPR-2026-M07',
        office: 'Finance Office',
        category: 'Office Supplies',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 15000,
        status: 'returned',
        supplier: 'SupplyHub PH',
        finalAmount: 14800,
        transactionDate: '2026-04-22',
        remarks:
          'Incomplete supporting documents. Please resubmit with updated OR.',
        proofFiles: [
          {
            id: 'pf-da-0007-1',
            name: 'receipt-DA-2026-0007.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        deadline: '2026-05-08',
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0008',
        consolidatedPrId: 'CPR-2026-M11',
        prNumber: 'CPR-2026-M11',
        office: 'HR Department',
        category: 'Training Materials',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 32500,
        status: 'purchase_entry',
        supplier: 'EduPrint Solutions',
        finalAmount: 31000,
        transactionDate: '2026-05-02',
        proofFiles: [
          {
            id: 'pf-da-0008-1',
            name: 'receipt-DA-2026-0008.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: '',
      },
      {
        id: genId('da'),
        daNumber: 'DA-2026-0009',
        consolidatedPrId: 'CPR-2026-M09',
        prNumber: 'CPR-2026-M09',
        office: 'ICT Division',
        category: 'Software Licenses',
        modeOfProcurement: 'Direct Acquisition',
        totalABC: 95000,
        status: 'returned',
        supplier: 'SoftwareGlobal PH',
        finalAmount: 93000,
        transactionDate: '2026-04-18',
        remarks: 'Budget allocation mismatch. Return for correction.',
        proofFiles: [
          {
            id: 'pf-da-0009-1',
            name: 'receipt-DA-2026-0009.pdf',
            fileType: 'pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDcwPj4Kc3RyZWFtCkJUIDAgMCBTRkYoSGVsbG8gV29ybGQpClN0cmVhbWVuZCBlbmQKZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzQgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZT4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MCAwMDAwMCBuIAowMDAwMDAwMTQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMyAwIFIvSW5mbyA3IDAgUi9JRCBbPDM0MzZlZDgxY2Y5MzRhZjY4NzQ4ZTQwZGNmZGYwM2VmPl0+PgpzdGFydHhyZWYKMzA0CiUlRU9G',
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: '',
      },
    ]

    const initialEntries = isDevSeedEnabled ? SAMPLE_ENTRIES : []

    return {
      entries: initialEntries,
      addEntry: (e) => set((s) => ({ entries: [e, ...s.entries] })),
      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((it) =>
            it.id === id ? { ...it, ...patch } : it,
          ),
        })),
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((it) => it.id !== id) })),
    }
  },
)
