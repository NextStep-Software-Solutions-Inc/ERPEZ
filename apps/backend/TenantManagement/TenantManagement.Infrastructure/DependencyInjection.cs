using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Shared.Services;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using ERPEZ.TenantManagement.Infrastructure.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ERPEZ.TenantManagement.Infrastructure;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddInfrastructureServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        services.AddHttpContextAccessor();
        services.AddMemoryCache();

        // Register current user and tenant context services
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<ITenantContextService, TenantContextService>();
        services.AddScoped<IUserAuthorizationService, UserAuthorizationService>();
        services.AddScoped<AuditingInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<AuditingInterceptor>());
        });

        // Register repositories and Unit of Work
        services.AddScoped<IBaseSeeder, ModuleSeeder>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<ITenantSettingRepository, TenantSettingRepository>();
        services.AddScoped<ITenantSubscriptionRepository, TenantSubscriptionRepository>();
        services.AddScoped<ITenantMemberRepository, TenantMemberRepository>();
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
            dbContext.Database.Migrate();

            var seeders = scope.ServiceProvider.GetServices<IBaseSeeder>();
            foreach (var seeder in seeders)
                seeder.SeedAsync().GetAwaiter().GetResult();

            // Run RBAC Seeders & Migration
            PermissionCatalogSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
            RoleSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
            TenantMemberMigrationSeeder.MigrateLegacyRolesAsync(dbContext).GetAwaiter().GetResult();
        }
        return builder;
    }
}
