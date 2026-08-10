interface KpiAttribute {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string;
}

export const mockKpiAttributes: Array<KpiAttribute> = [
  {
    id: '1',
    name: 'PREXC',
    code: 'PREXC',
    description:
      'Presidential Executive Classification - Core mandate of the office',
  },
  {
    id: '2',
    name: 'Strategic Development Area',
    code: 'SDA',
    description: 'Strategic areas aligned with national development priorities',
  },
  {
    id: '3',
    name: 'SDA - Economic Development',
    parentId: '2',
    code: 'SDA-ED',
    description: 'Economic development initiatives and programs',
  },
  {
    id: '4',
    name: 'SDA - Social Development',
    parentId: '2',
    code: 'SDA-SD',
    description: 'Social development and human capital programs',
  },
  {
    id: '5',
    name: 'SDA - Environmental Protection',
    parentId: '2',
    code: 'SDA-EP',
    description: 'Environmental protection and sustainability initiatives',
  },
  {
    id: '6',
    name: 'State Universities Leveling',
    code: 'SUC',
    description: 'Performance indicators for SUC leveling and benchmarking',
  },
  {
    id: '7',
    name: 'SUC - Quality Education',
    parentId: '6',
    code: 'SUC-QE',
    description: 'Quality education standards and outcomes',
  },
  {
    id: '8',
    name: 'SUC - Research Excellence',
    parentId: '6',
    code: 'SUC-RE',
    description: 'Research productivity and innovation indicators',
  },
  {
    id: '9',
    name: 'SUC - Extension Services',
    parentId: '6',
    code: 'SUC-ES',
    description: 'Community engagement and extension programs',
  },
  {
    id: '10',
    name: 'International Commitments',
    code: 'IC',
    description: 'International agreements and commitments fulfillment',
  },
  {
    id: '11',
    name: 'IC - UN Sustainable Development Goals',
    parentId: '10',
    code: 'IC-SDG',
    description: 'Alignment with UN Sustainable Development Goals',
  },
  {
    id: '12',
    name: 'IC - Regional Cooperation',
    parentId: '10',
    code: 'IC-RC',
    description: 'Regional cooperation and integration programs',
  },
  {
    id: '13',
    name: 'Corporate Governance',
    code: 'CG',
    description: 'Corporate governance and organizational management',
  },
  {
    id: '14',
    name: 'CG - Transparency and Accountability',
    parentId: '13',
    code: 'CG-TA',
    description: 'Transparency and accountability mechanisms',
  },
  {
    id: '15',
    name: 'CG - Risk Management',
    parentId: '13',
    code: 'CG-RM',
    description: 'Risk management and mitigation strategies',
  },
  {
    id: '16',
    name: 'CG - Compliance',
    parentId: '13',
    code: 'CG-CP',
    description: 'Regulatory compliance and legal requirements',
  },
]

export const mockAttributesResponse = {
  statusCode: 200,
  data: mockKpiAttributes,
  message: 'Attributes retrieved successfully',
}
