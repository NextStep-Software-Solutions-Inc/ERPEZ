using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Repositories;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ERPEZ.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment? env = null)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));
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
        services.AddScoped<IKPIAssignmentRepository, KPIAssignmentRepository>();
        services.AddScoped<IKPIModeOfVerificationRepository, KPIModeOfVerificationRepository>();
        services.AddScoped<IReceivedFundRepository, ReceivedFundRepository>();
        services.AddScoped<IMFOKPIRepository, MFOKPIRepository>();
        services.AddScoped<IKPIRepository, KPIRepository>();
        services.AddScoped<IOfficeRepository, OfficeRepository>();
        services.AddScoped<IDeliveryUnitRepository, DeliveryUnitRepository>();
        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IFundSourceRepository, FundSourceRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IMFOPAPRepository, MFOPAPRepository>();
        services.AddScoped<IFunctionPercentageAllocationRepository, FunctionPercentageAllocationRepository>();
        services.AddScoped<IDUFundAllocationRepository, DUFundAllocationRepository>();
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
            dbContext.Database.Migrate();
        }
        return services;
    }
}