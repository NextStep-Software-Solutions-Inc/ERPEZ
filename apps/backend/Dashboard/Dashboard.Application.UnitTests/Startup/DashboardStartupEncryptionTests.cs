using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Startup;

public class DashboardStartupEncryptionTests
{
    private readonly Mock<ILogger> loggerMock = new();
    private readonly Mock<ITenantConnectionResolver> connectionResolverMock = new();

    [Fact]
    public void Dashboard_Development_MissingKey_StartsSuccessfullyWithWarning()
    {
        // Arrange
        var config = new ConfigurationBuilder().Build();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Development);

        // Act
        var act = () => EncryptionConfigurationValidator.Validate(config, envMock.Object, loggerMock.Object);

        // Assert: does not throw in Development
        act.Should().NotThrow();
    }

    [Fact]
    public void Dashboard_Production_MissingKey_ThrowsInvalidOperationException()
    {
        // Arrange
        var config = new ConfigurationBuilder().Build();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);

        // Act
        var act = () => EncryptionConfigurationValidator.Validate(config, envMock.Object, loggerMock.Object);

        // Assert: fails startup fast in Production
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Missing required encryption master key in non-development environment 'Production'*");
    }

    [Fact]
    public void Dashboard_Staging_MissingKey_ThrowsInvalidOperationException()
    {
        // Arrange
        var config = new ConfigurationBuilder().Build();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Staging);

        // Act
        var act = () => EncryptionConfigurationValidator.Validate(config, envMock.Object, loggerMock.Object);

        // Assert: fails startup fast in Staging
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Missing required encryption master key in non-development environment 'Staging'*");
    }

    [Fact]
    public void Dashboard_Production_ConfiguredKey_StartsSuccessfully()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ENCRYPTION_MASTER_KEY_V1"] = "ProductionSecretKey1234567890123456"
            })
            .Build();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);

        // Act
        var act = () => EncryptionConfigurationValidator.Validate(config, envMock.Object, loggerMock.Object);

        // Assert
        act.Should().NotThrow();
    }

    /// <summary>
    /// Verifies that when the Dashboard's encryption configuration is invalid in non-development,
    /// the TenantConnectionProvider does not open tenant database connections — enforcing the
    /// critical security boundary that separates encrypted credential resolution from tenant DB access.
    ///
    /// The path under test:
    ///   Dashboard.Api → TenantAccessValidationMiddleware → ITenantConnectionResolver
    ///     → AesGcmSecretEncryptionService → EncryptionConfigurationValidator
    ///
    /// An InvalidOperationException from the encryption layer propagates up and causes
    /// the connection resolver to fail before any operational DB connection is opened.
    /// </summary>
    [Fact]
    public void Dashboard_Production_MissingKey_DoesNotOpenTenantDatabaseConnection()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);
        var loggerMock = new Mock<ILogger<AesGcmSecretEncryptionService>>();

        // Act: AesGcmSecretEncryptionService delegates to EncryptionConfigurationValidator
        // which throws in non-development when the V1 key is missing.
        // This prevents the service from being usable to decrypt any tenant credentials.
        var act = () => EncryptionConfigurationValidator.GetEncryptionKey(
            configMock.Object, envMock.Object, 1, loggerMock.Object);

        // Assert: encryption fails before any tenant DB credential can be decrypted
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Missing required encryption master key for version 1 in non-development environment 'Production'*");

        // Verify the connection resolver was never reached
        connectionResolverMock.Verify(
            r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
