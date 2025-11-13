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
    private readonly IOPCRRepository opcrRepository;
    private readonly IOPCRKPIRepository opcrKpiRepository;
    private readonly IOPCRActivityRepository opcrActivityRepository;
    private readonly IOPCRPAPDepartmentRepository opcrPapDepartmentRepository;
    private readonly IWFPRepository wfpRepository;
    private readonly IWFPObjectiveRepository wfpObjectiveRepository;
    private readonly IWFPOutcomeRepository wfpOutcomeRepository;
    private readonly IWFPActivityRepository wfpActivityRepository;
    private readonly IActivityBudgetRequirementRepository activityBudgetRequirementRepository;
    private readonly IWFPPAPDepartmentRepository wfpPapDepartmentRepository;
    private readonly IOPCREvaluationRepository opcrEvaluationRepository;
    private readonly IOPCRRatingRepository opcrRatingRepository;
    private readonly IObjectRepository objectRepository;
    private readonly IDUFundAllocationRepository duFundAllocationRepository;
    private readonly IKPIRatingRepository kpiRatingRepository;
    private readonly IDUAllocationRepository duAllocationRepository;
    private readonly IKPITargetRepository kpiTargetRepository;
    private readonly IDUKPIAssignmentRepository dukpiAssignmentRepository;
    private readonly IKPIModeOfVerificationRepository kpiModeOfVerificationRepository;
    private readonly IReceivedFundRepository receivedFundRepository;
    private readonly IMFOKPIRepository mfoKpiRepository;
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

    // Constructor initializes all repositories once
    public UnitOfWork(ApplicationDbContext context, IServiceProvider serviceProvider)
    {
        this.context = context ?? throw new ArgumentNullException(nameof(context));
        sieveProcessor = serviceProvider.GetRequiredService<ISieveProcessor>();

        // Create and cache all repositories with shared context
        performanceMeasureRepository = new PerformanceMeasureRepository(context, sieveProcessor);
        opcrRepository = new OPCRRepository(context, sieveProcessor);
        opcrKpiRepository = new OPCRKPIRepository(context, sieveProcessor);
        opcrActivityRepository = new OPCRActivityRepository(context, sieveProcessor);
        opcrPapDepartmentRepository = new OPCRPAPDepartmentRepository(context, sieveProcessor);
        wfpRepository = new WFPRepository(context, sieveProcessor);
        wfpObjectiveRepository = new WFPObjectiveRepository(context, sieveProcessor);
        wfpOutcomeRepository = new WFPOutcomeRepository(context, sieveProcessor);
        wfpActivityRepository = new WFPActivityRepository(context, sieveProcessor);
        activityBudgetRequirementRepository = new ActivityBudgetRequirementRepository(context, sieveProcessor);
        wfpPapDepartmentRepository = new WFPPAPDepartmentRepository(context, sieveProcessor);
        opcrEvaluationRepository = new OPCREvaluationRepository(context, sieveProcessor);
        opcrRatingRepository = new OPCRRatingRepository(context, sieveProcessor);
        objectRepository = new ObjectRepository(context, sieveProcessor);
        duFundAllocationRepository = new DUFundAllocationRepository(context, sieveProcessor);
        kpiRatingRepository = new KPIRatingRepository(context, sieveProcessor);
        duAllocationRepository = new DUAllocationRepository(context, sieveProcessor);
        kpiTargetRepository = new KPITargetRepository(context, sieveProcessor);
        dukpiAssignmentRepository = new DUKPIAssignmentRepository(context, sieveProcessor);
        kpiModeOfVerificationRepository = new KPIModeOfVerificationRepository(context, sieveProcessor);
        receivedFundRepository = new ReceivedFundRepository(context, sieveProcessor);
        mfoKpiRepository = new MFOKPIRepository(context, sieveProcessor);
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
    }

    // Public properties return cached instances
    public IPerformanceMeasureRepository PerformanceMeasureRepository => performanceMeasureRepository;
    public IOPCRRepository OPCRRepository => opcrRepository;
    public IOPCRKPIRepository OPCRKPIRepository => opcrKpiRepository;
    public IOPCRActivityRepository OPCRActivityRepository => opcrActivityRepository;
    public IOPCRPAPDepartmentRepository OPCRPAPDepartmentRepository => opcrPapDepartmentRepository;
    public IWFPRepository WFPRepository => wfpRepository;
    public IWFPObjectiveRepository WFPObjectiveRepository => wfpObjectiveRepository;
    public IWFPOutcomeRepository WFPOutcomeRepository => wfpOutcomeRepository;
    public IWFPActivityRepository WFPActivityRepository => wfpActivityRepository;
    public IActivityBudgetRequirementRepository ActivityBudgetRequirementRepository => activityBudgetRequirementRepository;
    public IWFPPAPDepartmentRepository WFPPAPDepartmentRepository => wfpPapDepartmentRepository;
    public IOPCREvaluationRepository OPCREvaluationRepository => opcrEvaluationRepository;
    public IOPCRRatingRepository OPCRRatingRepository => opcrRatingRepository;
    public IObjectRepository ObjectRepository => objectRepository;
    public IDUFundAllocationRepository DUFundAllocationRepository => duFundAllocationRepository;
    public IKPIRatingRepository KPIRatingRepository => kpiRatingRepository;
    public IDUAllocationRepository DUAllocationRepository => duAllocationRepository;
    public IKPITargetRepository KPITargetRepository => kpiTargetRepository;
    public IDUKPIAssignmentRepository DUKPIAssignmentRepository => dukpiAssignmentRepository;
    public IKPIModeOfVerificationRepository KPIModeOfVerificationRepository => kpiModeOfVerificationRepository;
    public IReceivedFundRepository ReceivedFundRepository => receivedFundRepository;
    public IMFOKPIRepository MFOKPIRepository => mfoKpiRepository;
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
