using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Shared.Services;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using ERPEZ.TenantManagement.Infrastructure.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Infrastructure;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddInfrastructureServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        var env = builder.Environment;

        services.AddHttpContextAccessor();
        services.AddMemoryCache();

        // Register current user and tenant context services
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<TenantRequestContext>();
        services.AddScoped<ITenantContextService>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantRequestContext>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantConnectionProvider, TenantConnectionProvider>();
        services.AddScoped<ITenantAccessService, TenantAccessService>();
        services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();
        services.AddScoped<IUserAuthorizationService, UserAuthorizationService>();
        services.AddSingleton<ISecretEncryptionService, AesGcmSecretEncryptionService>();
        services.AddScoped<ITenantDatabaseProvisioner, TenantDatabaseProvisioner>();
        services.AddScoped<AuditingInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<AuditingInterceptor>());

            if (env != null && env.IsDevelopment())
            {
                options.ConfigureWarnings(w =>
                    w.Ignore(RelationalEventId.PendingModelChangesWarning));
            }
        });

        // Register repositories and Unit of Work
        services.AddScoped<IBaseSeeder, ModuleSeeder>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<ITenantSettingRepository, TenantSettingRepository>();
        services.AddScoped<ITenantSubscriptionRepository, TenantSubscriptionRepository>();
        services.AddScoped<ITenantMemberRepository, TenantMemberRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<ILicenseKeyRepository, LicenseKeyRepository>();
        services.AddScoped<ITenantAuditRepository, TenantAuditRepository>();
        services.AddScoped<ITenantAuditService, TenantAuditService>();
        services.AddScoped<IRoleAssignmentValidator, RoleAssignmentValidator>();
        services.AddScoped<ILicenseService, LicenseService>();
        services.AddScoped<ITenantInvoiceRepository, TenantInvoiceRepository>();
        services.AddScoped<ITenantPaymentMethodRepository, TenantPaymentMethodRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Add Hangfire
        services.AddHangfire(config => config
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(connectionString)));

        services.AddHangfireServer();
        if (builder.Environment.IsDevelopment())
        {
            using var scope = services.BuildServiceProvider().CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var loggerFactory = scope.ServiceProvider.GetService<ILoggerFactory>();
            var logger = loggerFactory?.CreateLogger(nameof(DependencyInjection));

            try
            {
                dbContext.Database.Migrate();
            }
            catch (InvalidOperationException ex)
            {
                logger?.LogWarning(ex, "Database migration skipped due to pending model changes.");
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Database migration encountered an exception.");
            }

            var seeders = scope.ServiceProvider.GetServices<IBaseSeeder>();
            foreach (var seeder in seeders)
                seeder.SeedAsync().GetAwaiter().GetResult();

            // Run RBAC Seeders & Migration
            PermissionCatalogSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
            RoleSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
            TenantMemberMigrationSeeder.MigrateLegacyRolesAsync(dbContext).GetAwaiter().GetResult();
            DevTenantAndMemberSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
        }
        return builder;
    }
}
