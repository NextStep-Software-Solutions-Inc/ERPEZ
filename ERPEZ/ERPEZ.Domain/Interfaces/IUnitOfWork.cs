namespace ERPEZ.Domain.Interfaces;

public interface IUnitOfWork
{
    IProductRepository ProductRepository { get; }
    ILocationRepository LocationRepository { get; }
    IOrganizationRepository OrganizationRepository { get; }
    ITransactionRepository TransactionRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}