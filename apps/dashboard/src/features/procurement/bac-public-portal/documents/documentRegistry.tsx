import type { ReactNode } from 'react'
import { MarkingOfEnvelopes } from './MarkingOfEnvelopes'
import { GenericBidDocument } from './GenericBidDocument'

export interface DocMeta {
  id: string
  title: string
  description: string
  fileName: string
  component: ReactNode
}

// Shared project info blocks
const PB_001 = {
  title: 'RE-BIDDING FOR THE PROPOSED CONSTRUCTION OF SMART ACADEMIC BUILDING PHASE 1, USTP-JASAAN CAMPUS CY 2026',
  contractNo: 'USTP-IFPB02-05-2026-43-25771',
  abc: '₱70,000,000.00',
  committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE',
}

const PB_002 = {
  title: 'RE-BIDDING FOR THE PROPOSED CONSTRUCTION OF THE 21ST CENTURY ACADEMIC BUILDING AT USTP-VILLANUEVA CAMPUS (PHASE 3) CY 2026',
  contractNo: 'USTP-IFPB02-04-2026-42-25312',
  abc: '₱95,000,000.00',
  committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE',
}

const SVP_001 = {
  title: 'PROCUREMENT OF PRINTING OF GRADUATION PROGRAM FOR THE CONDUCT OF GRADUATION RITES 2026',
  contractNo: 'CDO-SVP-2026-0120',
  abc: '₱360,000.00',
  committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE',
}

const SVP_002 = {
  title: 'PROCUREMENT OF DIPLOMA JACKETS FOR THE CONDUCT OF GRADUATION RITES 2026',
  contractNo: 'CDO-SVP-2026-0119',
  abc: '₱180,000.00',
  committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE',
}

const SVP_003 = {
  title: 'PROCUREMENT OF INTERNET SUBSCRIPTION',
  contractNo: 'SYS-SVP-2026-0092',
  abc: '₱850,000.00',
  committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE',
}

const PB_003 = {
  title: 'PROPOSED PROCUREMENT OF THE SUPPLY AND DELIVERY OF LIBRARY BOOKS FOR USTP-CDO CAMPUS CY 2026',
  contractNo: 'USTP-IFPB01-04-2026-41-24891',
  abc: '₱3,500,000.00',
  committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE',
}

/**
 * Registry of all viewable bid documents.
 * Each entry maps a docId to its rendered HTML component.
 * Add new documents here as they are created.
 */
