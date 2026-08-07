export interface SDG {
  id: string
  kpiId: string
  title: string
  name: string
  description: string
  color: string
  icon: string
  image: string
}

export const SDGS: Array<SDG> = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    kpiId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'No Poverty',
    title: 'No Poverty',
    description: 'End poverty in all its forms everywhere',
    color: '#E5243B',
    icon: '💰',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_01.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    kpiId: 'a7f8c3d9-8e1b-4f2a-9c5d-1b3e7f9a2c4d',
    title: 'Zero Hunger',
    name: 'Zero Hunger',
    description:
      'End hunger, achieve food security and improved nutrition and promote sustainable agriculture',
    color: '#DDA63A',
    icon: '🌾',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_02.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    kpiId: 'b5c2a1e7-3f4d-4a9e-8b1c-5d7e2f9a6b3c',
    title: 'Good Health and Well-being',
    name: 'Good Health',
    description:
      'Ensure healthy lives and promote well-being for all at all ages',
    color: '#4C9F38',
    icon: '🏥',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_03.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    kpiId: 'c9d4e2f1-6a5b-4c8d-9e3f-7a1b5c2d8e4f',
    title: 'Quality Education',
    name: 'Quality Education',
    description:
      'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all',
    color: '#C5192D',
    icon: '📚',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_04.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    kpiId: 'd1e5f3a2-7b6c-4d9a-0e2b-6f3c1a8d5e7f',
    title: 'Gender Equality',
    name: 'Gender Equality',
    description: 'Achieve gender equality and empower all women and girls',
    color: '#FF3A21',
    icon: '⚖️',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_05.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    kpiId: 'e2f6a4b3-8c7d-4e0b-1f3c-7e4d2b9c6f8a',
    title: 'Clean Water and Sanitation',
    name: 'Clean Water',
    description:
      'Ensure availability and sustainable management of water and sanitation for all',
    color: '#26BDE2',
    icon: '💧',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_06.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    kpiId: 'f3a7b5c4-9d8e-4f1c-2a4d-8f5e3c0a7d9b',
    title: 'Affordable and Clean Energy',
    name: 'Clean Energy',
    description:
      'Ensure access to affordable, reliable, sustainable and modern energy for all',
    color: '#FCC30B',
    icon: '⚡',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_07.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    kpiId: 'a4b8c6d5-0e9f-4a2d-3b5e-9a6f4d1b8e0c',
    title: 'Decent Work and Economic Growth',
    name: 'Economic Growth',
    description:
      'Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all',
    color: '#A21942',
    icon: '💼',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_08.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    kpiId: 'b5c9d7e6-1f0a-4b3e-4c6f-0b7a5e2c9f1d',
    title: 'Industry, Innovation and Infrastructure',
    name: 'Innovation',
    description:
      'Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation',
    color: '#FD6925',
    icon: '🏭',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_09.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    kpiId: 'c6d0e8f7-2a1b-4c4f-5d7a-1c8b6f3d0a2e',
    title: 'Reduced Inequalities',
    name: 'Reduced Inequalities',
    description: 'Reduce inequality within and among countries',
    color: '#DD1367',
    icon: '🤝',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_10.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    kpiId: 'd7e1f9a8-3c2d-4e5b-6f0a-2d9e7c4b1f3a',
    title: 'Sustainable Cities and Communities',
    name: 'Sustainable Cities',
    description:
      'Make cities and human settlements inclusive, safe, resilient and sustainable',
    color: '#FD9D24',
    icon: '🏙️',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_11.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    kpiId: 'e8f2a0b9-4d3e-4f6c-7a1b-3e0f8d5c2a4b',
    title: 'Responsible Consumption and Production',
    name: 'Responsible Consumption',
    description: 'Ensure sustainable consumption and production patterns',
    color: '#BF8B2E',
    icon: '♻️',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_12.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    kpiId: 'f9a3b1ca-5e4f-4a7d-8b2c-4f1a9e6d3b5c',
    title: 'Climate Action',
    name: 'Climate Action',
    description: 'Take urgent action to combat climate change and its impacts',
    color: '#3F7E44',
    icon: '🌍',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_13.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    kpiId: 'a0b4c2db-6f5a-4b8e-9c3d-5a2b0f7e4c6d',
    title: 'Life Below Water',
    name: 'Life Below Water',
    description:
      'Conserve and sustainably use the oceans, seas and marine resources for sustainable development',
    color: '#0A97D9',
    icon: '🐟',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_14.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    kpiId: 'b1c5d3ec-7a6b-4c9f-0d4e-6b3c1a8f5d7e',
    title: 'Life on Land',
    name: 'Life on Land',
    description:
      'Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss',
    color: '#56C02B',
    icon: '🌳',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_15.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    kpiId: 'c2d6e4fd-8b7c-4da0-1e5f-7c4d2b9a6e8f',
    title: 'Peace, Justice and Strong Institutions',
    name: 'Peace & Justice',
    description:
      'Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels',
    color: '#00689D',
    icon: '⚖️',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_16.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    kpiId: 'd3e7f5ae-9c8d-4eb1-2f6a-8d5e3c0a7f9b',
    title: 'Partnerships for the Goals',
    name: 'Partnerships',
    description:
      'Strengthen the means of implementation and revitalize the global partnership for sustainable development',
    color: '#19486A',
    icon: '🤝',
    image: '/sdgs/E_SDG_goals_icons_individual_rgb_17.png',
  },
]

export const getSDGById = (id: string): SDG | undefined => {
  return SDGS.find((sdg) => sdg.id === id)
}

export const getSDGsByIds = (ids: Array<string>): Array<SDG> => {
  return SDGS.filter((sdg) => ids.includes(sdg.id))
}

export const getSDGsByCategory = (): Array<SDG> => {
  // You can extend this function to categorize SDGs based on your needs
  return SDGS
}
