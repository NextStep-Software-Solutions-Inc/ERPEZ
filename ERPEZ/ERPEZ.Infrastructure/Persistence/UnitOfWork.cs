using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext _context;

    public IProductRepository ProductRepository { get; }
    public IOrganizationRepository OrganizationRepository { get; }
    public ILocationRepository LocationRepository { get; }
    public ITransactionRepository TransactionRepository { get; }

    public UnitOfWork(ApplicationDbContext context,
                      ISieveProcessor sieveProcessor,
                      IOrganizationRepository organizationRepository,
                      ILocationRepository locationRepository,
                      ITransactionRepository transactionRepository,
                      IProductRepository productRepository)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));

        ProductRepository = productRepository ?? throw new ArgumentNullException(nameof(organizationRepository));
        OrganizationRepository = organizationRepository ?? throw new ArgumentNullException(nameof(organizationRepository));
        LocationRepository = locationRepository ?? throw new ArgumentNullException(nameof(locationRepository));
        TransactionRepository = transactionRepository ?? throw new ArgumentNullException(nameof(transactionRepository));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose() => _context.Dispose();
}