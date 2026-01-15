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
    IClusterRepository ClusterRepository { get; }
    IWFPObjectiveTargetRepository WFPObjectiveTargetRepository { get; }
    IWFPObjectiveTimelineRepository WFPObjectiveTimelineRepository { get; }
    ISDGRepository SDGRepository { get; }
    IKPIPerformanceMeasureRepository KPIPerformanceMeasureRepository { get; }
    IOPCRActivityRatingRepository OPCRActivityRatingRepository { get; }
    IOPCRActivityEvaluationRepository OPCRActivityEvaluationRepository { get; }
    IOPCRActivityMOVRepository OPCRActivityMOVRepository { get; }
    IAccountRepository AccountRepository { get; }
    IAccountTransactionRepository AccountTransactionRepository { get; }
    IUserPINRepository UserPINRepository { get; }
    Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
