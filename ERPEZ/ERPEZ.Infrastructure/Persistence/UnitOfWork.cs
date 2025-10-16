using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext _context;

    public IDUAllocationRepository DUAllocationRepository { get; }
    public IKPITargetRepository KPITargetRepository { get; }
    public IKPIAssignmentRepository KPIAssignmentRepository { get; }
    public IKPIModeOfVerificationRepository KPIModeOfVerificationRepository { get; }
    public IReceivedFundRepository ReceivedFundRepository { get; }
    public IMFOKPIRepository MFOKPIRepository { get; }
    public IKPIRepository KPIRepository { get; }
    public IDeliveryUnitRepository DeliveryUnitRepository { get; }
    public IOfficeRepository OfficeRepository { get; }
    public IOrganizationRepository OrganizationRepository { get; }
    public IFundSourceRepository FundSourceRepository { get; }
    public ILocationRepository LocationRepository { get; }
    public ITransactionRepository TransactionRepository { get; }
    public IMFOPAPRepository MFOPAPRepository { get; }
    public IFunctionPercentageAllocationRepository FunctionPercentageAllocationRepository { get; }

    public UnitOfWork(ApplicationDbContext context,
                        ISieveProcessor sieveProcessor,
                        IReceivedFundRepository receivedFundRepository,
                        IKPIAssignmentRepository kPIAssignmentRepository,
                        IKPITargetRepository kPITargetRepository,
                        IKPIModeOfVerificationRepository kPIModeOfVerificationRepository,
                        IMFOKPIRepository mFOKPIRepository,
                        IDUAllocationRepository dUAllocationRepository,
                        IKPIRepository kPIRepository,
                        IDeliveryUnitRepository deliveryUnitRepository,
                        IOfficeRepository officeRepository,
                        IOrganizationRepository organizationRepository,
                        IFundSourceRepository fundSourceRepository,
                        ILocationRepository locationRepository,
                        ITransactionRepository transactionRepository,
                        IMFOPAPRepository mFOPAPRepository,
                        IFunctionPercentageAllocationRepository functionPercentageAllocationRepository)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));

        MFOKPIRepository = mFOKPIRepository ?? throw new ArgumentNullException(nameof(mFOKPIRepository));
        KPIAssignmentRepository = kPIAssignmentRepository ?? throw new ArgumentNullException(nameof(kPIAssignmentRepository));
        KPITargetRepository = kPITargetRepository ?? throw new ArgumentNullException(nameof(kPITargetRepository));
        KPIModeOfVerificationRepository = kPIModeOfVerificationRepository ?? throw new ArgumentNullException(nameof(kPIModeOfVerificationRepository));
        ReceivedFundRepository = receivedFundRepository ?? throw new ArgumentNullException(nameof(receivedFundRepository));
        DUAllocationRepository = dUAllocationRepository ?? throw new ArgumentNullException(nameof(dUAllocationRepository));
        KPIRepository = kPIRepository ?? throw new ArgumentNullException(nameof(kPIRepository));
        DeliveryUnitRepository = deliveryUnitRepository ?? throw new ArgumentNullException(nameof(deliveryUnitRepository));
        OfficeRepository = officeRepository ?? throw new ArgumentNullException(nameof(officeRepository));
        OrganizationRepository = organizationRepository ?? throw new ArgumentNullException(nameof(organizationRepository));
        FundSourceRepository = fundSourceRepository ?? throw new ArgumentNullException(nameof(fundSourceRepository));
        LocationRepository = locationRepository ?? throw new ArgumentNullException(nameof(locationRepository));
        TransactionRepository = transactionRepository ?? throw new ArgumentNullException(nameof(transactionRepository));
        MFOPAPRepository = mFOPAPRepository ?? throw new ArgumentNullException(nameof(mFOPAPRepository));
        FunctionPercentageAllocationRepository = functionPercentageAllocationRepository ?? throw new ArgumentNullException(nameof(functionPercentageAllocationRepository));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose() => _context.Dispose();
}