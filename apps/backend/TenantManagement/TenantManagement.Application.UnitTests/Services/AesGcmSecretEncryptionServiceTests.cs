using System.Security.Cryptography;
using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Services;

public class AesGcmSecretEncryptionServiceTests
{
    private readonly Mock<IHostEnvironment> devEnvMock = new();
    private readonly Mock<IHostEnvironment> prodEnvMock = new();
    private readonly Mock<ILogger<AesGcmSecretEncryptionService>> loggerMock = new();

    public AesGcmSecretEncryptionServiceTests()
    {
        devEnvMock.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        prodEnvMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);
    }

    [Fact]
    public void Encrypt_And_Decrypt_ReturnsOriginalPlainText()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        var masterKey = Convert.ToBase64String(new byte[32] {
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
            17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
        });
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY_V1"]).Returns(masterKey);

        var encryptionService = new AesGcmSecretEncryptionService(
            configMock.Object, devEnvMock.Object, loggerMock.Object);
        var originalSecret = "Host=localhost;Database=erpez_tenant_abc;Timeout=30;SslMode=Prefer;";

        // Act
        var cipherText = encryptionService.Encrypt(originalSecret, 1);
        var decrypted = encryptionService.Decrypt(cipherText, 1);

        // Assert
        cipherText.Should().NotBeNullOrWhiteSpace();
        cipherText.Should().NotBe(originalSecret);
        decrypted.Should().Be(originalSecret);
    }

    [Fact]
    public void Decrypt_WithCorruptedCipherText_ThrowsCryptographicException()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        var masterKey = Convert.ToBase64String(new byte[32] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 });
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY_V1"]).Returns(masterKey);

        var encryptionService = new AesGcmSecretEncryptionService(
            configMock.Object, devEnvMock.Object, loggerMock.Object);
        var originalSecret = "Host=localhost;Database=test;Timeout=30;";

        var cipherText = encryptionService.Encrypt(originalSecret, 1);
        var rawBytes = Convert.FromBase64String(cipherText);
        rawBytes[^1] ^= 0xFF;
        var tamperedCipherText = Convert.ToBase64String(rawBytes);

        // Act
        var act = () => encryptionService.Decrypt(tamperedCipherText, 1);

        // Assert
        act.Should().Throw<CryptographicException>();
    }

    [Fact]
    public void EmptyString_EncryptAndDecrypt_ReturnsEmptyString()
    {
        var configMock = new Mock<IConfiguration>();
        var encryptionService = new AesGcmSecretEncryptionService(
            configMock.Object, devEnvMock.Object, loggerMock.Object);

        encryptionService.Encrypt(string.Empty).Should().BeEmpty();
        encryptionService.Decrypt(string.Empty).Should().BeEmpty();
    }

    [Fact]
    public void ResolveMasterKey_VersionSpecificEnvironmentVariable_Wins()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY_V1"]).Returns("Key_Env_V1");
        configMock.Setup(c => c["Encryption:Keys:V1"]).Returns("Key_Config_V1");
        configMock.Setup(c => c["Encryption:MasterKey"]).Returns("Key_Legacy_Config");
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY"]).Returns("Key_Legacy_Env");

        // Act
        var resolved = EncryptionConfigurationValidator.ResolveMasterKey(configMock.Object, 1);

        // Assert
        resolved.Should().Be("Key_Env_V1");
    }

    [Fact]
    public void ResolveMasterKey_VersionSpecificConfiguration_Wins()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["Encryption:Keys:V1"]).Returns("Key_Config_V1");
        configMock.Setup(c => c["Encryption:MasterKey"]).Returns("Key_Legacy_Config");
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY"]).Returns("Key_Legacy_Env");

        // Act
        var resolved = EncryptionConfigurationValidator.ResolveMasterKey(configMock.Object, 1);

        // Assert
        resolved.Should().Be("Key_Config_V1");
    }

    [Fact]
    public void ResolveMasterKey_LegacyMasterKey_IsUsedForV1()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["Encryption:MasterKey"]).Returns("Key_Legacy_Config");
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY"]).Returns("Key_Legacy_Env");

        // Act
        var resolved = EncryptionConfigurationValidator.ResolveMasterKey(configMock.Object, 1);

        // Assert
        resolved.Should().Be("Key_Legacy_Config");
    }

    [Fact]
    public void ResolveMasterKey_GenericEnvironmentVariable_IsUsedForV1()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY"]).Returns("Key_Legacy_Env");

        // Act
        var resolved = EncryptionConfigurationValidator.ResolveMasterKey(configMock.Object, 1);

        // Assert
        resolved.Should().Be("Key_Legacy_Env");
    }

    [Fact]
    public void ResolveMasterKey_VersionSpecificKey_WinsOverLegacyKey()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY_V2"]).Returns("Key_Env_V2");
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY"]).Returns("Key_Legacy_Env");

        // Act
        var resolvedV2 = EncryptionConfigurationValidator.ResolveMasterKey(configMock.Object, 2);

        // Assert
        resolvedV2.Should().Be("Key_Env_V2");
    }

    [Fact]
    public void GetEncryptionKey_Development_MissingV2Key_ThrowsInvalidOperationException()
    {
        // Arrange: V1 is configured, but V2 is requested and missing in Development
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY_V1"]).Returns("Configured_V1");

        // Act & Assert
        var act = () => EncryptionConfigurationValidator.GetEncryptionKey(
            configMock.Object, devEnvMock.Object, 2, loggerMock.Object);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*version 2 is not configured*");
    }

    [Fact]
    public void GetEncryptionKey_Production_MissingV1Key_ThrowsInvalidOperationException()
    {
        // Arrange: missing key in Production
        var configMock = new Mock<IConfiguration>();

        // Act & Assert
        var act = () => EncryptionConfigurationValidator.GetEncryptionKey(
            configMock.Object, prodEnvMock.Object, 1, loggerMock.Object);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Missing required encryption master key for version 1 in non-development environment 'Production'*");
    }

    [Fact]
    public void GetEncryptionKey_Development_MissingV1Key_UsesFallbackAndLogsWarning()
    {
        // Arrange: missing key in Development
        var configMock = new Mock<IConfiguration>();

        // Act
        var keyBytes = EncryptionConfigurationValidator.GetEncryptionKey(
            configMock.Object, devEnvMock.Object, 1, loggerMock.Object);

        // Assert
        keyBytes.Should().NotBeNull();
        keyBytes.Length.Should().Be(32);
    }
}
