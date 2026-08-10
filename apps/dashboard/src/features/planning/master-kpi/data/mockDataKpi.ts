import { generateMockKpi } from '../handlers'
import {
  MasterKPI,
  TargetDistributionBehavior,
  MonitoringFrequency,
  MeasurementUnit,
} from '../types'

/**
 * Mock KPI database (in-memory)
 */
export const mockKpiDatabase: MasterKPI[] = [
  generateMockKpi({
    id: 'kpi-1',
    code: 'D-1',
    name: 'Number of Trainees',
    operationalDefinition:
      'Total count of individuals who have completed training programs',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: true,
    targetDistributionBehavior: TargetDistributionBehavior.DIVISIBLE_SUMMATIVE,
    isActive: true,
  }),
  generateMockKpi({
    id: 'kpi-2',
    code: 'D-2',
    name: 'Percentage of Budget Utilized',
    operationalDefinition: 'Percentage of allocated budget that has been spent',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: false,
    isActive: true,
    targetDistributionBehavior: TargetDistributionBehavior.UNIFORM_AVERAGE,
  }),
  generateMockKpi({
    id: 'kpi-3',
    code: 'D-1.1',
    name: 'Number of Technical Trainees',
    operationalDefinition:
      'Count of individuals in technical training programs',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: true,
    isActive: true,
    parentKPIId: 'kpi-1',
  }),
  generateMockKpi({
    id: 'kpi-4',
    code: 'D-1.2',
    name: 'Number of Soft Skills Trainees',
    operationalDefinition:
      'Count of individuals in soft skills development programs',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: false,
    isActive: true,
    parentKPIId: 'kpi-1',
  }),
  generateMockKpi({
    id: 'kpi-5',
    code: 'D-3',
    name: 'Project Completion Rate',
    operationalDefinition:
      'Percentage of projects completed on schedule within budget',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: true,
  }),
  generateMockKpi({
    id: 'kpi-6',
    code: 'D-3.1',
    name: 'IT Infrastructure Projects Completion',
    operationalDefinition: 'Count of completed IT infrastructure projects',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: false,

    parentKPIId: 'kpi-5',
  }),
  generateMockKpi({
    id: 'kpi-7',
    code: 'D-3.2',
    name: 'Administrative Projects Completion',
    operationalDefinition: 'Count of completed administrative support projects',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: true,

    parentKPIId: 'kpi-5',
  }),
  generateMockKpi({
    id: 'kpi-8',
    code: 'D-4',
    name: 'Customer Satisfaction Score',
    operationalDefinition:
      'Average satisfaction rating from customer surveys (0-100 scale)',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: false,
  }),
  generateMockKpi({
    id: 'kpi-9',
    code: 'D-5',
    name: 'Employee Retention Rate',
    operationalDefinition:
      'Percentage of employees retained over 12-month period',
    monitoringFrequency: MonitoringFrequency.ANNUAL,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: true,
  }),
  generateMockKpi({
    id: 'kpi-10',
    code: 'D-6',
    name: 'Revenue per Transaction',
    operationalDefinition:
      'Average revenue generated per transaction processed',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: false,
  }),
  generateMockKpi({
    id: 'kpi-11',
    code: 'D-6.1',
    name: 'Online Transaction Revenue',
    operationalDefinition: 'Revenue from online transactions',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: true,

    parentKPIId: 'kpi-10',
  }),
  generateMockKpi({
    id: 'kpi-12',
    code: 'D-6.2',
    name: 'Offline Transaction Revenue',
    operationalDefinition: 'Revenue from offline/in-person transactions',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: false,

    parentKPIId: 'kpi-10',
  }),
  generateMockKpi({
    id: 'kpi-13',
    code: 'D-7',
    name: 'Quality Assurance Pass Rate',
    operationalDefinition:
      'Percentage of deliverables passing quality assurance checks',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: false,
  }),
  generateMockKpi({
    id: 'kpi-14',
    code: 'D-8',
    name: 'System Uptime Percentage',
    operationalDefinition:
      'Percentage of time core systems are available and operational',
    monitoringFrequency: MonitoringFrequency.MONTHLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: true,
  }),
  generateMockKpi({
    id: 'kpi-15',
    code: 'D-9',
    name: 'Cost Efficiency Ratio',
    operationalDefinition: 'Ratio of output value to total operational costs',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: false,
  }),
  generateMockKpi({
    id: 'kpi-16',
    code: 'D-10',
    name: 'Process Improvement Implementation Rate',
    operationalDefinition:
      'Percentage of identified process improvements successfully implemented',
    monitoringFrequency: MonitoringFrequency.SEMI_ANNUAL,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: true,
  }),
  generateMockKpi({
    id: 'kpi-17',
    code: 'D-11',
    name: 'Data Governance Compliance',
    operationalDefinition:
      'Compliance rate with data governance and security policies',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: false,

    targetDistributionBehavior:
      TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE,
  }),
  generateMockKpi({
    id: 'kpi-18',
    code: 'D-12',
    name: 'Market Share Growth',
    operationalDefinition: 'Percentage increase in market share year-over-year',
    monitoringFrequency: MonitoringFrequency.ANNUAL,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: true,
  }),
  generateMockKpi({
    id: 'kpi-19',
    code: 'D-13',
    name: 'Innovation Pipeline Value',
    operationalDefinition: 'Total value of projects in innovation pipeline',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: false,
  }),
  generateMockKpi({
    id: 'kpi-20',
    code: 'D-14',
    name: 'Stakeholder Engagement Score',
    operationalDefinition:
      'Average engagement level from stakeholder feedback (0-10 scale)',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.PERCENTAGE,
    isGAD: true,
  }),
]
