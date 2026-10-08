using System.Reflection;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Services;
using FluentAssertions;
using Hangfire;
using Hangfire.Common;
using Hangfire.Server;
using Hangfire.States;
using Hangfire.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.MultiTenancy;

public class BackgroundJobTenantPropagationTests
{
    private readonly Mock<ITenantConnectionResolver> mockConnectionResolver = new();
    private readonly TenantRequestContext requestContext = new();
    private readonly IConfiguration configuration;

    public BackgroundJobTenantPropagationTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] = "Host=shared-pg;Database=erpez_shared;Username=postgres;Password=secret",
            ["ConnectionStrings:OperationalConnection"] = "Host=shared-pg;Database=erpez_shared;Username=postgres;Password=secret"
        };
        configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    [Fact]
    public async Task ActivateTenantAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        // Arrange
        var activator = new TenantBackgroundScopeActivator(
            mockConnectionResolver.Object,
            requestContext,
            configuration);

        // Act & Assert
        var act = async () => await activator.ActivateTenantAsync(Guid.Empty);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Tenant ID cannot be empty*");
    }

    [Fact]
    public async Task ActivateTenantAsync_WithValidTenant_ResolvesConnectionAndInitializesContext()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var connStr = "Host=shared-pg;Database=erpez_shared;Username=postgres;Password=secret";
        mockConnectionResolver
            .Setup(r => r.ResolveConnectionInfoAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantDatabaseConnectionInfo(tenantId, connStr, TenancyMode.SaaS));

        var activator = new TenantBackgroundScopeActivator(
            mockConnectionResolver.Object,
            requestContext,
            configuration);

        // Act
        await activator.ActivateTenantAsync(tenantId);

        // Assert
        requestContext.IsResolved.Should().BeTrue();
        requestContext.TenantId.Should().Be(tenantId);
        requestContext.ConnectionInfo.Should().NotBeNull();
        requestContext.ConnectionInfo!.ConnectionString.Should().Be(connStr);
        requestContext.ConnectionInfo.TenancyMode.Should().Be(TenancyMode.SaaS);
    }

    [Fact]
    public async Task ActivateTenantAsync_WhenConnectionFails_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        mockConnectionResolver
            .Setup(r => r.ResolveConnectionInfoAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantDatabaseConnectionInfo?)null);

        var activator = new TenantBackgroundScopeActivator(
            mockConnectionResolver.Object,
            requestContext,
            configuration);

        // Act & Assert
        var act = async () => await activator.ActivateTenantAsync(tenantId);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"*Could not resolve operational database connection for tenant '{tenantId}'*");
    }

    [Fact]
    public async Task ActivateGlobalAsync_InitializesGlobalSystemContext()
    {
        // Arrange
        var activator = new TenantBackgroundScopeActivator(
            mockConnectionResolver.Object,
            requestContext,
            configuration);

        // Act
        await activator.ActivateGlobalAsync();

        // Assert
        requestContext.IsResolved.Should().BeTrue();
        requestContext.TenantId.Should().Be(Guid.Empty);
        requestContext.ConnectionInfo.Should().NotBeNull();
        requestContext.ConnectionInfo!.ConnectionString.Should().Be("Host=shared-pg;Database=erpez_shared;Username=postgres;Password=secret");
        requestContext.ConnectionInfo.TenancyMode.Should().Be(TenancyMode.SaaS);
    }

    [Fact]
    public async Task TenantScopeFactory_CreateTenantScopeAsync_ResolvesConfiguredScope()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var connStr = "Host=tenant-pg;Database=erpez_tenant;Username=postgres;Password=secret";
        mockConnectionResolver
            .Setup(r => r.ResolveConnectionInfoAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantDatabaseConnectionInfo(tenantId, connStr, TenancyMode.OnPremise));

        var services = new ServiceCollection();
        services.AddSingleton(configuration);
        services.AddSingleton(mockConnectionResolver.Object);
        services.AddScoped<TenantRequestContext>();
        services.AddScoped<ITenantRequestContext>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantBackgroundScopeActivator, TenantBackgroundScopeActivator>();
        services.AddSingleton<ITenantScopeFactory, TenantScopeFactory>();

        var provider = services.BuildServiceProvider();
        var factory = provider.GetRequiredService<ITenantScopeFactory>();

        // Act
        await using var scope = await factory.CreateTenantScopeAsync(tenantId);
        var scopedContext = scope.ServiceProvider.GetRequiredService<ITenantRequestContext>();

        // Assert
        scopedContext.IsResolved.Should().BeTrue();
        scopedContext.TenantId.Should().Be(tenantId);
        scopedContext.ConnectionInfo!.ConnectionString.Should().Be(connStr);
        scopedContext.ConnectionInfo.TenancyMode.Should().Be(TenancyMode.OnPremise);
    }

    [Fact]
    public async Task TenantScopeFactory_CreateGlobalScopeAsync_ResolvesGlobalScope()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddSingleton(configuration);
        services.AddSingleton(mockConnectionResolver.Object);
        services.AddScoped<TenantRequestContext>();
        services.AddScoped<ITenantRequestContext>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantBackgroundScopeActivator, TenantBackgroundScopeActivator>();
        services.AddSingleton<ITenantScopeFactory, TenantScopeFactory>();

        var provider = services.BuildServiceProvider();
        var factory = provider.GetRequiredService<ITenantScopeFactory>();

        // Act
        await using var scope = await factory.CreateGlobalScopeAsync();
        var scopedContext = scope.ServiceProvider.GetRequiredService<ITenantRequestContext>();

        // Assert
        scopedContext.IsResolved.Should().BeTrue();
        scopedContext.TenantId.Should().Be(Guid.Empty);
        scopedContext.ConnectionInfo!.ConnectionString.Should().Be("Host=shared-pg;Database=erpez_shared;Username=postgres;Password=secret");
    }

    public class SampleTenantJob
    {
        public void ProcessForTenant(Guid tenantId, string data) { }
        public void ProcessGlobal() { }
    }

    private class TestJobActivatorScope(IServiceProvider serviceProvider) : JobActivatorScope
    {
        public override object Resolve(Type type) => serviceProvider.GetRequiredService(type);
    }

    [Fact]
    public void HangfireTenantJobFilter_WhenJobHasTenantIdArgument_ActivatesTenant()
    {
        // Arrange
        var targetTenantId = Guid.NewGuid();
        var mockActivator = new Mock<ITenantBackgroundScopeActivator>();

        var services = new ServiceCollection();
        services.AddSingleton(mockActivator.Object);
        var provider = services.BuildServiceProvider();

        var job = Job.FromExpression<SampleTenantJob>(x => x.ProcessForTenant(targetTenantId, "sample payload"));
        var backgroundJob = new BackgroundJob("job-123", job, DateTime.UtcNow);

        var performingContext = CreatePerformingContext(backgroundJob, provider);
        var filter = new HangfireTenantJobFilter();

        // Act
        filter.OnPerforming(performingContext);

        // Assert
        mockActivator.Verify(a => a.ActivateTenantAsync(targetTenantId, It.IsAny<CancellationToken>()), Times.Once);
        mockActivator.Verify(a => a.ActivateGlobalAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public void HangfireTenantJobFilter_WhenJobHasNoTenantId_ActivatesGlobalContext()
    {
        // Arrange
        var mockActivator = new Mock<ITenantBackgroundScopeActivator>();

        var services = new ServiceCollection();
        services.AddSingleton(mockActivator.Object);
        var provider = services.BuildServiceProvider();

        var job = Job.FromExpression<SampleTenantJob>(x => x.ProcessGlobal());
        var backgroundJob = new BackgroundJob("job-456", job, DateTime.UtcNow);

        var performingContext = CreatePerformingContext(backgroundJob, provider);
        var filter = new HangfireTenantJobFilter();

        // Act
        filter.OnPerforming(performingContext);

        // Assert
        mockActivator.Verify(a => a.ActivateGlobalAsync(It.IsAny<CancellationToken>()), Times.Once);
        mockActivator.Verify(a => a.ActivateTenantAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static PerformingContext CreatePerformingContext(BackgroundJob backgroundJob, IServiceProvider serviceProvider)
    {
        var mockStorage = new Mock<JobStorage>();
        var mockConnection = new Mock<IStorageConnection>();
        var mockCancellationToken = new Mock<IJobCancellationToken>();
        var performContext = new PerformContext(mockStorage.Object, mockConnection.Object, backgroundJob, mockCancellationToken.Object);

        return new PerformingContext(performContext)
        {
            Items = { ["JobActivatorScope"] = new TestJobActivatorScope(serviceProvider) }
        };
    }
}
