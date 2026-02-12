namespace ERPEZ.Domain.Interfaces;

public interface IUnitOfWork
{
    IWFPObjectiveTargetExpenditureRepository WFPObjectiveTargetExpenditureRepository { get; }
    IAttributeRepository AttributeRepository { get; }
    IPerformanceMeasureRepository PerformanceMeasureRepository { get; }
    IRatingRepository RatingRepository { get; }
    IKPITargetRepository KPITargetRepository { get; }
    IDUKPITargetAssignmentRepository DUKPITargetAssignmentRepository { get; }
    IKPIModeOfVerificationRepository KPIModeOfVerificationRepository { get; }
    IKPIRepository KPIRepository { get; }
    ILocationRepository LocationRepository { get; }
    IDeliveryUnitRepository DeliveryUnitRepository { get; }
    IOfficeRepository OfficeRepository { get; }
    IOrganizationRepository OrganizationRepository { get; }
    IFundSourceRepository FundSourceRepository { get; }
    ITransactionRepository TransactionRepository { get; }
    IMFOPAPRepository MFOPAPRepository { get; }
    IOPCRRepository OPCRRepository { get; }
    IOPCRActivityRepository OPCRActivityRepository { get; }
    IOPCRPAPDepartmentRepository OPCRPAPDepartmentRepository { get; }
    IOPCREvaluationRepository OPCREvaluationRepository { get; }
    IObjectRepository ObjectRepository { get; }
    IOPCRRatingRepository OPCRRatingRepository { get; }
    IWFPRepository WFPRepository { get; }
    IWFPObjectiveRepository WFPObjectiveRepository { get; }
    IWFPPAPDepartmentRepository WFPPAPDepartmentRepository { get; }
    IFunctionAllocationRepository FunctionAllocationRepository { get; }
    IFiscalYearRepository FiscalYearRepository { get; }
    IFiscalMonthRepository FiscalMonthRepository { get; }
    IBudgetCallRepository BudgetCallRepository { get; }
    IClusterRepository ClusterRepository { get; }
    IWFPObjectiveTargetRepository WFPObjectiveTargetRepository { get; }
    IWFPObjectiveTimelineRepository WFPObjectiveTimelineRepository { get; }
    ISDGRepository SDGRepository { get; }
    IKPIPerformanceMeasureRepository KPIPerformanceMeasureRepository { get; }
    IOPCRActivityRatingRepository OPCRActivityRatingRepository { get; }
    IOPCRActivityEvaluationRepository OPCRActivityEvaluationRepository { get; }
    IOPCRActivityMOVRepository OPCRActivityMOVRepository { get; }
    IUACSCodeSegmentRepository UACSCodeSegmentRepository { get; }
    IUACSValidationRuleRepository UACSValidationRuleRepository { get; }
    IUACSCodeCombinationRepository UACSCodeCombinationRepository { get; }
    IUACSCodeSegmentFiscalYearRepository UACSCodeSegmentFiscalYearRepository { get; }
    IUACSCodeCombinationFiscalYearRepository UACSCodeCombinationFiscalYearRepository { get; }
    IExpenseClassRepository ExpenseClassRepository { get; }
    IObjectExpenseClassRepository ObjectExpenseClassRepository { get; }
    IUACSImportLogRepository UACSImportLogRepository { get; }
    IObjectChildCodeRepository ObjectChildCodeRepository { get; }
    IOfficeTypeRepository OfficeTypeRepository { get; }
    ICategoryRepository CategoryRepository { get; }
    IAdministrativeLevelRepository AdministrativeLevelRepository { get; }
    IProcurementWorkflowRepository ProcurementWorkflowRepository { get; }
    IPositionRepository PositionRepository { get; }
    IPositionTypeRepository PositionTypeRepository { get; }
    ISalaryGradeRepository SalaryGradeRepository { get; }
    IPlantillaTypeRepository PlantillaTypeRepository { get; }
    IStepRepository StepRepository { get; }
    IProcurementCategoryRepository ProcurementCategoryRepository { get; }
    IProcurementModeRepository ProcurementModeRepository { get; }
    IProcurementModeThresholdRepository ProcurementModeThresholdRepository { get; }
    IUOMRepository UOMRepository { get; }
    IUNSPSCCodeRepository UNSPSCCodeRepository { get; }
    IProcurementItemRepository ProcurementItemRepository { get; }
    Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
