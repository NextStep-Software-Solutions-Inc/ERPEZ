using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Repositories;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using ERPEZ.Infrastructure.Services.Renderers.Excel;
using ERPEZ.Infrastructure.Services.DocumentGeneration.Storage;
using SharedCurrentUserService     = ERPEZ.Shared.Interfaces.ICurrentUserService;
using SharedCurrentUserServiceImpl = ERPEZ.Shared.Services.CurrentUserService;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Infrastructure.Services.DocumentGeneration.Renderers.Excel;

namespace ERPEZ.Infrastructure;

public static class DependencyInjection
{
    public static async Task<WebApplicationBuilder> AddInfrastructureServices(
        this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        var services = builder.Services;
        var env      = builder.Environment;

        // ── Current User ────────────────────────────────────────────────────────────
        // Fully qualified — avoids the alias collision that caused CS0246/CS0311
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<SharedCurrentUserService, SharedCurrentUserServiceImpl>();
        services.AddScoped<AuditingInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public"));
            options.AddInterceptors(sp.GetRequiredService<AuditingInterceptor>());

            options.ConfigureWarnings(w =>
                w.Ignore(RelationalEventId.PendingModelChangesWarning));
        });

        services.AddHttpContextAccessor();

        // ── Repositories ────────────────────────────────────────────────────────────
        services.AddScoped<IOPCRRepository, OPCRRepository>();
        services.AddScoped<IOPCRItemRepository, OPCRItemRepository>();
        services.AddScoped<IOPCRActivityRepository, OPCRActivityRepository>();
        services.AddScoped<IOPCREvaluationRepository, OPCREvaluationRepository>();
        services.AddScoped<IOPCRPAPDepartmentRepository, OPCRPAPDepartmentRepository>();
        services.AddScoped<IOPCRRatingRepository, OPCRRatingRepository>();
        services.AddScoped<IObjectRepository, ObjectRepository>();
        services.AddScoped<IWFPRepository, WFPRepository>();
        services.AddScoped<IWFPPAPDepartmentRepository, WFPPAPDepartmentRepository>();
        services.AddScoped<IWFPObjectiveRepository, WFPObjectiveRepository>();
        services.AddScoped<IRatingRepository, RatingRepository>();
        services.AddScoped<IPerformanceMeasureRepository, PerformanceMeasureRepository>();
        services.AddScoped<IKPITargetRepository, KPITargetRepository>();
        services.AddScoped<IDUKPITargetAssignmentRepository, DUKPITargetAssignmentRepository>();
        services.AddScoped<IKPIModeOfVerificationRepository, KPIModeOfVerificationRepository>();
        services.AddScoped<IKPIRepository, KPIRepository>();
        services.AddScoped<IOfficeRepository, OfficeRepository>();
        services.AddScoped<IDeliveryUnitRepository, DeliveryUnitRepository>();
        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IFundSourceRepository, FundSourceRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IMFOPAPRepository, MFOPAPRepository>();
        services.AddScoped<IFunctionAllocationRepository, FunctionAllocationRepository>();
        services.AddScoped<IFiscalYearRepository, FiscalYearRepository>();
        services.AddScoped<IFiscalMonthRepository, FiscalMonthRepository>();
        services.AddScoped<IBudgetCallRepository, BudgetCallRepository>();
        services.AddScoped<IAgencyMasterBudgetRepository, AgencyMasterBudgetRepository>();
        services.AddScoped<IOfficeCeilingRepository, OfficeCeilingRepository>();
        services.AddScoped<ISubOfficeCeilingRepository, SubOfficeCeilingRepository>();
        services.AddScoped<ILineItemBudgetRepository, LineItemBudgetRepository>();
        services.AddScoped<ILineItemBudgetActivityRepository, LineItemBudgetActivityRepository>();
        services.AddScoped<ILineItemBudgetDetailRepository, LineItemBudgetDetailRepository>();
        services.AddScoped<ILIBAmendmentRequestRepository, LIBAmendmentRequestRepository>();
        services.AddScoped<IClusterRepository, ClusterRepository>();
        services.AddScoped<IWFPObjectiveActivityExpenditureRepository, WFPObjectiveActivityExpenditureRepository>();
        services.AddScoped<IWFPObjectiveActivityRepository, WFPObjectiveActivityRepository>();
        services.AddScoped<IWFPObjectiveTimelineRepository, WFPObjectiveTimelineRepository>();
        services.AddScoped<IAttributeRepository, AttributeRepository>();
        services.AddScoped<IWorkflowMatrixRepository, WorkflowMatrixRepository>();
        services.AddScoped<IPPMPRepository, PPMPRepository>();
        services.AddScoped<IApprovalEventRepository, ApprovalEventRepository>();
        services.AddScoped<IPPMPActivityRepository, PPMPActivityRepository>();
        services.AddScoped<IPPMPExpenditureItemRepository, PPMPExpenditureItemRepository>();
        services.AddScoped<IPPMPItemRepository, PPMPItemRepository>();
        services.AddScoped<IPPMPItemAllocationRepository, PPMPItemAllocationRepository>();
        services.AddScoped<IAPPItemRepository, APPItemRepository>();
        services.AddScoped<IAPPItemScheduleRepository, APPItemScheduleRepository>();
        services.AddScoped<IAPRRepository, APRRepository>();
        services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        services.AddScoped<IAPRItemRepository, APRItemRepository>();
        services.AddScoped<IAPRItemMilestoneRepository, APRItemMilestoneRepository>();
        services.AddScoped<IItemRequestRepository, ItemRequestRepository>();
        services.AddScoped<INonCSEItemRepository, NonCSEItemRepository>();
        services.AddScoped<IOPCRItemRatingRepository, OPCRItemRatingRepository>();
        services.AddScoped<IOPCRItemMOVRepository, OPCRItemMOVRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IRFQRepository, RFQRepository>();
        services.AddScoped<INoticeOfAwardRepository, NoticeOfAwardRepository>();
        services.AddScoped<INoticeOfAwardMilestoneRepository, NoticeOfAwardMilestoneRepository>();
        services.AddScoped<INoticeOfAwardActivityRepository, NoticeOfAwardActivityRepository>();

        // ── Other Services ──────────────────────────────────────────────────────────
        services.AddScoped<IFileStorageService, AzureBlobStorageService>();
        services.AddScoped<IPhilGepsService, PhilGepsService>();
        services.AddScoped<IPsdbmSyncService, PsdbmSyncService>();
        services.AddScoped<IPsdbmQueryService, PsdbmQueryService>();
        services.AddScoped<IUACSCsvImporter, UACSImportService>();
        services.AddScoped<IFundSourceExcelImporter, FundSourceExcelImporter>();
        services.AddScoped<IUACSValidationEngine, UACSValidationEngine>();
        services.AddScoped<IPositionImportService, PositionImportService>();
        services.AddHostedService<TempFileCleanupService>();

        // ── Document Generation ─────────────────────────────────────────────────────
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

        services.AddScoped<IDocumentRendererService, DocumentRendererService>();
        services.AddScoped<IDocumentStorageService, LocalFileDocumentStorage>();

        // PPMP — PDF and Excel
        services.AddScoped<IDocumentRenderer<PpmpDataDto>, PpmpPdfRenderer>();
        services.AddScoped<IDocumentRenderer<PpmpDataDto>, PpmpExcelRenderer>();

        // APP — PDF and Excel
        services.AddScoped<IDocumentRenderer<AppDataDto>, AppPdfRenderer>();
        services.AddScoped<IDocumentRenderer<AppDataDto>, AppExcelRenderer>();

        services.AddScoped<IDocumentRenderer<OpcrDataDto>,  OpcrPdfRenderer>();        // ✅ Proposed
        services.AddScoped<IDocumentRenderer<OpcrDataDto>,  OpcrRatingPdfRenderer>();  // ✅ With Ratings

        // LIB — PDF and Excel
        services.AddScoped<IDocumentRenderer<LibDataDto>, LibPdfRenderer>();
        services.AddScoped<IDocumentRenderer<LibDataDto>, LibExcelRenderer>();
        
        // WFP — PDF and Excel
        services.AddScoped<IDocumentRenderer<WfpDataDto>, WfpPdfRenderer>();
        services.AddScoped<IDocumentRenderer<WfpDataDto>, WfpExcelRenderer>();

        services.AddScoped<IDocumentRenderer<ConsolidatedOpcrDataDto>,  ConsolidatedOpcrPdfRenderer>(); // ✅ Add

        services.AddScoped<IDocumentRenderer<MarketScopingDataDto>, MarketScopingPdfRenderer>();

        // Budget Modification — PDF
        services.AddScoped<IDocumentRenderer<ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIBAmendment.LibAmendmentDataDto>, LibAmendmentPdfRenderer>();

        // BAC Resolution — PDF
        services.AddScoped<IDocumentRenderer<ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument.BacResolutionDataDto>, BacResolutionPdfRenderer>();

        // Purchase Request — PDF
        services.AddScoped<IDocumentRenderer<PurchaseRequestDataDto>, PurchaseRequestPdfRenderer>();

        // APR — PDF
        services.AddScoped<IDocumentRenderer<AprDataDto>, AprPdfRenderer>();

        // ── Hangfire ────────────────────────────────────────────────────────────────
        services.AddHangfire(config => config
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(connectionString)));

        services.AddHangfireServer();

        // ── Migrations (dev only) ───────────────────────────────────────────────────
        if (env != null && env.IsDevelopment())
        {
            using var scope      = services.BuildServiceProvider().CreateScope();
            var dbContext        = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var loggerFactory    = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
            var logger           = loggerFactory.CreateLogger(nameof(DependencyInjection));

            try
            {
                await dbContext.Database.ExecuteSqlRawAsync(
                    "CREATE SCHEMA IF NOT EXISTS public; " +
                    "CREATE SCHEMA IF NOT EXISTS planning; " +
                    "CREATE SCHEMA IF NOT EXISTS procurement;");
                await dbContext.Database.MigrateAsync();

                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                await ERPEZ.Infrastructure.Persistence.Seeders.ProcurementActivityTypeSeeder.SeedAsync(unitOfWork);
                await ERPEZ.Infrastructure.Persistence.Seeders.PublicHolidaySeeder.SeedAsync(unitOfWork);
                await ERPEZ.Infrastructure.Persistence.Seeders.ItemCategorySeeder.SeedAsync(dbContext);
                await ERPEZ.Infrastructure.Persistence.Seeders.FundSourceSeeder.SeedAsync(dbContext); 
                await ERPEZ.Infrastructure.Persistence.Seeders.OrganizationStructureSeeder.SeedAsync(dbContext);
            }
            catch (InvalidOperationException ex)
            {
                logger.LogWarning(ex,
                    "Database migration failed; pending model changes detected. " +
                    "Add a migration before updating the database.");
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState == "42P07" || ex.SqlState == "42710" || ex.SqlState == "42701")
            {
                logger.LogWarning(ex,
                    "Database object already exists on remote database ({SqlState}). Skipping migration step.", ex.SqlState);
            }
            catch (Exception ex)
            {
                logger.LogCritical(ex, "Unexpected error while applying migrations.");
                throw;
            }
        }

        return builder;
    }
}
