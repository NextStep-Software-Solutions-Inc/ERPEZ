using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
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

namespace ERPEZ.Infrastructure;

public static class DependencyInjection
{
    public static async Task<WebApplicationBuilder> AddInfrastructureServices(
        this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        var services = builder.Services;
        var env = builder.Environment;
        

        services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(connectionString);

                // Only ignore the PendingModelChangesWarning in development so we don't
                // hide pending model/migration mismatches in non-dev environments.
                if (env != null && env.IsDevelopment())
                {
                    options.ConfigureWarnings(w =>
                        w.Ignore(RelationalEventId.PendingModelChangesWarning));
                }
            });
        // Register repositories and Unit of Work
        services.AddScoped<IActivityBudgetRequirementRepository, ActivityBudgetRequirementRepository>();
        services.AddScoped<IDUAllocationRepository, DUAllocationRepository>();
        services.AddScoped<IOPCRRepository, OPCRRepository>();
        services.AddScoped<IOPCRKPIRepository, OPCRKPIRepository>();
        services.AddScoped<IOPCRActivityRepository, OPCRActivityRepository>();
        services.AddScoped<IOPCREvaluationRepository, OPCREvaluationRepository>();
        services.AddScoped<IOPCRPAPDepartmentRepository, OPCRPAPDepartmentRepository>();
        services.AddScoped<IOPCRRatingRepository, OPCRRatingRepository>();
        services.AddScoped<IObjectRepository, ObjectRepository>();
        services.AddScoped<IWFPRepository, WFPRepository>();
        services.AddScoped<IWFPPAPDepartmentRepository, WFPPAPDepartmentRepository>();
        services.AddScoped<IWFPObjectiveRepository, WFPObjectiveRepository>();
        services.AddScoped<IWFPActivityRepository, WFPActivityRepository>();
        services.AddScoped<IWFPOutcomeRepository, WFPOutcomeRepository>();
        services.AddScoped<IOPCRPAPDepartmentRepository, OPCRPAPDepartmentRepository>();
        services.AddScoped<IOPCREvaluationRepository, OPCREvaluationRepository>();
        services.AddScoped<IKPIRatingRepository, KPIRatingRepository>();
        services.AddScoped<IPerformanceMeasureRepository, PerformanceMeasureRepository>();
        services.AddScoped<IKPITargetRepository, KPITargetRepository>();
        services.AddScoped<IDUKPIAssignmentRepository, DUKPIAssignmentRepository>();
        services.AddScoped<IKPIModeOfVerificationRepository, KPIModeOfVerificationRepository>();
        services.AddScoped<IReceivedFundRepository, ReceivedFundRepository>();
        services.AddScoped<IMFOKPIRepository, MFOKPIRepository>();
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
        services.AddScoped<IDUFundAllocationRepository, DUFundAllocationRepository>();
        services.AddScoped<IClusterRepository, ClusterRepository>();
        services.AddScoped<IActivityBudgetRequirementRepository, ActivityBudgetRequirementRepository>();
        services.AddScoped<IWFPObjectiveTargetRepository, WFPObjectiveTargetRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

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
                await dbContext.Database.MigrateAsync();
            }
            catch (System.InvalidOperationException ex)
            {
                // EF Core throws when there are pending model changes (no matching migration).
                // Rather than crashing the app, log the issue and continue. This keeps
                // development workflows working while alerting the developer to add a
                // migration (run `dotnet ef migrations add <name>`).
                logger.LogError(ex, "Database migration failed; pending model changes detected. Add a migration before updating the database.");
            }
            catch (System.Exception ex)
            {
                // Log any unexpected exceptions and rethrow - migrations may be in an unrecoverable state
                logger.LogCritical(ex, "Unexpected error while applying migrations.");
                throw;
            }
        }
        return builder;
    }
}
