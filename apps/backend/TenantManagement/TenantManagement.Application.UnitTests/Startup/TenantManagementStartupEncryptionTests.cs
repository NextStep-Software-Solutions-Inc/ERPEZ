using ERPEZ.Shared.Configuration;
using ERPEZ.TenantManagement.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Startup;

public class TenantManagementStartupEncryptionTests
{
    private readonly Mock<ILogger> loggerMock = new();

    [Fact]
    public void TenantManagement_Development_MissingKey_StartsSuccessfullyWithWarning()
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
    public void TenantManagement_Production_MissingKey_ThrowsInvalidOperationException()
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
    public void TenantManagement_Staging_MissingKey_ThrowsInvalidOperationException()
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
    public void TenantManagement_Production_ConfiguredKey_StartsSuccessfully()
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

    [Fact]
    public void TenantManagement_HostStartupPipeline_Production_MissingKey_FailsFast()
    {
        // Arrange: instantiate WebApplicationBuilder with Production environment and missing encryption key
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            EnvironmentName = Environments.Production
        });

        // Act: invoking AddInfrastructureServices triggers authoritative startup validation
        var act = () => builder.AddInfrastructureServices();

        // Assert: fails immediately during startup pipeline execution
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Missing required encryption master key in non-development environment 'Production'*");
    }
}
