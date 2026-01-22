using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    // Cached repositories with shared DbContext (created once)
    private readonly IPerformanceMeasureRepository performanceMeasureRepository;
    private readonly IAttributeRepository attributeRepository;
    private readonly IOPCRRepository opcrRepository;
    private readonly IOPCRActivityRepository opcrActivityRepository;
    private readonly IOPCRPAPDepartmentRepository opcrPapDepartmentRepository;
    private readonly IWFPRepository wfpRepository;
    private readonly IWFPObjectiveRepository wfpObjectiveRepository;
    private readonly IWFPObjectiveTargetExpenditureRepository wfpObjectiveTargetExpenditureRepository;
    private readonly IWFPPAPDepartmentRepository wfpPapDepartmentRepository;
    private readonly IOPCREvaluationRepository opcrEvaluationRepository;
    private readonly IOPCRRatingRepository opcrRatingRepository;
    private readonly IObjectRepository objectRepository;
    private readonly IRatingRepository ratingRepository;
    private readonly IKPITargetRepository kpiTargetRepository;
    private readonly IDUKPITargetAssignmentRepository dukpiTargetAssignmentRepository;
    private readonly IKPIModeOfVerificationRepository kpiModeOfVerificationRepository;
    private readonly IKPIRepository kpiRepository;
    private readonly IDeliveryUnitRepository deliveryUnitRepository;
    private readonly IOfficeRepository officeRepository;
    private readonly IOrganizationRepository organizationRepository;
    private readonly IFundSourceRepository fundSourceRepository;
    private readonly ILocationRepository locationRepository;
    private readonly ITransactionRepository transactionRepository;
    private readonly IMFOPAPRepository mfoPapRepository;
    private readonly IFunctionAllocationRepository functionAllocationRepository;
    private readonly IFiscalYearRepository fiscalYearRepository;
    private readonly IClusterRepository clusterRepository;
    private readonly IWFPObjectiveTargetRepository wfpObjectiveTargetRepository;
    private readonly IWFPObjectiveTimelineRepository wfpObjectiveTimelineRepository;
    private readonly ISDGRepository sdgRepository;
    private readonly IKPIPerformanceMeasureRepository kpiPerformanceMeasureRepository;
    private readonly IOPCRActivityRatingRepository opcrActivityRatingRepository;
    private readonly IOPCRActivityEvaluationRepository opcrActivityEvaluationRepository;
    private readonly IOPCRActivityMOVRepository opcrActivityMOVRepository;
    private readonly IUACSCodeSegmentRepository uacsCodeSegmentRepository;
    private readonly IUACSValidationRuleRepository uacsValidationRuleRepository;
    private readonly IUACSCodeCombinationRepository uacsCodeCombinationRepository;
    // Constructor initializes all repositories once
    public UnitOfWork(ApplicationDbContext context, IServiceProvider serviceProvider)
    {
        this.context = context ?? throw new ArgumentNullException(nameof(context));
        sieveProcessor = serviceProvider.GetRequiredService<ISieveProcessor>();

        // Create and cache all repositories with shared context
        performanceMeasureRepository = new PerformanceMeasureRepository(context, sieveProcessor);
        attributeRepository = new AttributeRepository(context, sieveProcessor);
        opcrRepository = new OPCRRepository(context, sieveProcessor);
        opcrActivityRepository = new OPCRActivityRepository(context, sieveProcessor);
        opcrPapDepartmentRepository = new OPCRPAPDepartmentRepository(context, sieveProcessor);
        wfpRepository = new WFPRepository(context, sieveProcessor);
        wfpObjectiveRepository = new WFPObjectiveRepository(context, sieveProcessor);
        wfpObjectiveTargetExpenditureRepository = new WFPObjectiveTargetExpenditureRepository(context, sieveProcessor);
        wfpPapDepartmentRepository = new WFPPAPDepartmentRepository(context, sieveProcessor);
        opcrEvaluationRepository = new OPCREvaluationRepository(context, sieveProcessor);
        opcrRatingRepository = new OPCRRatingRepository(context, sieveProcessor);
        objectRepository = new ObjectRepository(context, sieveProcessor);
        ratingRepository = new RatingRepository(context, sieveProcessor);
        kpiTargetRepository = new KPITargetRepository(context, sieveProcessor);
        dukpiTargetAssignmentRepository = new DUKPITargetAssignmentRepository(context, sieveProcessor);
        kpiModeOfVerificationRepository = new KPIModeOfVerificationRepository(context, sieveProcessor);
        kpiRepository = new KPIRepository(context, sieveProcessor);
        deliveryUnitRepository = new DeliveryUnitRepository(context, sieveProcessor);
        officeRepository = new OfficeRepository(context, sieveProcessor);
        organizationRepository = new OrganizationRepository(context, sieveProcessor);
        fundSourceRepository = new FundSourceRepository(context, sieveProcessor);
        locationRepository = new LocationRepository(context, sieveProcessor);
        transactionRepository = new TransactionRepository(context, sieveProcessor);
        mfoPapRepository = new MFOPAPRepository(context, sieveProcessor);
        functionAllocationRepository = new FunctionAllocationRepository(context, sieveProcessor);
        fiscalYearRepository = new FiscalYearRepository(context, sieveProcessor);
        clusterRepository = new ClusterRepository(context, sieveProcessor);
        wfpObjectiveTargetRepository = new WFPObjectiveTargetRepository(context, sieveProcessor);
        wfpObjectiveTimelineRepository = new WFPObjectiveTimelineRepository(context, sieveProcessor);
        sdgRepository = new SDGRepository(context, sieveProcessor);
        kpiPerformanceMeasureRepository = new KPIPerformanceMeasureRepository(context, sieveProcessor);
        opcrActivityRatingRepository = new OPCRActivityRatingRepository(context, sieveProcessor);
        opcrActivityEvaluationRepository = new OPCRActivityEvaluationRepository(context, sieveProcessor);
        opcrActivityMOVRepository = new OPCRActivityMOVRepository(context, sieveProcessor);
        uacsCodeSegmentRepository = new UACSCodeSegmentRepository(context, sieveProcessor);
        uacsValidationRuleRepository = new UACSValidationRuleRepository(context, sieveProcessor);
        uacsCodeCombinationRepository = new UACSCodeCombinationRepository(context, sieveProcessor);
    }

    // Public properties return cached instances
    public IPerformanceMeasureRepository PerformanceMeasureRepository => performanceMeasureRepository;
    public IAttributeRepository AttributeRepository => attributeRepository;
    public IOPCRRepository OPCRRepository => opcrRepository;
    public IOPCRActivityRepository OPCRActivityRepository => opcrActivityRepository;
    public IOPCRPAPDepartmentRepository OPCRPAPDepartmentRepository => opcrPapDepartmentRepository;
    public IWFPRepository WFPRepository => wfpRepository;
    public IWFPObjectiveRepository WFPObjectiveRepository => wfpObjectiveRepository;
    public IWFPObjectiveTargetExpenditureRepository WFPObjectiveTargetExpenditureRepository => wfpObjectiveTargetExpenditureRepository;
    public IWFPPAPDepartmentRepository WFPPAPDepartmentRepository => wfpPapDepartmentRepository;
    public IOPCREvaluationRepository OPCREvaluationRepository => opcrEvaluationRepository;
    public IOPCRRatingRepository OPCRRatingRepository => opcrRatingRepository;
    public IObjectRepository ObjectRepository => objectRepository;
    public IRatingRepository RatingRepository => ratingRepository;
    public IKPITargetRepository KPITargetRepository => kpiTargetRepository;
    public IDUKPITargetAssignmentRepository DUKPITargetAssignmentRepository => dukpiTargetAssignmentRepository;
    public IKPIModeOfVerificationRepository KPIModeOfVerificationRepository => kpiModeOfVerificationRepository;
    public IKPIRepository KPIRepository => kpiRepository;
    public IDeliveryUnitRepository DeliveryUnitRepository => deliveryUnitRepository;
    public IOfficeRepository OfficeRepository => officeRepository;
    public IOrganizationRepository OrganizationRepository => organizationRepository;
    public IFundSourceRepository FundSourceRepository => fundSourceRepository;
    public ILocationRepository LocationRepository => locationRepository;
    public ITransactionRepository TransactionRepository => transactionRepository;
    public IMFOPAPRepository MFOPAPRepository => mfoPapRepository;
    public IFunctionAllocationRepository FunctionAllocationRepository => functionAllocationRepository;
    public IFiscalYearRepository FiscalYearRepository => fiscalYearRepository;
    public IClusterRepository ClusterRepository => clusterRepository;
    public IWFPObjectiveTargetRepository WFPObjectiveTargetRepository => wfpObjectiveTargetRepository;
    public IWFPObjectiveTimelineRepository WFPObjectiveTimelineRepository => wfpObjectiveTimelineRepository;
    public ISDGRepository SDGRepository => sdgRepository;
    public IKPIPerformanceMeasureRepository KPIPerformanceMeasureRepository => kpiPerformanceMeasureRepository;
    public IOPCRActivityRatingRepository OPCRActivityRatingRepository => opcrActivityRatingRepository;
    public IOPCRActivityEvaluationRepository OPCRActivityEvaluationRepository => opcrActivityEvaluationRepository;
    public IOPCRActivityMOVRepository OPCRActivityMOVRepository => opcrActivityMOVRepository;
    public IUACSCodeSegmentRepository UACSCodeSegmentRepository => uacsCodeSegmentRepository;
    public IUACSValidationRuleRepository UACSValidationRuleRepository => uacsValidationRuleRepository;
    public IUACSCodeCombinationRepository UACSCodeCombinationRepository => uacsCodeCombinationRepository;
    public async Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await operation();
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose() => context.Dispose();
}
