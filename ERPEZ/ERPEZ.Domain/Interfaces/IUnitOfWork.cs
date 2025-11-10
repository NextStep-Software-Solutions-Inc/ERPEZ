namespace ERPEZ.Domain.Interfaces;

public interface IUnitOfWork
{
    IPerformanceMeasureRepository PerformanceMeasureRepository { get; }
    IDUFundAllocationRepository DUFundAllocationRepository { get; }
    IKPIRatingRepository KPIRatingRepository { get; }
    IDUAllocationRepository DUAllocationRepository { get; }
    IKPITargetRepository KPITargetRepository { get; }
    IDUKPIAssignmentRepository DUKPIAssignmentRepository { get; }
    IKPIModeOfVerificationRepository KPIModeOfVerificationRepository { get; }
    IReceivedFundRepository ReceivedFundRepository { get; }
    IMFOKPIRepository MFOKPIRepository { get; }
    IKPIRepository KPIRepository { get; }
    ILocationRepository LocationRepository { get; }
    IDeliveryUnitRepository DeliveryUnitRepository { get; }
    IOfficeRepository OfficeRepository { get; }
    IOrganizationRepository OrganizationRepository { get; }
    IFundSourceRepository FundSourceRepository { get; }
    ITransactionRepository TransactionRepository { get; }
    IMFOPAPRepository MFOPAPRepository { get; }
    IOPCRRepository OPCRRepository { get; }
    IOPCRKPIRepository OPCRKPIRepository { get; }
    IOPCRActivityRepository OPCRActivityRepository { get; }
    IOPCRPAPDepartmentRepository OPCRPAPDepartmentRepository { get; }
    IOPCREvaluationRepository OPCREvaluationRepository { get; }
    IObjectRepository ObjectRepository { get; }
    IWFPRepository WFPRepository { get; }
    IWFPActivityRepository WFPActivityRepository { get; }
    IWFPObjectiveRepository WFPObjectiveRepository { get; }
    IWFPOutcomeRepository WFPOutcomeRepository { get; }
    IWFPPAPDepartmentRepository WFPPAPDepartmentRepository { get; }
    IFunctionPercentageAllocationRepository FunctionPercentageAllocationRepository { get; }
    IClusterRepository ClusterRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}