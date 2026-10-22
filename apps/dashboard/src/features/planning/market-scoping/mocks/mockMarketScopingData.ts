/**
 * Market Scoping Mock Data
 * Centralized mock data for development and testing
 * To use real API: Disable mock flag in pages/handlers or use environment-based switching
 *
 * Location: src/features/planning/market-scoping/mocks/
 * Reference: documentations/market-scoping-feature.md
 */

import type { MarketScopingForm } from '../types/marketScopingTypes'

/**
 * Mock User Profile
 * Represents authenticated user information (will come from auth context in production)
 */
export const MOCK_USER_PROFILE = {
  name: 'John Doe',
  designation: 'IT Manager',
  departmentUnit: 'IT Division',
  agencyName: 'Department of Education',
} as const

/**
 * Mock LIB Activities
 * Represents Available Ladder In Budget (LIB) activities for linking
 * Source: Will come from API in production
 */
export const MOCK_LIB_ACTIVITIES = [
  {
    id: '1',
    name: 'Server Infrastructure Upgrade',
    budget: 1500000,
  },
  {
    id: '2',
    name: 'Workstation Replacement',
    budget: 800000,
  },
  {
    id: '3',
    name: 'Network Equipment',
    budget: 600000,
  },
] as const

/**
 * Mock Market Scoping Forms Collection
 * Represents various market scoping forms in different statuses
 */
