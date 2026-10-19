using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Shared.Security;
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

        // Authoritative encryption configuration validation during host startup
        using (var loggerFactory = LoggerFactory.Create(b => b.AddConfiguration(builder.Configuration.GetSection("Logging"))))
        {
            var startupLogger = loggerFactory.CreateLogger(nameof(EncryptionConfigurationValidator));
            EncryptionConfigurationValidator.Validate(builder.Configuration, builder.Environment, startupLogger);
        }

        services.AddHttpContextAccessor();
        services.AddMemoryCache();

        // Register current user and tenant context services
        services.Configure<ERPEZ.Shared.Configuration.TenantRoutingOptions>(
            builder.Configuration.GetSection(ERPEZ.Shared.Configuration.TenantRoutingOptions.sectionName));

        services.AddSingleton<IApiHostValidator>(sp =>
            new ApiHostValidator(
                sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ERPEZ.Shared.Configuration.TenantRoutingOptions>>(),
                sp.GetService<Microsoft.Extensions.Hosting.IHostEnvironment>()));
        services.AddSingleton<IClientOriginParser, ClientOriginParser>();
        services.AddSingleton<IClientOriginMatcher, ClientOriginMatcher>();

        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<TenantRequestContext>();
        services.AddScoped<ITenantContextService>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantRequestContext>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantConnectionProvider, TenantConnectionProvider>();
        services.AddScoped<ITenantAccessService, TenantAccessService>();
        services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();
        services.AddScoped<ITenantBackgroundScopeActivator, TenantBackgroundScopeActivator>();
        services.AddSingleton<ITenantScopeFactory, TenantScopeFactory>();
        services.AddScoped<IUserAuthorizationService, UserAuthorizationService>();
        services.AddSingleton<ERPEZ.Shared.Interfaces.IExternalIdentityNormalizer, ERPEZ.Shared.Security.ClerkIdentityNormalizer>();
        services.AddSingleton<ERPEZ.Shared.Interfaces.IExternalIdentityNormalizer, ERPEZ.Shared.Security.KeycloakIdentityNormalizer>();
        services.AddSingleton<ERPEZ.Shared.Security.IExternalIdentityNormalizerResolver, ERPEZ.Shared.Security.ExternalIdentityNormalizerResolver>();
        services.AddScoped<IExternalTenantResolver, ExternalTenantResolver>();
        services.AddHttpClient<IClerkMembershipReader, ClerkMembershipReader>();
        services.AddHttpClient<IClerkInvitationService, ClerkInvitationService>();
        services.AddScoped<IWebhookInboxService, WebhookInboxService>();
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
            RoleSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
            TenantMemberMigrationSeeder.MigrateLegacyRolesAsync(dbContext).GetAwaiter().GetResult();
            DevTenantAndMemberSeeder.SeedAsync(dbContext).GetAwaiter().GetResult();
        }
        return builder;
    }
}
