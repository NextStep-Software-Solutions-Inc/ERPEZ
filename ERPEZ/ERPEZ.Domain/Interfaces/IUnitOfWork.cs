namespace ERPEZ.Domain.Interfaces;

public interface IUnitOfWork
{
    ILocationRepository LocationRepository { get; }
    IOrganizationRepository OrganizationRepository { get; }
    IFundSourceRepository FundSourceRepository { get; }
    ITransactionRepository TransactionRepository { get; }
    IMFOPAPRepository MFOPAPRepository { get; }
    IFunctionPercentageAllocationRepository FunctionPercentageAllocationRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}