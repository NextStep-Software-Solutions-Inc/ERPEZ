using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.CreateRFQ;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.SubmitRFQ;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.AddRFQItems;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.RemoveRFQItem;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ChangeRFQStatus;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using FluentAssertions;
using Sieve.Models;
using System.Linq.Expressions;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Procurement.RequestForQuotation.Commands;

public class RFQCommandHandlerTests
{
    [Fact]
    public async Task CreateRFQ_ShouldReturnFail_WhenRFQNumberAlreadyExists()
    {
        var unitOfWork = new StubUnitOfWork();
        unitOfWork.RFQs.Add(new RFQ { RFQNumber = "RFQ-001", TracingNumber = "TR-001" });

        var handler = new CreateRFQCommandHandler(unitOfWork);
        var command = new CreateRFQCommand("RFQ-001", "TR-002", "Desc", DateOnly.FromDateTime(DateTime.UtcNow), null, null, null, [Guid.NewGuid()]);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("RFQ Number already exists.");
    }

    [Fact]
    public async Task CreateRFQ_ShouldReturnFail_WhenTracingNumberAlreadyExists()
    {
        var unitOfWork = new StubUnitOfWork();
        unitOfWork.RFQs.Add(new RFQ { RFQNumber = "RFQ-001", TracingNumber = "TR-001" });

        var handler = new CreateRFQCommandHandler(unitOfWork);
        var command = new CreateRFQCommand("RFQ-002", "TR-001", "Desc", DateOnly.FromDateTime(DateTime.UtcNow), null, null, null, [Guid.NewGuid()]);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Tracing Number already exists.");
    }

    [Fact]
    public async Task SubmitRFQ_ShouldReturnFail_WhenRFQHasNoItems()
    {
        var unitOfWork = new StubUnitOfWork();
        var rfq = new RFQ { Id = Guid.NewGuid(), Status = StatusEnum.Draft, ModeOfProcurementId = Guid.NewGuid() };
        unitOfWork.RFQs.Add(rfq);

        var handler = new SubmitRFQCommandHandler(unitOfWork);
        var command = new SubmitRFQCommand(rfq.Id);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("RFQ must have at least one item before it can be submitted.");
    }

    [Fact]
    public async Task AddRFQItems_ShouldReturnFail_WhenRFQIsNotDraftOrReturned()
    {
        var unitOfWork = new StubUnitOfWork();
        var rfq = new RFQ { Id = Guid.NewGuid(), Status = StatusEnum.Submitted };
        unitOfWork.RFQs.Add(rfq);

        var handler = new AddRFQItemsCommandHandler(unitOfWork);
        var command = new AddRFQItemsCommand(rfq.Id, []);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Items can only be modified on Draft or Returned RFQs.");
    }

    [Fact]
    public async Task RemoveRFQItem_ShouldReturnFail_WhenRFQIsNotDraftOrReturned()
    {
        var unitOfWork = new StubUnitOfWork();
        var rfq = new RFQ { Id = Guid.NewGuid(), Status = StatusEnum.Approved };
        unitOfWork.RFQs.Add(rfq);

        var handler = new RemoveRFQItemCommandHandler(unitOfWork);
        var command = new RemoveRFQItemCommand(rfq.Id, Guid.NewGuid());

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Items can only be modified on Draft or Returned RFQs.");
    }

    [Fact]
    public async Task ChangeRFQStatus_ShouldPersistRemarks()
    {
        var unitOfWork = new StubUnitOfWork();
        var rfq = new RFQ { Id = Guid.NewGuid(), Status = StatusEnum.Submitted };
        unitOfWork.RFQs.Add(rfq);

        var handler = new ChangeRFQStatusCommandHandler(unitOfWork);
        var command = new ChangeRFQStatusCommand
        {
            RFQId = rfq.Id,
            Status = StatusEnum.Returned,
            Remarks = "Missing brochure specifications."
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        rfq.Status.Should().Be(StatusEnum.Returned);
        rfq.Remarks.Should().Be("Missing brochure specifications.");
    }

    private class StubUnitOfWork : IUnitOfWork
    {
        public List<RFQ> RFQs { get; } = [];
        public List<Supplier> Suppliers { get; } = [];

        public IRFQRepository RFQRepository => new StubRFQRepository(RFQs);
        public ISupplierRepository SupplierRepository => new StubSupplierRepository(Suppliers);

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => Task.FromResult(1);
        public Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default) => operation();

        // Implement non-needed stubs as throwing NotImplementedException
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
        public IOfficeRepository OfficeRepository => throw new NotImplementedException();
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
        public IFiscalYearRepository FiscalYearRepository => throw new NotImplementedException();
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
        public ISupplierCategoryRepository SupplierCategoryRepository => throw new NotImplementedException();
        public ISupplierRequirementRepository SupplierRequirementRepository => throw new NotImplementedException();
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
        public IAPPRepository APPRepository => throw new NotImplementedException();
        public IAPPPPMPRepository APPPPMPRepository => throw new NotImplementedException();
        public IAPPItemRepository APPItemRepository => throw new NotImplementedException();
        public IAPPItemScheduleRepository APPItemScheduleRepository => throw new NotImplementedException();
        public IItemRequestRepository ItemRequestRepository => throw new NotImplementedException();
        public INonCSEItemRepository NonCSEItemRepository => throw new NotImplementedException();
        public IOPCRItemRatingRepository OPCRItemRatingRepository => throw new NotImplementedException();
        public IOPCRItemMOVRepository OPCRItemMOVRepository => throw new NotImplementedException();
        public IGeneratedDocumentRepository GeneratedDocumentRepository => throw new NotImplementedException();
        public IOPCRConsolidationRepository OPCRConsolidationRepository => throw new NotImplementedException();
        public IProcurementProjectRepository ProcurementProjectRepository => throw new NotImplementedException();
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
        public IAPRRepository APRRepository => throw new NotImplementedException();
        public IAPRItemRepository APRItemRepository => throw new NotImplementedException();
        public IAPRItemMilestoneRepository APRItemMilestoneRepository => throw new NotImplementedException();
        public IDirectContractingRepository DirectContractingRepository => throw new NotImplementedException();
        public IDirectContractingProposalRepository DirectContractingProposalRepository => throw new NotImplementedException();
        public IDirectContractingProposalItemRepository DirectContractingProposalItemRepository => throw new NotImplementedException();
        public IPublicSupplierApplicationRepository PublicSupplierApplicationRepository => throw new NotImplementedException();
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
    }

