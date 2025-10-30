namespace ERPEZ.Domain.Interfaces;

public interface IUnitOfWork
{
    IPerformanceMeasureRepository PerformanceMeasureRepository { get; }
    IKPIRatingRepository KPIRatingRepository { get; }
    IDUAllocationRepository DUAllocationRepository { get; }
    IKPITargetRepository KPITargetRepository { get; }
    IKPIAssignmentRepository KPIAssignmentRepository { get; }
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
    IFunctionPercentageAllocationRepository FunctionPercentageAllocationRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}