export const documentRegistry: Record<string, DocMeta> = {
  // ── pb-001 ──────────────────────────────────────────────
  'doc-01-pb-001': {
    id: 'doc-01-pb-001',
    title: '11. Marking of Envelopes',
    description: 'Template for marking bid envelopes',
    fileName: '11-marking-of-envelopes-pb-001.pdf',
    component: <MarkingOfEnvelopes />,
  },
  'doc-02-pb-001': {
    id: 'doc-02-pb-001',
    title: '10.10 Scope of Works',
    description: 'Detailed scope of works document',
    fileName: '10.10-scope-of-works-pb-001.pdf',
    component: (
      <GenericBidDocument
        title="Scope of Works"
        documentNumber="10.10"
        project={PB_001}
        instructions="Fill out all items completely. Incomplete forms will be disqualified."
        sections={[
          {
            heading: 'I. General Description',
            blank: 4,
          },
          {
            heading: 'II. Technical Specifications',
            lines: [
              'Describe in detail the technical specifications of the proposed works:',
            ],
            blank: 6,
          },
          {
            heading: 'III. Methodology',
            blank: 4,
          },
          {
            heading: 'IV. Work Schedule',
            blank: 4,
          },
        ]}
      />
    ),
  },
  'doc-03-pb-001': {
    id: 'doc-03-pb-001',
    title: '10.9 Minimum Requirements for CSHP',
    description: 'Construction Safety and Health Program requirements',
    fileName: '10.9-cshp-requirements-pb-001.pdf',
    component: (
      <GenericBidDocument
        title="Minimum Requirements for Construction Safety and Health Program (CSHP)"
        documentNumber="10.9"
        project={PB_001}
        instructions="The bidder must demonstrate compliance with all DOLE and DPWH safety and health requirements."
        sections={[
          {
            heading: 'I. Safety Officer Information',
            lines: ['Name of Safety Officer:', 'License No.:', 'Contact Number:'],
            blank: 3,
          },
          {
            heading: 'II. Safety Equipment & PPE Plan',
            blank: 4,
          },
          {
            heading: 'III. Emergency Response Plan',
            blank: 4,
          },
          {
            heading: 'IV. Certifications / Attachments',
            lines: [
              '☐  DOLE Construction Safety & Health Program',
              '☐  Safety Officer Certificate',
              '☐  First Aid Training Certificates',
            ],
          },
        ]}
      />
    ),
  },
  'doc-04-pb-001': {
    id: 'doc-04-pb-001',
    title: '10.8 Construction Schedule and S-Curve',
    description: 'Project schedule and S-curve template',
    fileName: '10.8-construction-schedule-pb-001.pdf',
    component: (
      <GenericBidDocument
        title="Construction Schedule and S-Curve"
        documentNumber="10.8"
        project={PB_001}
        instructions="Provide a detailed Gantt chart and cumulative S-curve for the proposed construction schedule."
        sections={[
          {
            heading: 'I. Project Duration',
            lines: ['Total Contract Duration: 365 Calendar Days'],
            blank: 1,
          },
          {
            heading: 'II. Work Items & Schedule (Gantt Chart)',
            lines: ['Attach or draw the Gantt chart below:'],
            blank: 8,
          },
          {
            heading: 'III. S-Curve (Cumulative % Accomplishment)',
            lines: ['Attach or draw the S-curve below:'],
            blank: 6,
          },
        ]}
      />
    ),
  },
  'doc-05-pb-001': {
    id: 'doc-05-pb-001',
    title: '10.7 Manpower Utilization Schedule',
    description: 'Manpower deployment schedule template',
    fileName: '10.7-manpower-schedule-pb-001.pdf',
    component: (
      <GenericBidDocument
        title="Manpower Utilization Schedule"
        documentNumber="10.7"
        project={PB_001}
        instructions="List all personnel to be deployed for the project with their respective roles and deployment periods."
        sections={[
          {
            heading: 'I. Key Personnel',
            lines: [
              'Position | Name | License No. | Deployment Period',
              '─────────────────────────────────────────────',
              'Project Manager:',
              'Civil Engineer:',
              'Electrical Engineer:',
              'Mechanical Engineer:',
              'Safety Officer:',
              'Foreman:',
            ],
          },
          {
            heading: 'II. Labor Force Schedule',
            blank: 6,
          },
        ]}
      />
    ),
  },

  // ── pb-002 ──────────────────────────────────────────────
  'doc-01-pb-002': {
    id: 'doc-01-pb-002',
    title: 'Bid Form',
    description: 'Official bid form template',
    fileName: 'bid-form-pb-002.pdf',
    component: (
      <GenericBidDocument
        title="Bid Form"
        project={PB_002}
        instructions="Complete this form in its entirety. All entries must be typewritten or printed in ink."
        sections={[
          {
            heading: 'I. Offered Total Bid Price',
            blank: 2,
          },
          {
            heading: 'II. Bid Validity',
            lines: ['This bid shall be valid for _______ calendar days from the date of bid opening.'],
          },
          {
            heading: 'III. Undertaking',
            lines: [
              'We undertake, if our Bid is accepted, to commence and complete delivery of all items in the contract within the stipulated delivery period.',
            ],
          },
        ]}
      />
    ),
  },
  'doc-02-pb-002': {
    id: 'doc-02-pb-002',
    title: 'Bill of Quantities',
    description: 'Itemized bill of quantities',
    fileName: 'boq-pb-002.pdf',
    component: (
      <GenericBidDocument
        title="Bill of Quantities"
        project={PB_002}
        instructions="Fill in the unit prices for each line item. The total amount will be used as the basis for bid evaluation."
        sections={[
          {
            heading: 'I. Structural Works',
            blank: 4,
          },
          {
            heading: 'II. Architectural Works',
            blank: 4,
          },
          {
            heading: 'III. Electrical Works',
            blank: 3,
          },
          {
            heading: 'IV. Mechanical Works',
            blank: 3,
          },
          {
            heading: 'V. Total Bid Amount',
            blank: 1,
          },
        ]}
      />
    ),
  },

  // ── svp-001 ──────────────────────────────────────────────
  'doc-01-svp-001': {
    id: 'doc-01-svp-001',
    title: 'Price Quotation Form',
    description: 'Accomplished price quotation form',
    fileName: 'price-quotation-svp-001.pdf',
    component: (
      <GenericBidDocument
        title="Price Quotation Form"
        project={SVP_001}
        instructions="Indicate your best offer for each item. Quotation is valid for 30 calendar days."
        sections={[
          {
            heading: 'I. Item Description & Pricing',
            lines: [
              'Item | Description | Qty | Unit | Unit Price | Total Amount',
              '──────────────────────────────────────────────────────',
              '1. Graduation Program (Printing)',
            ],
            blank: 4,
          },
          {
            heading: 'II. Delivery Terms',
            blank: 2,
          },
          {
            heading: 'III. Total Quoted Amount (VAT Inclusive)',
            blank: 1,
          },
        ]}
      />
    ),
  },

  // ── svp-002 ──────────────────────────────────────────────
  'doc-01-svp-002': {
    id: 'doc-01-svp-002',
    title: 'Price Quotation Form',
    description: 'Accomplished price quotation form',
    fileName: 'price-quotation-svp-002.pdf',
    component: (
      <GenericBidDocument
        title="Price Quotation Form"
        project={SVP_002}
        instructions="Indicate your best offer for each item. Quotation is valid for 30 calendar days."
        sections={[
          {
            heading: 'I. Item Description & Pricing',
            lines: [
              'Item | Description | Qty | Unit | Unit Price | Total Amount',
              '──────────────────────────────────────────────────────',
              '1. Diploma Jackets',
            ],
            blank: 4,
          },
          {
            heading: 'II. Delivery Terms',
            blank: 2,
          },
          {
            heading: 'III. Total Quoted Amount (VAT Inclusive)',
            blank: 1,
          },
        ]}
      />
    ),
  },

  // ── svp-003 ──────────────────────────────────────────────
  'doc-01-svp-003': {
    id: 'doc-01-svp-003',
    title: 'Service Quotation Form',
    description: 'Quotation form for internet services',
    fileName: 'service-quotation-svp-003.pdf',
    component: (
      <GenericBidDocument
        title="Service Quotation Form"
        project={SVP_003}
        instructions="Provide your best offer for 12 months of internet subscription service."
        sections={[
          {
            heading: 'I. Service Specifications Offered',
            lines: [
              'Bandwidth / Speed:',
              'Type of Connection:',
              'Service Level Agreement (SLA):',
            ],
            blank: 3,
          },
          {
            heading: 'II. Monthly Rate',
            blank: 1,
          },
          {
            heading: 'III. Annual Total (VAT Inclusive)',
            blank: 1,
          },
          {
            heading: 'IV. Warranty & Support Terms',
            blank: 2,
          },
        ]}
      />
    ),
  },

  // ── pb-003 ──────────────────────────────────────────────
  'doc-01-pb-003': {
    id: 'doc-01-pb-003',
    title: 'Bid Form',
    description: 'Official bid submission form',
    fileName: 'bid-form-pb-003.pdf',
    component: (
      <GenericBidDocument
        title="Bid Form"
        project={PB_003}
        instructions="Complete this form in its entirety. All entries must be typewritten or printed in ink."
        sections={[
          {
            heading: 'I. Offered Total Bid Price',
            blank: 2,
          },
          {
            heading: 'II. Bid Validity',
            lines: ['This bid shall be valid for _______ calendar days from the date of bid opening.'],
          },
          {
            heading: 'III. Undertaking',
            lines: [
              'We undertake to deliver all library books within the stipulated delivery period.',
            ],
          },
        ]}
      />
    ),
  },
  'doc-02-pb-003': {
    id: 'doc-02-pb-003',
    title: 'List of Book Titles',
    description: 'List of offered book titles with ISBN and price',
    fileName: 'book-list-pb-003.pdf',
    component: (
      <GenericBidDocument
        title="List of Offered Book Titles"
        project={PB_003}
        instructions="List all book titles being offered. Include ISBN, author, edition, publisher, and unit price."
        sections={[
          {
            heading: 'I. Book List',
            lines: [
              'No. | Title | Author | Edition | ISBN | Publisher | Unit Price | Qty | Total',
              '─────────────────────────────────────────────────────────────────',
            ],
            blank: 10,
          },
          {
            heading: 'II. Grand Total Amount',
            blank: 1,
          },
        ]}
      />
    ),
  },
}
