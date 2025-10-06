namespace ERPEZ.Domain.Interfaces;

public interface IUnitOfWork
{
    ILocationRepository LocationRepository { get; }
    IOrganizationRepository OrganizationRepository { get; }
    ITransactionRepository TransactionRepository { get; }
    IMFOPAPRepository MFOPAPRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}