using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Interceptors;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using ERPEZ.TenantManagement.Infrastructure.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ERPEZ.TenantManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment env)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddHttpContextAccessor();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<SoftDeleteInterceptor>());
        });

        // Current user service backed by IHttpContextAccessor
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<SoftDeleteInterceptor>();

        // Register repositories and Unit of Work
        services.AddScoped<IBaseSeeder, ModuleSeeder>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<ITenantSettingRepository, TenantSettingRepository>();
        services.AddScoped<ITenantSubscriptionRepository, TenantSubscriptionRepository>();
        services.AddScoped<ITenantMemberRepository, TenantMemberRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddHttpContextAccessor();

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

            var seeders = scope.ServiceProvider.GetServices<IBaseSeeder>();
            foreach (var seeder in seeders)
                seeder.SeedAsync().GetAwaiter().GetResult();
        }
      
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins(
                    "http://localhost:5173",
                    "https://your-frontend-domain.com"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
        });
        return services;
    }
}