export const MOCK_MARKET_SCOPING_FORMS: MarketScopingForm[] = [
  {
    id: 'ms-001',
    projectName: 'Office Equipment Procurement',
    estimatedBudget: 500000,
    status: 'Approved',
    createdDate: new Date('2024-05-15'),
    updatedDate: new Date('2024-05-20'),
    submittedDate: new Date('2024-05-18'),
    approvedDate: new Date('2024-05-20'),
    createdBy: 'john.doe@deped.gov.ph',
    periodFrom: '05/2024',
    periodTo: '06/2024',
    expectedDeliveryDate: '08/2024',
    linkedLibActivityId: '1',
    agencyName: 'Department of Education',
    departmentUnit: 'IT Division',
    representativeName: 'John Doe',
    representativeDesignation: 'IT Manager',
    activities: [
      {
        id: 'act-001',
        activityType: 'PriceSourcing',
        checked: true,
        attachments: [
          {
            id: 'file-001',
            fileName: 'Supplier_Quotations_2024.pdf',
            fileUrl: '/documents/supplier-quotations.pdf',
            fileSize: 2048000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-16'),
          },
          {
            id: 'file-002',
            fileName: 'Market_Analysis.xlsx',
            fileUrl: '/documents/market-analysis.xlsx',
            fileSize: 512000,
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            uploadedDate: new Date('2024-05-16'),
          },
        ],
      },
      {
        id: 'act-002',
        activityType: 'SupplierConsultations',
        checked: true,
        attachments: [
          {
            id: 'file-003',
            fileName: 'Consultation_Meeting_Minutes.docx',
            fileUrl: '/documents/consultation-minutes.docx',
            fileSize: 256000,
            fileType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        id: 'act-003',
        activityType: 'PhilGEPSReview',
        checked: true,
        attachments: [
          {
            id: 'file-007',
            fileName: 'PhilGEPS_Screenshots.png',
            fileUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            fileSize: 1024000,
            fileType: 'image/png',
            uploadedDate: new Date('2024-05-16'),
          },
        ],
      },
      {
        id: 'act-004',
        activityType: 'TechnicalFinancialReview',
        checked: true,
        attachments: [
          {
            id: 'file-008',
            fileName: 'Technical_Report_2024.pdf',
            fileUrl: '/documents/technical-report.pdf',
            fileSize: 2560000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-16'),
          },
          {
            id: 'file-009',
            fileName: 'Market_Comparison.png',
            fileUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            fileSize: 1536000,
            fileType: 'image/png',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        id: 'act-005',
        activityType: 'BrochuresPublications',
        checked: true,
        attachments: [
          {
            id: 'file-010',
            fileName: 'Product_Brochure_2024.jpg',
            fileUrl:
              'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
            fileSize: 768000,
            fileType: 'image/jpeg',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        id: 'act-006',
        activityType: 'SummitParticipation',
        checked: true,
        attachments: [
          {
            id: 'file-011',
            fileName: 'Conference_Certificate.jpg',
            fileUrl:
              'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
            fileSize: 512000,
            fileType: 'image/jpeg',
            uploadedDate: new Date('2024-05-17'),
          },
          {
            id: 'file-012',
            fileName: 'Conference_Notes.docx',
            fileUrl: '/documents/conference-notes.docx',
            fileSize: 256000,
            fileType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        id: 'act-007',
        activityType: 'OtherActivities',
        description: '',
        checked: false,
        attachments: [],
      },
    ],
    parameters: [
      {
        parameterId: 'param-001',
        parameterName: 'ProjectCostEstimate',
        displayName: 'Project Cost Estimate',
        guidedQuestion:
          'Have you conducted thorough market research to establish a realistic project cost estimate?',
        considered: 'Yes',
        recommendations:
          'Based on comprehensive market research and supplier quotations, the estimated cost is ₱500,000. This accounts for current market rates and includes contingency.',
        attachments: [
          {
            id: 'file-004',
            fileName: 'Cost_Estimate_Details.pdf',
            fileUrl: '/documents/cost-estimate.pdf',
            fileSize: 1024000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        parameterId: 'param-002',
        parameterName: 'ProjectDesignSpecification',
        displayName: 'Project Design and Specification',
        guidedQuestion:
          'Have you clearly defined and documented the technical specifications and design requirements?',
        considered: 'Yes',
        recommendations:
          'Technical specifications have been clearly documented. Requirements include: 50 desktop workstations with minimum i7 processors, 16GB RAM, and enterprise-grade monitors.',
        attachments: [
          {
            id: 'file-005',
            fileName: 'Technical_Specifications.pdf',
            fileUrl: '/documents/tech-specs.pdf',
            fileSize: 1536000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        parameterId: 'param-003',
        parameterName: 'TechnicalCriteria',
        displayName: 'Technical Criteria',
        guidedQuestion:
          'Have you established and validated technical criteria for supplier/contractor evaluation?',
        considered: 'Yes',
        recommendations:
          'Technical evaluation criteria established and weighted: Product Quality (40%), After-Sales Support (30%), Delivery Timeline (20%), Price (10%)',
        attachments: [
          {
            id: 'file-013',
            fileName: 'Evaluation_Matrix.xlsx',
            fileUrl: '/documents/evaluation-matrix.xlsx',
            fileSize: 384000,
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        parameterId: 'param-004',
        parameterName: 'DeliveryLeadTime',
        displayName: 'Delivery Lead Time',
        guidedQuestion:
          'Have you confirmed realistic delivery timelines based on market conditions?',
        considered: 'Yes',
        recommendations:
          'Confirmed delivery timeline: 4-6 weeks from order placement to full delivery. Installation and configuration to be completed within 2 weeks.',
        attachments: [
          {
            id: 'file-014',
            fileName: 'Timeline_Chart.jpg',
            fileUrl:
              'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
            fileSize: 640000,
            fileType: 'image/jpeg',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        parameterId: 'param-005',
        parameterName: 'StorageWarehousingRequirements',
        displayName: 'Storage and Warehousing Requirements',
        guidedQuestion:
          'Have you assessed and documented storage/warehousing needs for the project?',
        considered: 'Yes',
        recommendations:
          'Storage requirement: 200 sq meters for temporary storage during installation phase. IT office has sufficient space available.',
        attachments: [
          {
            id: 'file-015',
            fileName: 'Warehouse_Plan.png',
            fileUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            fileSize: 768000,
            fileType: 'image/png',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
      {
        parameterId: 'param-006',
        parameterName: 'IdentifiedRisks',
        displayName: 'Identified Risk/s',
        guidedQuestion:
          'Have you identified and documented potential risks and mitigation strategies?',
        considered: 'Yes',
        recommendations:
          'Key risks identified: Supply chain delays (mitigation: advance ordering), compatibility issues (mitigation: thorough testing), budget overruns (mitigation: 10% contingency included)',
        attachments: [
          {
            id: 'file-006',
            fileName: 'Risk_Assessment.pdf',
            fileUrl: '/documents/risk-assessment.pdf',
            fileSize: 768000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-17'),
          },
        ],
      },
    ],
    approvalRouting: [
      {
        step: 1,
        actor: 'john.doe@deped.gov.ph',
        actorName: 'John Doe',
        role: 'End-User/Initiator',
        status: 'Approved',
        action: 'Form submitted for approval',
        actionDate: new Date('2024-05-18'),
      },
      {
        step: 2,
        actor: 'head@deped.gov.ph',
        actorName: 'Department Head',
        role: 'Department Head',
        status: 'Approved',
        action: 'Approved with no comments',
        actionDate: new Date('2024-05-20'),
      },
    ],
    pdfGeneratedDate: new Date('2024-05-21'),
    pdfUrl: '/documents/market-scoping-ms-001.pdf',
  },
  {
    id: 'ms-002',
    projectName: 'Construction Materials and Equipment',
    estimatedBudget: 2500000,
    status: 'PendingApproval',
    createdDate: new Date('2024-05-20'),
    updatedDate: new Date('2024-05-22'),
    submittedDate: new Date('2024-05-22'),
    createdBy: 'jane.smith@dpwh.gov.ph',
    periodFrom: '04/2024',
    periodTo: '05/2024',
    expectedDeliveryDate: '07/2024',
    linkedLibActivityId: '2',
    agencyName: 'Department of Public Works',
    departmentUnit: 'Infrastructure Division',
    representativeName: 'Jane Smith',
    representativeDesignation: 'Project Manager',
    activities: [
      {
        id: 'act-101',
        activityType: 'SupplierConsultations',
        checked: true,
        attachments: [
          {
            id: 'file-101',
            fileName: 'Stakeholder_Consultations.pdf',
            fileUrl: '/documents/stakeholder-consultations.pdf',
            fileSize: 1280000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-21'),
          },
        ],
      },
      {
        id: 'act-102',
        activityType: 'PhilGEPSReview',
        checked: true,
        attachments: [
          {
            id: 'file-102',
            fileName: 'PhilGEPS_Report.xlsx',
            fileUrl: '/documents/philgeps-report.xlsx',
            fileSize: 768000,
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            uploadedDate: new Date('2024-05-21'),
          },
        ],
      },
      {
        id: 'act-103',
        activityType: 'PriceSourcing',
        checked: true,
        attachments: [
          {
            id: 'file-103',
            fileName: 'Construction_Quotes.pdf',
            fileUrl: '/documents/construction-quotes.pdf',
            fileSize: 1920000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-21'),
          },
          {
            id: 'file-104',
            fileName: 'Price_Comparison.png',
            fileUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            fileSize: 1024000,
            fileType: 'image/png',
            uploadedDate: new Date('2024-05-21'),
          },
        ],
      },
      {
        id: 'act-104',
        activityType: 'TechnicalFinancialReview',
        checked: true,
        attachments: [
          {
            id: 'file-105',
            fileName: 'Material_Specs.jpg',
            fileUrl:
              'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
            fileSize: 1280000,
            fileType: 'image/jpeg',
            uploadedDate: new Date('2024-05-21'),
          },
        ],
      },
      {
        id: 'act-105',
        activityType: 'BrochuresPublications',
        checked: true,
        attachments: [
          {
            id: 'file-106a',
            fileName: 'Material_Brochure.pdf',
            fileUrl: '/documents/material-brochure.pdf',
            fileSize: 2048000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-21'),
          },
        ],
      },
      {
        id: 'act-106',
        activityType: 'SummitParticipation',
        checked: true,
        attachments: [
          {
            id: 'file-106',
            fileName: 'Conference_Participation.pdf',
            fileUrl: '/documents/conference-participation.pdf',
            fileSize: 512000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-21'),
          },
        ],
      },
      {
        id: 'act-107',
        activityType: 'OtherActivities',
        description: '',
        checked: false,
        attachments: [],
      },
    ],
    parameters: [
      {
        parameterId: 'param-201',
        parameterName: 'ProjectCostEstimate',
        displayName: 'Project Cost Estimate',
        guidedQuestion:
          'Have you conducted thorough market research to establish a realistic project cost estimate?',
        considered: 'Yes',
        recommendations:
          'Budget of ₱2,500,000 established based on market rates and similar past projects. Includes 15% contingency for cost escalations.',
        attachments: [
          {
            id: 'file-200',
            fileName: 'Cost_Analysis_Chart.jpg',
            fileUrl:
              'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
            fileSize: 896000,
            fileType: 'image/jpeg',
            uploadedDate: new Date('2024-05-22'),
          },
        ],
      },
      {
        parameterId: 'param-202',
        parameterName: 'ProjectDesignSpecification',
        displayName: 'Project Design and Specification',
        guidedQuestion:
          'Have you clearly defined and documented the technical specifications and design requirements?',
        considered: 'Yes',
        recommendations:
          'Complete engineering designs prepared and reviewed by DPWH technical team. All specifications comply with national standards.',
        attachments: [
          {
            id: 'file-202',
            fileName: 'Engineering_Designs.pdf',
            fileUrl: '/documents/engineering-designs.pdf',
            fileSize: 3072000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-22'),
          },
        ],
      },
      {
        parameterId: 'param-203',
        parameterName: 'TechnicalCriteria',
        displayName: 'Technical Criteria',
        guidedQuestion:
          'Have you established and validated technical criteria for supplier/contractor evaluation?',
        considered: 'Yes',
        recommendations:
          'Bid criteria established: Technical Compliance (50%), Experience (30%), Price (15%), Warranty/Support (5%)',
        attachments: [
          {
            id: 'file-201',
            fileName: 'Bid_Requirements.pdf',
            fileUrl: '/documents/bid-requirements.pdf',
            fileSize: 1536000,
            fileType: 'application/pdf',
            uploadedDate: new Date('2024-05-22'),
          },
        ],
      },
      {
        parameterId: 'param-204',
        parameterName: 'DeliveryLeadTime',
        displayName: 'Delivery Lead Time',
        guidedQuestion:
          'Have you confirmed realistic delivery timelines based on market conditions?',
        considered: 'Yes',
        recommendations:
          'Expected timeline: 12 weeks for material procurement and delivery, phased installation over 16 weeks',
        attachments: [
          {
            id: 'file-202a',
            fileName: 'Delivery_Schedule.png',
            fileUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            fileSize: 728000,
            fileType: 'image/png',
            uploadedDate: new Date('2024-05-22'),
          },
        ],
      },
      {
        parameterId: 'param-205',
        parameterName: 'StorageWarehousingRequirements',
        displayName: 'Storage and Warehousing Requirements',
        guidedQuestion:
          'Have you assessed and documented storage/warehousing needs for the project?',
        considered: 'NotApplicable',
        recommendations:
          'Materials delivered as needed for installation phase; no long-term storage required',
        attachments: [],
      },
      {
        parameterId: 'param-206',
        parameterName: 'IdentifiedRisks',
        displayName: 'Identified Risk/s',
        guidedQuestion:
          'Have you identified and documented potential risks and mitigation strategies?',
        considered: 'Yes',
        recommendations:
          'Major risks: Weather delays (mitigation: flexible scheduling), supply chain issues (mitigation: multiple suppliers), labor availability (mitigation: advance recruitment)',
        attachments: [],
      },
    ],
    approvalRouting: [
      {
        step: 1,
        actor: 'jane.smith@dpwh.gov.ph',
        actorName: 'Jane Smith',
        role: 'End-User/Initiator',
        status: 'Approved',
        action: 'Form submitted for approval',
        actionDate: new Date('2024-05-22'),
      },
      {
        step: 2,
        actor: 'division-head@dpwh.gov.ph',
        actorName: 'Division Head',
        role: 'Division Head',
        status: 'Pending',
      },
    ],
  },
  {
    id: 'ms-003',
    projectName: 'Software License Renewal',
    estimatedBudget: 350000,
    status: 'Draft',
    createdDate: new Date('2024-05-23'),
    updatedDate: new Date('2024-05-23'),
    createdBy: 'admin@deped.gov.ph',
    periodFrom: '06/2024',
    periodTo: '06/2024',
    expectedDeliveryDate: '07/2024',
    agencyName: 'Department of Education',
    departmentUnit: 'IT Division',
    representativeName: 'Admin User',
    representativeDesignation: 'IT Administrator',
    activities: [
      {
        id: 'act-201',
        activityType: 'SupplierConsultations',
        checked: false,
        attachments: [],
      },
      {
        id: 'act-202',
        activityType: 'PhilGEPSReview',
        checked: false,
        attachments: [],
      },
      {
        id: 'act-203',
        activityType: 'PriceSourcing',
        checked: false,
        attachments: [],
      },
      {
        id: 'act-204',
        activityType: 'TechnicalFinancialReview',
        checked: false,
        attachments: [],
      },
      {
        id: 'act-205',
        activityType: 'BrochuresPublications',
        checked: false,
        attachments: [],
      },
      {
        id: 'act-206',
        activityType: 'SummitParticipation',
        checked: false,
        attachments: [],
      },
      {
        id: 'act-207',
        activityType: 'OtherActivities',
        description: '',
        checked: false,
        attachments: [],
      },
    ],
    parameters: [
      {
        parameterId: 'param-301',
        parameterName: 'ProjectCostEstimate',
        displayName: 'Project Cost Estimate',
        guidedQuestion:
          'Have you conducted thorough market research to establish a realistic project cost estimate?',
        considered: 'No',
        recommendations: '',
        attachments: [],
      },
      {
        parameterId: 'param-302',
        parameterName: 'ProjectDesignSpecification',
        displayName: 'Project Design and Specification',
        guidedQuestion:
          'Have you clearly defined and documented the technical specifications and design requirements?',
        considered: 'No',
        recommendations: '',
        attachments: [],
      },
      {
        parameterId: 'param-303',
        parameterName: 'TechnicalCriteria',
        displayName: 'Technical Criteria',
        guidedQuestion:
          'Have you established and validated technical criteria for supplier/contractor evaluation?',
        considered: 'No',
        recommendations: '',
        attachments: [],
      },
      {
        parameterId: 'param-304',
        parameterName: 'DeliveryLeadTime',
        displayName: 'Delivery Lead Time',
        guidedQuestion:
          'Have you confirmed realistic delivery timelines based on market conditions?',
        considered: 'No',
        recommendations: '',
        attachments: [],
      },
      {
        parameterId: 'param-305',
        parameterName: 'StorageWarehousingRequirements',
        displayName: 'Storage and Warehousing Requirements',
        guidedQuestion:
          'Have you assessed and documented storage/warehousing needs for the project?',
        considered: 'No',
        recommendations: '',
        attachments: [],
      },
      {
        parameterId: 'param-306',
        parameterName: 'IdentifiedRisks',
        displayName: 'Identified Risk/s',
        guidedQuestion:
          'Have you identified and documented potential risks and mitigation strategies?',
        considered: 'No',
        recommendations: '',
        attachments: [],
      },
    ],
    approvalRouting: [],
  },
]

/**
 * Mock single form (for details page)
 * Returns the first approved form from collection
 */
export const MOCK_MARKET_SCOPING_SINGLE = MOCK_MARKET_SCOPING_FORMS[0]

/**
 * Mock list response for market scoping
 * Simulates paginated API response
 */
export const MOCK_MARKET_SCOPING_LIST_RESPONSE = {
  success: true,
  data: MOCK_MARKET_SCOPING_FORMS,
  pagination: {
    total: MOCK_MARKET_SCOPING_FORMS.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
}

/**
 * Get mock market scoping forms by status
 */
export function getMockMarketScopingByStatus(
  status: string,
): MarketScopingForm[] {
  return MOCK_MARKET_SCOPING_FORMS.filter((form) => form.status === status)
}

/**
 * Get mock market scoping form by ID
 */
export function getMockMarketScopingById(
  id: string,
): MarketScopingForm | undefined {
  return MOCK_MARKET_SCOPING_FORMS.find((form) => form.id === id)
}

/**
 * Get status summary for overview dashboard
 */
export function getMockStatusSummary() {
  return {
    draft: MOCK_MARKET_SCOPING_FORMS.filter((f) => f.status === 'Draft').length,
    pending: MOCK_MARKET_SCOPING_FORMS.filter(
      (f) => f.status === 'PendingApproval',
    ).length,
    approved: MOCK_MARKET_SCOPING_FORMS.filter((f) => f.status === 'Approved')
      .length,
  }
}
