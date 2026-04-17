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
using Npgsql;
using ERPEZ.Shared.Interceptors;
using AppCurrentUserService = ERPEZ.Application.Interfaces.ICurrentUserService;
using InfraCurrentUserService = ERPEZ.Infrastructure.Services.CurrentUserService;
using SharedCurrentUserService = ERPEZ.Shared.Interfaces.ICurrentUserService;
using SharedCurrentUserServiceImpl = ERPEZ.Shared.Services.CurrentUserService;

namespace ERPEZ.Infrastructure;

public static class DependencyInjection
{
    public static async Task<WebApplicationBuilder> AddInfrastructureServices(
        this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        var services = builder.Services;
        var env = builder.Environment;

        services.Configure<AzureBlobStorageOptions>(options =>
        {
            builder.Configuration.GetSection("AzureBlobStorage").Bind(options);
            // Override ConnectionString from environment variable if available
            var envConnectionString = builder.Configuration["AzureBlobStorage:ConnectionString"];
            if (!string.IsNullOrEmpty(envConnectionString))
            {
                options.ConnectionString = envConnectionString;
            }
        });
        services.AddScoped<AppCurrentUserService, InfraCurrentUserService>();
        services.AddScoped<SharedCurrentUserService, SharedCurrentUserServiceImpl>();
        services.AddScoped<AuditingInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<AuditingInterceptor>());

            // Only ignore the PendingModelChangesWarning in development so we don't
            // hide pending model/migration mismatches in non-dev environments.
            if (env != null && env.IsDevelopment())
            {
                options.ConfigureWarnings(w =>
                    w.Ignore(RelationalEventId.PendingModelChangesWarning));
            }
        });
        services.AddHttpContextAccessor();

        // Register repositories and Unit of Work
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
        services.AddScoped<IOPCRPAPDepartmentRepository, OPCRPAPDepartmentRepository>();
        services.AddScoped<IOPCREvaluationRepository, OPCREvaluationRepository>();
        services.AddScoped<IRatingRepository, RatingRepository>();
        services.AddScoped<IPerformanceMeasureRepository, PerformanceMeasureRepository>();
        services.AddScoped<IKPITargetRepository, KPITargetRepository>();
        services.AddScoped<IDUKPITargetAssignmentRepository, DUKPITargetAssignmentRepository>();
        services.AddScoped<IKPIModeOfVerificationRepository, KPIModeOfVerificationRepository>();
        services.AddScoped<IKPIRepository, KPIRepository>();
        services.AddScoped<IOfficeRepository, OfficeRepository>();
        services.AddScoped<IDeliveryUnitRepository, DeliveryUnitRepository>();
        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IObjectRepository, ObjectRepository>();
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
        services.AddScoped<IItemRequestRepository, ItemRequestRepository>();
        services.AddScoped<INonCSEItemRepository, NonCSEItemRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IFileStorageService, AzureBlobStorageService>();
        services.AddScoped<IUACSCsvImporter, UACSImportService>();
        services.AddScoped<IUACSValidationEngine, UACSValidationEngine>();
        services.AddScoped<IPositionImportService, PositionImportService>();
        services.AddHostedService<TempFileCleanupService>();

        // Add Hangfire
        services.AddHangfire(config => config
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(connectionString)));

        services.AddHangfireServer();

        if (env != null && env.IsDevelopment())
        {
            using var scope = services.BuildServiceProvider().CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger(nameof(DependencyInjection));

            try
            {
                await EnsurePapCodeTextArrayAsync(dbContext);
                await dbContext.Database.MigrateAsync();
            }
            catch (PostgresException ex) when (ex.SqlState == "42804")
            {
                // Recover from legacy text -> text[] conversion issues for PPMPItems.PAPCode,
                // then retry migrations once.
                logger.LogWarning(ex, "Detected PostgreSQL cast issue for PAPCode. Applying compatibility fix and retrying migrations.");
                await EnsurePapCodeTextArrayAsync(dbContext);
                await dbContext.Database.MigrateAsync();
            }
            catch (InvalidOperationException ex)
            {
                // EF Core throws when there are pending model changes (no matching migration).
                // Rather than crashing the app, log the issue and continue. This keeps
                // development workflows working while alerting the developer to add a
                // migration (run `dotnet ef migrations add <name>`).
                logger.LogError(ex, "Database migration failed; pending model changes detected. Add a migration before updating the database.");
            }
            catch (Exception ex)
            {
                // Log any unexpected exceptions and rethrow - migrations may be in an unrecoverable state
                logger.LogCritical(ex, "Unexpected error while applying migrations.");
                throw;
            }
        }
        return builder;
    }

    private static async Task EnsurePapCodeTextArrayAsync(ApplicationDbContext dbContext)
    {
        const string sql = @"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'planning'
          AND table_name = 'PPMPItems'
          AND column_name = 'PAPCode'
          AND data_type = 'text'
    ) THEN
        EXECUTE 'ALTER TABLE planning.""PPMPItems"" 
                 ALTER COLUMN ""PAPCode"" TYPE text[]
                 USING CASE
                     WHEN ""PAPCode"" IS NULL OR btrim(""PAPCode"") = '''' THEN ARRAY[]::text[]
                     ELSE ARRAY[""PAPCode""]
                 END';
    END IF;
END $$;
";

        await dbContext.Database.ExecuteSqlRawAsync(sql);
    }
}
