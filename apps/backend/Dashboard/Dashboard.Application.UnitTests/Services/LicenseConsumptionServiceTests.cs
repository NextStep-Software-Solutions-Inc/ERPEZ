using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Services;

public class LicenseConsumptionServiceTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private static LicenseConsumptionService CreateService(ApplicationDbContext dbContext, IMemoryCache? cache = null)
    {
        var configuration = new ConfigurationBuilder().Build();
        var memoryCache = cache ?? new MemoryCache(new MemoryCacheOptions());
        var httpClientFactoryMock = new Mock<IHttpClientFactory>();
        var loggerMock = new Mock<ILogger<LicenseConsumptionService>>();

        return new LicenseConsumptionService(
            dbContext,
            configuration,
            memoryCache,
            httpClientFactoryMock.Object,
            loggerMock.Object);
    }

    [Fact]
    public async Task GetCurrentLicenseAsync_WhenNoLicenseExists_ReturnsFallbackBaseline()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        // Act
        var result = await service.GetCurrentLicenseAsync();

        // Assert
        result.IsValid.Should().BeFalse();
        result.Plan.Should().Be("Unlicensed");
        result.EnabledModules.Should().Contain("ams");
        result.EnabledModules.Should().NotContain("sams");
        result.EnabledModules.Should().NotContain("pms");
        result.EnabledModules.Should().NotContain("pbms");
    }

    [Fact]
    public async Task IsModuleEnabledAsync_WhenStarterPlan_UnlocksAmsAndPbms_DeniesPms()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        await dbContext.AmsLicenseSettings!.AddAsync(new AmsLicenseSetting
        {
            Id = Guid.NewGuid(),
            LicenseKey = "EPZ-STD-20301231-ABCD-1234",
            Plan = "Starter",
            AllowedDomain = "*",
            MaxUsers = 15,
            RemainingDays = 100,
            ExpiresAt = DateTime.UtcNow.AddDays(100),
            IsValid = true,
            EnabledModules = "ams,pbms",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        // Act & Assert
        var ams = await service.IsModuleEnabledAsync("ams");
        var pbms = await service.IsModuleEnabledAsync("pbms");
        var pms = await service.IsModuleEnabledAsync("pms");
        var sams = await service.IsModuleEnabledAsync("sams");

        ams.Should().BeTrue("Starter includes Account Management System");
        pbms.Should().BeTrue("Starter includes Planning & Budgeting Management System");
        pms.Should().BeFalse("Starter does NOT include Procurement Management System");
        sams.Should().BeFalse("SAMS is in development and not included in Starter");
    }

    [Fact]
    public async Task IsModuleEnabledAsync_WhenBusinessPlan_UnlocksAmsPbmsAndPms()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        await dbContext.AmsLicenseSettings!.AddAsync(new AmsLicenseSetting
        {
            Id = Guid.NewGuid(),
            LicenseKey = "EPZ-PRO-20301231-ABCD-1234",
            Plan = "Professional",
            AllowedDomain = "*",
            MaxUsers = 50,
            RemainingDays = 100,
            ExpiresAt = DateTime.UtcNow.AddDays(100),
            IsValid = true,
            EnabledModules = "ams,pbms,pms",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        // Act & Assert
        var ams = await service.IsModuleEnabledAsync("ams");
        var pbms = await service.IsModuleEnabledAsync("pbms");
        var pms = await service.IsModuleEnabledAsync("pms");
        var sams = await service.IsModuleEnabledAsync("sams");

        ams.Should().BeTrue("Business includes AMS");
        pbms.Should().BeTrue("Business includes PBMS");
        pms.Should().BeTrue("Business includes PMS");
        sams.Should().BeFalse("SAMS remains unreleased");
    }

    [Fact]
    public async Task IsModuleEnabledAsync_WhenLicenseExpired_RevokesAccessToPmsAndPbms()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        await dbContext.AmsLicenseSettings!.AddAsync(new AmsLicenseSetting
        {
            Id = Guid.NewGuid(),
            LicenseKey = "EPZ-PRO-20200101-ABCD-1234",
            Plan = "Professional",
            AllowedDomain = "*",
            MaxUsers = 50,
            RemainingDays = 0,
            ExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired yesterday
            IsValid = true,
            EnabledModules = "ams,pbms,pms",
            CreatedAt = DateTime.UtcNow.AddYears(-1)
        });
        await dbContext.SaveChangesAsync();

        // Act & Assert
        var ams = await service.IsModuleEnabledAsync("ams");
        var pbms = await service.IsModuleEnabledAsync("pbms");
        var pms = await service.IsModuleEnabledAsync("pms");

        ams.Should().BeTrue("Baseline AMS remains accessible for admin recovery");
        pbms.Should().BeFalse("PBMS is revoked when subscription has expired");
        pms.Should().BeFalse("PMS is revoked when subscription has expired");
    }

    [Fact]
    public async Task ActivateLicenseAsync_Succeeds_WithOfflineKey_Starter()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        var futureDate = DateTime.UtcNow.AddYears(1).ToString("yyyyMMdd");
        var offlineKey = $"EPZ-STD-{futureDate}-ABCD-1234";

        // Act
        var result = await service.ActivateLicenseAsync(offlineKey);

        // Assert
        result.Success.Should().BeTrue();
        result.Status.Should().NotBeNull();
        result.Status!.Plan.Should().Be("Starter");
        result.Status.EnabledModules.Should().Contain("ams");
        result.Status.EnabledModules.Should().Contain("pbms");
        result.Status.EnabledModules.Should().NotContain("pms");
    }

    [Fact]
    public async Task ActivateLicenseAsync_Succeeds_WithOfflineKey_Professional()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        var futureDate = DateTime.UtcNow.AddYears(1).ToString("yyyyMMdd");
        var offlineKey = $"EPZ-PRO-{futureDate}-ABCD-1234";

        // Act
        var result = await service.ActivateLicenseAsync(offlineKey);

        // Assert
        result.Success.Should().BeTrue();
        result.Status.Should().NotBeNull();
        result.Status!.Plan.Should().Be("Professional");
        result.Status.EnabledModules.Should().Contain("ams");
        result.Status.EnabledModules.Should().Contain("pbms");
        result.Status.EnabledModules.Should().Contain("pms");
        result.Status.EnabledModules.Should().NotContain("sams");
    }

    [Fact]
    public async Task ActivateLicenseAsync_Fails_WhenKeyIsMalformed()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        // Act
        var result = await service.ActivateLicenseAsync("invalid-key");

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Invalid license key format");
    }
}
