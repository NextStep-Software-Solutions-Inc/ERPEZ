using ERPEZ.Application.Common.Exceptions;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.CreateAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using FluentAssertions;
using Sieve.Models;
using System.Linq.Expressions;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Procurement.AgencyProcurementRequest.Commands;

public class APRCommandHandlerTests
{
    [Fact]
    public async Task CreateAPR_ShouldReturnFail_WhenAppIsNotApproved()
    {
        var unitOfWork = new StubUnitOfWork();
        var app = TestData.CreateApp(StatusEnum.Draft);
        unitOfWork.Apps.Add(app);
        unitOfWork.Offices.Add(new Office { Id = app.OfficeId, Code = "HR", Name = "Human Resources" });
        unitOfWork.FiscalYears.Add(new FiscalYear { Id = app.FiscalYearId, Year = 2026 });

        var handler = new CreateAPRCommandHandler(unitOfWork);
        var command = TestData.CreateCommand(app);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Selected APP is not approved.");
        unitOfWork.APRs.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateAPR_ShouldReturnFail_WhenBudgetExceedsApprovedAppBudget()
    {
        var unitOfWork = new StubUnitOfWork();
        var app = TestData.CreateApp(StatusEnum.Approved);
        unitOfWork.Apps.Add(app);
        unitOfWork.Offices.Add(new Office { Id = app.OfficeId, Code = "HR", Name = "Human Resources" });
        unitOfWork.FiscalYears.Add(new FiscalYear { Id = app.FiscalYearId, Year = 2026 });

        var handler = new CreateAPRCommandHandler(unitOfWork);
        var command = TestData.CreateCommand(app, quantityRequested: 6, unitCost: 250m);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("exceeds APP approved budget");
        unitOfWork.APRs.Should().BeEmpty();
    }

    [Fact]
    public async Task ChangeAPRStatus_ShouldReturnFail_WhenTransitionIsNotAllowed()
    {
        var unitOfWork = new StubUnitOfWork();
        var apr = new APR { Id = Guid.NewGuid(), Status = StatusEnum.Draft };
        unitOfWork.APRs.Add(apr);

        var handler = new ChangeAPRStatusCommandHandler(unitOfWork);
        var command = new ChangeAPRStatusCommand
        {
            Id = apr.Id,
            Status = StatusEnum.Approved
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Cannot change APR status from Draft to Approved.");
    }

    [Fact]
    public async Task ChangeAPRStatus_ShouldSetApprovedDate_WhenTransitionSucceeds()
    {
        var unitOfWork = new StubUnitOfWork();
        var apr = new APR { Id = Guid.NewGuid(), Status = StatusEnum.ForApproval };
        unitOfWork.APRs.Add(apr);

        var handler = new ChangeAPRStatusCommandHandler(unitOfWork);
        var command = new ChangeAPRStatusCommand
        {
            Id = apr.Id,
            Status = StatusEnum.Approved,
            Remarks = "Approved by BAC"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        apr.Status.Should().Be(StatusEnum.Approved);
        apr.ApprovedDate.Should().NotBeNull();
        apr.AdditionalRemarks.Should().Be("Approved by BAC");
        unitOfWork.SavedChangesCount.Should().Be(1);
    }

    private static class TestData
    {
        public static APP CreateApp(StatusEnum status)
        {
            var appId = Guid.NewGuid();
            var officeId = Guid.NewGuid();
            var fiscalYearId = Guid.NewGuid();
            var ppmpItemId = Guid.NewGuid();
            var appItemId = Guid.NewGuid();

            var ppmpItem = new PPMPItem
            {
                Id = ppmpItemId,
                Name = "Printer",
                Unit = "unit",
                UnitPrice = 100m,
                PPMPItemAllocations =
                [
                    new PPMPItemAllocation
                    {
                        Id = Guid.NewGuid(),
                        PPMPItemId = ppmpItemId,
                        Quantity = 5,
                        Amount = 500m
                    }
                ]
            };

            var appItem = new APPItem
            {
                Id = appItemId,
                APPId = appId,
                OfficeId = officeId,
                PPMPItemId = ppmpItemId,
                PPMPItem = ppmpItem
            };

            return new APP
            {
                Id = appId,
                OfficeId = officeId,
                FiscalYearId = fiscalYearId,
                Status = status,
                APPNumber = "APP-2026-001",
                APPItems = [appItem]
            };
        }

        public static CreateAPRCommand CreateCommand(APP app, decimal? quantityRequested = null, decimal? unitCost = null)
        {
            return new CreateAPRCommand
            {
                APPId = app.Id,
                OfficeId = app.OfficeId,
                FiscalYearId = app.FiscalYearId,
                RequestDate = new DateOnly(2026, 1, 15),
                Items =
                [
                    new CreateAPRItemDto
                    {
                        APPItemId = app.APPItems[0].Id,
                        QuantityRequested = quantityRequested,
                        UnitCost = unitCost
                    }
                ]
            };
        }
    }

    private class StubUnitOfWork : IUnitOfWork
    {
        public List<APP> Apps { get; } = [];
        public List<APR> APRs { get; } = [];
        public List<Office> Offices { get; } = [];
        public List<FiscalYear> FiscalYears { get; } = [];
        public int SavedChangesCount { get; private set; }

        public IAPPRepository APPRepository => new StubAPPRepository(Apps);
        public IAPRRepository APRRepository => new StubAPRRepository(APRs);
        public IOfficeRepository OfficeRepository => new StubOfficeRepository(Offices);
        public IFiscalYearRepository FiscalYearRepository => new StubFiscalYearRepository(FiscalYears);
        public IProcurementProjectRepository ProcurementProjectRepository => throw new NotImplementedException();
        public IPublicSupplierApplicationRepository PublicSupplierApplicationRepository => throw new NotImplementedException();

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SavedChangesCount++;
            return Task.FromResult(1);
        }

        public Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default) => operation();

        public IWFPObjectiveActivityExpenditureRepository WFPObjectiveActivityExpenditureRepository => throw new NotImplementedException();
        public IAttributeRepository AttributeRepository => throw new NotImplementedException();
        public IPerformanceMeasureRepository PerformanceMeasureRepository => throw new NotImplementedException();
        public IRatingRepository RatingRepository => throw new NotImplementedException();
        public IKPITargetRepository KPITargetRepository => throw new NotImplementedException();
        public IDUKPITargetAssignmentRepository DUKPITargetAssignmentRepository => throw new NotImplementedException();
        public IKPIModeOfVerificationRepository KPIModeOfVerificationRepository => throw new NotImplementedException();
        public IKPIRepository KPIRepository => throw new NotImplementedException();
        public ILocationRepository LocationRepository => throw new NotImplementedException();
        public IDeliveryUnitRepository DeliveryUnitRepository => throw new NotImplementedException();
        public IOrganizationRepository OrganizationRepository => throw new NotImplementedException();
        public IFundSourceRepository FundSourceRepository => throw new NotImplementedException();
        public ITransactionRepository TransactionRepository => throw new NotImplementedException();
        public IMFOPAPRepository MFOPAPRepository => throw new NotImplementedException();
        public IOPCRRepository OPCRRepository => throw new NotImplementedException();
        public IOPCRItemRepository OPCRItemRepository => throw new NotImplementedException();
        public IOPCRActivityRepository OPCRActivityRepository => throw new NotImplementedException();
        public IOPCRPAPDepartmentRepository OPCRPAPDepartmentRepository => throw new NotImplementedException();
        public IOPCREvaluationRepository OPCREvaluationRepository => throw new NotImplementedException();
        public IObjectRepository ObjectRepository => throw new NotImplementedException();
        public IOPCRRatingRepository OPCRRatingRepository => throw new NotImplementedException();
        public IWFPRepository WFPRepository => throw new NotImplementedException();
        public IWFPObjectiveRepository WFPObjectiveRepository => throw new NotImplementedException();
        public IWFPPAPDepartmentRepository WFPPAPDepartmentRepository => throw new NotImplementedException();
        public IFunctionAllocationRepository FunctionAllocationRepository => throw new NotImplementedException();
        public IFiscalMonthRepository FiscalMonthRepository => throw new NotImplementedException();
        public IBudgetCallRepository BudgetCallRepository => throw new NotImplementedException();
        public IAgencyMasterBudgetRepository AgencyMasterBudgetRepository => throw new NotImplementedException();
        public IOfficeCeilingRepository OfficeCeilingRepository => throw new NotImplementedException();
        public ISubOfficeCeilingRepository SubOfficeCeilingRepository => throw new NotImplementedException();
        public ILineItemBudgetRepository LineItemBudgetRepository => throw new NotImplementedException();
        public ILineItemBudgetActivityRepository LineItemBudgetActivityRepository => throw new NotImplementedException();
        public ILineItemBudgetDetailRepository LineItemBudgetDetailRepository => throw new NotImplementedException();
        public ILIBAmendmentRequestRepository LIBAmendmentRequestRepository => throw new NotImplementedException();
        public IMarketScopingRepository MarketScopingRepository => throw new NotImplementedException();
        public IMarketScopingParameterRepository MarketScopingParameterRepository => throw new NotImplementedException();
        public IMarketScopingActivityRepository MarketScopingActivityRepository => throw new NotImplementedException();
        public IMarketScopingParameterSettingsRepository MarketScopingParameterSettingsRepository => throw new NotImplementedException();
        public IMarketScopingActivitySettingsRepository MarketScopingActivitySettingsRepository => throw new NotImplementedException();
        public IClusterRepository ClusterRepository => throw new NotImplementedException();
        public IWFPObjectiveActivityRepository WFPObjectiveActivityRepository => throw new NotImplementedException();
        public IWFPObjectiveTimelineRepository WFPObjectiveTimelineRepository => throw new NotImplementedException();
        public ISDGRepository SDGRepository => throw new NotImplementedException();
        public IKPIPerformanceMeasureRepository KPIPerformanceMeasureRepository => throw new NotImplementedException();
        public IOPCRActivityRatingRepository OPCRActivityRatingRepository => throw new NotImplementedException();
        public IOPCRActivityEvaluationRepository OPCRActivityEvaluationRepository => throw new NotImplementedException();
        public IOPCRActivityMOVRepository OPCRActivityMOVRepository => throw new NotImplementedException();
        public IUACSCodeSegmentRepository UACSCodeSegmentRepository => throw new NotImplementedException();
        public IUACSValidationRuleRepository UACSValidationRuleRepository => throw new NotImplementedException();
        public IUACSCodeCombinationRepository UACSCodeCombinationRepository => throw new NotImplementedException();
        public IUACSCodeSegmentFiscalYearRepository UACSCodeSegmentFiscalYearRepository => throw new NotImplementedException();
        public IUACSCodeCombinationFiscalYearRepository UACSCodeCombinationFiscalYearRepository => throw new NotImplementedException();
        public IExpenseClassRepository ExpenseClassRepository => throw new NotImplementedException();
        public IObjectExpenseClassRepository ObjectExpenseClassRepository => throw new NotImplementedException();
        public IUACSImportLogRepository UACSImportLogRepository => throw new NotImplementedException();
        public IObjectChildCodeRepository ObjectChildCodeRepository => throw new NotImplementedException();
        public IOfficeTypeRepository OfficeTypeRepository => throw new NotImplementedException();
        public ICategoryRepository CategoryRepository => throw new NotImplementedException();
        public IBACResolutionWhereasClauseRepository BACResolutionWhereasClauseRepository => throw new NotImplementedException();
        public IAdministrativeLevelRepository AdministrativeLevelRepository => throw new NotImplementedException();
        public IProcurementWorkflowRepository ProcurementWorkflowRepository => throw new NotImplementedException();
        public IPositionRepository PositionRepository => throw new NotImplementedException();
        public IPositionTypeRepository PositionTypeRepository => throw new NotImplementedException();
        public ISalaryGradeRepository SalaryGradeRepository => throw new NotImplementedException();
        public IPlantillaTypeRepository PlantillaTypeRepository => throw new NotImplementedException();
        public IStepRepository StepRepository => throw new NotImplementedException();
        public IProcurementActivityTypeRepository ProcurementActivityTypeRepository => throw new NotImplementedException();
        public IProcurementCategoryRepository ProcurementCategoryRepository => throw new NotImplementedException();
        public IProcurementModeRepository ProcurementModeRepository => throw new NotImplementedException();
        public IProcurementModeThresholdRepository ProcurementModeThresholdRepository => throw new NotImplementedException();
        public IUOMRepository UOMRepository => throw new NotImplementedException();
        public IUNSPSCCodeRepository UNSPSCCodeRepository => throw new NotImplementedException();
        public IProcurementItemRepository ProcurementItemRepository => throw new NotImplementedException();
        public IUserRepository UserRepository => throw new NotImplementedException();
        public IPersonnelPositionRepository PersonnelPositionRepository => throw new NotImplementedException();
        public IPMTRepository PMTRepository => throw new NotImplementedException();
        public IPMTMemberRepository PMTMemberRepository => throw new NotImplementedException();
        public IFunctionConfigRepository FunctionConfigRepository => throw new NotImplementedException();
        public IProcurementPolicyConfigRepository ProcurementPolicyConfigRepository => throw new NotImplementedException();
        public IGeneralRatingScaleRepository GeneralRatingScaleRepository => throw new NotImplementedException();
        public IEconomicIndicatorRepository EconomicIndicatorRepository => throw new NotImplementedException();
        public IWorkflowMatrixRepository WorkflowMatrixRepository => throw new NotImplementedException();
        public IItemPriceRepository ItemPriceRepository => throw new NotImplementedException();
        public ISupplierRepository SupplierRepository => throw new NotImplementedException();
        public ISupplierRequirementRepository SupplierRequirementRepository => throw new NotImplementedException();
        public ISupplierCategoryRepository SupplierCategoryRepository => throw new NotImplementedException();
        public IKPIMeasurementRepository KPIMeasurementRepository => throw new NotImplementedException();
        public IFYActiveKPIRepository FYActiveKPIRepository => throw new NotImplementedException();
        public IFYActiveKPIMeasurementRepository FYActiveKPIMeasurementRepository => throw new NotImplementedException();
        public IKPIAssignmentRepository KPIAssignmentRepository => throw new NotImplementedException();
        public IRatingScaleTemplateRepository RatingScaleTemplateRepository => throw new NotImplementedException();
        public IRatingScaleLevelRepository RatingScaleLevelRepository => throw new NotImplementedException();
        public IPPMPRepository PPMPRepository => throw new NotImplementedException();
        public IApprovalEventRepository ApprovalEventRepository => throw new NotImplementedException();
        public IPPMPActivityRepository PPMPActivityRepository => throw new NotImplementedException();
        public IPPMPExpenditureItemRepository PPMPExpenditureItemRepository => throw new NotImplementedException();
        public IPPMPItemRepository PPMPItemRepository => throw new NotImplementedException();
        public IPPMPItemAllocationRepository PPMPItemAllocationRepository => throw new NotImplementedException();
        public IAPPPPMPRepository APPPPMPRepository => throw new NotImplementedException();
        public IAPPItemRepository APPItemRepository => throw new NotImplementedException();
        public IAPPItemScheduleRepository APPItemScheduleRepository => throw new NotImplementedException();
        public IItemRequestRepository ItemRequestRepository => throw new NotImplementedException();
        public INonCSEItemRepository NonCSEItemRepository => throw new NotImplementedException();
        public IOPCRItemRatingRepository OPCRItemRatingRepository => throw new NotImplementedException();
        public IOPCRItemMOVRepository OPCRItemMOVRepository => throw new NotImplementedException();
        public IGeneratedDocumentRepository GeneratedDocumentRepository => throw new NotImplementedException();
        public IOPCRConsolidationRepository OPCRConsolidationRepository => throw new NotImplementedException();
        public IBACResolutionRepository BACResolutionRepository => throw new NotImplementedException();
        public IBiddingActivityScheduleRepository BiddingActivityScheduleRepository => throw new NotImplementedException();
        public IMasterDocumentTypeRepository MasterDocumentTypeRepository => throw new NotImplementedException();
        public IDocumentProfileRepository DocumentProfileRepository => throw new NotImplementedException();
        public IDocumentProfileItemRepository DocumentProfileItemRepository => throw new NotImplementedException();
        public IProjectDocumentChecklistRepository ProjectDocumentChecklistRepository => throw new NotImplementedException();
        public IPurchaseRequestRepository PurchaseRequestRepository => throw new NotImplementedException();
        public IPRItemRepository PRItemRepository => throw new NotImplementedException();
        public IConsolidatedPRItemRepository ConsolidatedPRItemRepository => throw new NotImplementedException();
        public IConsolidatedPRRepository ConsolidatedPRRepository => throw new NotImplementedException();
        public ISupplierBidRepository SupplierBidRepository => throw new NotImplementedException();
        public ISupplierBidItemRepository SupplierBidItemRepository => throw new NotImplementedException();
        public IAOBRepository AOBRepository => throw new NotImplementedException();
        public IAOBAwardedItemRepository AOBAwardedItemRepository => throw new NotImplementedException();
        public IAOBProcurementProjectMappingRepository AOBProcurementProjectMappingRepository => throw new NotImplementedException();
        public IAPRItemRepository APRItemRepository => throw new NotImplementedException();
        public IAPRItemMilestoneRepository APRItemMilestoneRepository => throw new NotImplementedException();
    }

    private class StubAPPRepository : StubRepository<APP>, IAPPRepository
    {
        public StubAPPRepository(List<APP> items) : base(items) { }

        public Task<APP?> GetAPPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(app => app.Id == id));

        public Task<(IReadOnlyList<APP> Entities, int TotalCount)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByOfficeAsync<TDto>(Guid officeId, SieveModel sieveModel, Expression<Func<APP, TDto>> projection, CancellationToken cancellationToken = default) where TDto : class
            => throw new NotImplementedException();

        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByFiscalYearAsync<TDto>(Guid fiscalYearId, SieveModel sieveModel, Expression<Func<APP, TDto>> projection, CancellationToken cancellationToken = default) where TDto : class
            => throw new NotImplementedException();

        public Task<bool> HasAPPNumberAsync(string appNumber, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<bool> HasAPPNumberAsync(string appNumber, Guid excludeId, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
    }

    private class StubAPRRepository : StubRepository<APR>, IAPRRepository
    {
        public StubAPRRepository(List<APR> items) : base(items) { }

        public override Task AddAsync(APR entity, CancellationToken cancellationToken = default)
        {
            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            return base.AddAsync(entity, cancellationToken);
        }

        public Task<(IReadOnlyList<APR> Entities, int TotalCount)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<APR?> GetAPRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(apr => apr.Id == id));

        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPRsByOfficeAsync<TDto>(Guid officeId, SieveModel sieveModel, Expression<Func<APR, TDto>> projection, CancellationToken cancellationToken = default) where TDto : class
            => throw new NotImplementedException();

        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPRsByFiscalYearAsync<TDto>(Guid fiscalYearId, SieveModel sieveModel, Expression<Func<APR, TDto>> projection, CancellationToken cancellationToken = default) where TDto : class
            => throw new NotImplementedException();

        public Task<bool> HasAPRNumberAsync(string aprNumber, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(apr => apr.APRNumber == aprNumber && !apr.IsDeleted));

        public Task<bool> HasAPRNumberAsync(string aprNumber, Guid excludeId, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(apr => apr.APRNumber == aprNumber && apr.Id != excludeId && !apr.IsDeleted));

        public Task<int> CountDraftsForOfficeAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Count(apr => apr.FiscalYearId == fiscalYearId && apr.OfficeId == officeId && apr.Status == StatusEnum.Draft && !apr.IsDeleted));

        public Task<int> CountSubmittedForFiscalYearAsync(Guid fiscalYearId, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Count(apr => apr.FiscalYearId == fiscalYearId && apr.Status != StatusEnum.Draft && !apr.IsDeleted));
    }

