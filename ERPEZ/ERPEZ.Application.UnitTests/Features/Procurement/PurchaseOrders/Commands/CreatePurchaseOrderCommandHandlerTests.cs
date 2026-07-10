using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Sieve.Models;
using System.Linq.Expressions;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Procurement.PurchaseOrders.Commands;

public class CreatePurchaseOrderCommandHandlerTests
{
    private readonly StubUnitOfWork unitOfWork;
    private readonly CreatePurchaseOrderCommandHandler handler;

    public CreatePurchaseOrderCommandHandlerTests()
    {
        unitOfWork = new StubUnitOfWork();
        handler = new CreatePurchaseOrderCommandHandler(unitOfWork);
    }

    [Fact]
    public async Task Handle_ShouldSuccessfullyCreatePurchaseOrder_AndCalculateAmountsServerSide()
    {
        // Arrange
        var command = new CreatePurchaseOrderCommand
        {
            PONumber = "PO-2026-0001",
            ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING,
            SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION,
            SourceDocumentId = Guid.NewGuid(),
            SupplierId = Guid.NewGuid(),
            Description = "Test Purchase Order",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Items = new List<CreatePurchaseOrderItemDto>
            {
                new()
                {
                    SourceItemId = Guid.NewGuid(),
                    Description = "Item 1",
                    Quantity = 5,
                    UnitPrice = 150.00m,
                    Unit = "pcs"
                },
                new()
                {
                    SourceItemId = Guid.NewGuid(),
                    Description = "Item 2",
                    Quantity = 2,
                    UnitPrice = 250.50m,
                    Unit = "boxes"
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        unitOfWork.PurchaseOrders.Should().HaveCount(1);
        
        var createdPo = unitOfWork.PurchaseOrders.Single();
        createdPo.PONumber.Should().Be(command.PONumber);
        createdPo.Description.Should().Be(command.Description);
        
        // Item 1 Amount: 5 * 150 = 750
        // Item 2 Amount: 2 * 250.50 = 501
        // TotalAmount: 750 + 501 = 1251
        createdPo.PurchaseOrderItems.Should().HaveCount(2);
        
        var item1 = createdPo.PurchaseOrderItems.ElementAt(0);
        item1.Description.Should().Be("Item 1");
        item1.Amount.Should().Be(750.00m);

        var item2 = createdPo.PurchaseOrderItems.ElementAt(1);
        item2.Description.Should().Be("Item 2");
        item2.Amount.Should().Be(501.00m);

        createdPo.TotalAmount.Should().Be(1251.00m);
        unitOfWork.SavedChangesCount.Should().Be(1);
    }

    private class StubUnitOfWork : IUnitOfWork
    {
        public List<PurchaseOrder> PurchaseOrders { get; } = new();
        public int SavedChangesCount { get; private set; }

        public IPurchaseOrderRepository PurchaseOrderRepository => new StubPurchaseOrderRepository(PurchaseOrders);
        public IPurchaseOrderItemRepository PurchaseOrderItemRepository => throw new NotImplementedException();

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
        public IRatingScaleLevelRepository IRatingScaleLevelRepository => throw new NotImplementedException();
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
        public IDirectContractingRepository DirectContractingRepository => throw new NotImplementedException();
        public IDirectContractingProposalRepository DirectContractingProposalRepository => throw new NotImplementedException();
        public IDirectContractingProposalItemRepository DirectContractingProposalItemRepository => throw new NotImplementedException();
        public IPublicSupplierApplicationRepository PublicSupplierApplicationRepository => throw new NotImplementedException();
        public IAPRRepository APRRepository => throw new NotImplementedException();
        public IAPRItemRepository APRItemRepository => throw new NotImplementedException();
        public IAPRItemMilestoneRepository APRItemMilestoneRepository => throw new NotImplementedException();
        public IRFQRepository RFQRepository => throw new NotImplementedException();
    }

    private class StubPurchaseOrderRepository : StubRepository<PurchaseOrder>, IPurchaseOrderRepository
    {
        public StubPurchaseOrderRepository(List<PurchaseOrder> items) : base(items) { }
    }

    private class StubRepository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly List<T> items;

        public StubRepository(List<T> items)
        {
            this.items = items;
        }

        public Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(items.FirstOrDefault(x => x.Id == id));
        }

        public Task<T?> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(items.AsQueryable().FirstOrDefault(predicate));
        }

        public void Update(T entity)
        {
            var index = items.FindIndex(x => x.Id == entity.Id);
            if (index >= 0)
            {
                items[index] = entity;
            }
        }

        public Task AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            items.Add(entity);
            return Task.CompletedTask;
        }

        public IQueryable<T> Query(Expression<Func<T, bool>>? predicate = null, bool? ignoreQueryFilters = false)
        {
            var query = items.AsQueryable();
            if (predicate != null) query = query.Where(predicate);
            return query;
        }

        public IQueryable<T> IgnoreQueryFilters() => Query();
        public Task<List<TResult>> ToListAsync<TResult>(IQueryable<TResult> query, CancellationToken cancellationToken = default) => Task.FromResult(query.ToList());
        public Task<TEntity?> GetSingleAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default) => Task.FromResult(query.SingleOrDefault());
        public Task<TEntity?> GetFirstAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default) => Task.FromResult(query.FirstOrDefault());
        public Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public void Remove(T entity, bool hardDelete = false) => throw new NotImplementedException();
        public Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(SieveModel sieveModel, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllAsync<TDto>(SieveModel sieveModel, Expression<Func<T, TDto>> projection, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<decimal> SumAsync(Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<decimal> SumAsync(SieveModel sieveModel, Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<List<T>> FindAllAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) => Task.FromResult(items.AsQueryable().Where(predicate).ToList());
        public Task<List<TDto>> GetListAsync<TDto>(IQueryable<TDto> query, CancellationToken cancellationToken = default) => Task.FromResult(query.ToList());
        public void RemoveRange(IEnumerable<T> entities) => throw new NotImplementedException();
    }
}
