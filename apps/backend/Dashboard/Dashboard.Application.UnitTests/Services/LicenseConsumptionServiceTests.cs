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
    public async Task GetCurrentLicenseAsync_WhenNoLicenseExists_ReturnsFallbackStarter()
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
        result.EnabledModules.Should().Contain("sams");
    }

    [Fact]
    public async Task GetCurrentLicenseAsync_WhenSettingExists_ReturnsValidLicenseStatus()
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
            MaxUsers = 150,
            RemainingDays = 100,
            ExpiresAt = DateTime.UtcNow.AddDays(100),
            IsValid = true,
            EnabledModules = "ams,sams,pms",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await service.GetCurrentLicenseAsync();

        // Assert
        result.IsValid.Should().BeTrue();
        result.Plan.Should().Be("Professional");
        result.MaxUsers.Should().Be(150);
        result.EnabledModules.Should().Contain("pms");
    }

    [Fact]
    public async Task IsModuleEnabledAsync_GatesModulesAccordingToPlan()
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
            MaxUsers = 150,
            RemainingDays = 100,
            ExpiresAt = DateTime.UtcNow.AddDays(100),
            IsValid = true,
            EnabledModules = "ams,sams,pms",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        // Act & Assert
        var ams = await service.IsModuleEnabledAsync("ams");
        var sams = await service.IsModuleEnabledAsync("sams");
        var pms = await service.IsModuleEnabledAsync("pms");
        var pbms = await service.IsModuleEnabledAsync("pbms");

        ams.Should().BeTrue();
        sams.Should().BeTrue();
        pms.Should().BeTrue();
        pbms.Should().BeFalse(); // Not in Professional plan
    }

    [Fact]
    public async Task ActivateLicenseAsync_Succeeds_WithOfflineKey()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);

        // Format: {PREFIX}-{PLANCODE}-{YYYYMMDD}-{RANDOM}-{CHECKSUM}
        var futureDate = DateTime.UtcNow.AddYears(1).ToString("yyyyMMdd");
        var offlineKey = $"EPZ-ENTERPRISE-{futureDate}-ABCD-1234";

        // Act
        var result = await service.ActivateLicenseAsync(offlineKey);

        // Assert
        result.Success.Should().BeTrue();
        result.Status.Should().NotBeNull();
        result.Status!.Plan.Should().Be("Enterprise");
        result.Status.EnabledModules.Should().Contain("pbms");
        result.Status.EnabledModules.Should().Contain("pms");
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