    private class StubOfficeRepository : StubRepository<Office>, IOfficeRepository
    {
        public StubOfficeRepository(List<Office> items) : base(items) { }

        public Task<Office?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(office => office.Id == id));

        public Task<List<Office>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<(IEnumerable<Office>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
    }

    private class StubFiscalYearRepository : StubRepository<FiscalYear>, IFiscalYearRepository
    {
        public StubFiscalYearRepository(List<FiscalYear> items) : base(items) { }

        public Task<FiscalYear?> GetWithAllocationsAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(fiscalYear => fiscalYear.Id == id));

        public Task<FiscalYear?> GetByYearAsync(int year, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(fiscalYear => fiscalYear.Year == year));
    }

    private class StubRepository<T>(List<T> items) : IRepository<T> where T : BaseEntity
    {
        protected readonly List<T> items = items;

        public virtual Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(item => item.Id == id));

        public Task<T?> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
            => Task.FromResult(items.AsQueryable().FirstOrDefault(predicate));

        public virtual Task AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            items.Add(entity);
            return Task.CompletedTask;
        }

        public Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public IQueryable<T> Query(Expression<Func<T, bool>>? predicate = null, bool? ignoreQueryFilters = false)
        {
            var query = items.AsQueryable();
            if (predicate is not null)
                query = query.Where(predicate);

            return query;
        }

        public IQueryable<T> IgnoreQueryFilters() => Query();

        public Task<List<TResult>> ToListAsync<TResult>(IQueryable<TResult> query, CancellationToken cancellationToken = default)
            => Task.FromResult(query.ToList());

        public Task<TEntity?> GetSingleAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default)
            => Task.FromResult(query.SingleOrDefault());

        public Task<TEntity?> GetFirstAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default)
            => Task.FromResult(query.FirstOrDefault());

        public void Update(T entity)
        {
            var index = items.FindIndex(item => item.Id == entity.Id);
            if (index >= 0)
                items[index] = entity;
        }

        public void Remove(T entity, bool hardDelete = false)
            => throw new NotImplementedException();

        public Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllAsync<TDto>(SieveModel sieveModel, Expression<Func<T, TDto>> projection, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<decimal> SumAsync(Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<decimal> SumAsync(SieveModel sieveModel, Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<List<T>> FindAllAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
            => Task.FromResult(items.AsQueryable().Where(predicate).ToList());

        public Task<List<TDto>> GetListAsync<TDto>(IQueryable<TDto> query, CancellationToken cancellationToken = default)
            => Task.FromResult(query.ToList());

        public void RemoveRange(IEnumerable<T> entities)
            => throw new NotImplementedException();
    }
}