    private class StubSupplierRepository(List<Supplier> items) : StubRepository<Supplier>(items), ISupplierRepository
    {
        public Task<List<Supplier>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Where(x => ids.Contains(x.Id)).ToList());
        public Task<Supplier?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(x => x.Id == id));
        public Task<List<Supplier>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(items.ToList());
        public Task<bool> TINNumberExistsAsync(string tinNumber, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(x => x.TINNumber == tinNumber && !x.IsDeleted));
        public Task<bool> BusinessPermitNumberExistsAsync(string businessPermitNo, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(x => x.BusinessPermitNo == businessPermitNo && !x.IsDeleted));
        public Task<bool> RegistrationNumberExistsAsync(string regNumber, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
        public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
        public Task<bool> ExistsByTINAsync(string tinNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(x => x.TINNumber == tinNumber && !x.IsDeleted && (!excludeId.HasValue || x.Id != excludeId.Value)));
        public Task<bool> ExistsByBusinessPermitAsync(string businessPermitNo, Guid? excludeId = null, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(x => x.BusinessPermitNo == businessPermitNo && !x.IsDeleted && (!excludeId.HasValue || x.Id != excludeId.Value)));
    }

    private class StubRFQRepository(List<RFQ> items) : StubRepository<RFQ>(items), IRFQRepository
    {
        public Task<(IReadOnlyList<RFQ> Entities, int TotalCount)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<RFQ?> GetRFQWithDetailsAsync(Guid rfqId, CancellationToken cancellationToken = default)
            => Task.FromResult(items.FirstOrDefault(x => x.Id == rfqId));

        public Task<bool> HasRFQNumberAsync(string rfqNumber, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(x => x.RFQNumber == rfqNumber && !x.IsDeleted));

        public Task<bool> HasTracingNumberAsync(string tracingNumber, CancellationToken cancellationToken = default)
            => Task.FromResult(items.Any(x => x.TracingNumber == tracingNumber && !x.IsDeleted));

        public Task<RFQItem?> GetItemByIdAsync(Guid rfqItemId, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<int> GetSourcedQuantityForCprItemAsync(Guid cprItemId, Guid? excludingRfqId = null, CancellationToken cancellationToken = default)
            => Task.FromResult(0);

        public Task<(int Total, int Draft, int Submitted, int Approved, int Returned)> GetSummaryAsync(CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public void RemoveItem(RFQItem item) { }

        public Task<Dictionary<Guid, int>> GetSourcedQuantitiesForCprItemsAsync(List<Guid> cprItemIds, Guid? excludingRfqId = null, CancellationToken cancellationToken = default)
            => Task.FromResult(new Dictionary<Guid, int>());
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
            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();
            items.Add(entity);
            return Task.CompletedTask;
        }

        public void Update(T entity)
        {
            var idx = items.FindIndex(x => x.Id == entity.Id);
            if (idx >= 0)
                items[idx] = entity;
        }

        public void Remove(T entity, bool hardDelete = false) => items.Remove(entity);

        public IQueryable<T> Query(Expression<Func<T, bool>>? predicate = null, bool? ignoreQueryFilters = false) => throw new NotImplementedException();
        public IQueryable<T> IgnoreQueryFilters() => throw new NotImplementedException();
        public Task<List<TResult>> ToListAsync<TResult>(IQueryable<TResult> query, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<TEntity?> GetSingleAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<TEntity?> GetFirstAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(SieveModel sieveModel, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllAsync<TDto>(SieveModel sieveModel, Expression<Func<T, TDto>> projection, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<decimal> SumAsync(Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<decimal> SumAsync(SieveModel sieveModel, Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<List<T>> FindAllAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<List<TDto>> GetListAsync<TDto>(IQueryable<TDto> query, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public void RemoveRange(IEnumerable<T> entities) => throw new NotImplementedException();
    }
}
