using System.Security.Cryptography;
using ERPEZ.Shared.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Services;

public class AesGcmSecretEncryptionServiceTests
{
    [Fact]
    public void Encrypt_And_Decrypt_ReturnsOriginalPlainText()
    {
        // Arrange
        var configMock = new Mock<IConfiguration>();
        // 32-byte key base64 encoded
        var masterKey = Convert.ToBase64String(new byte[32] {
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
            17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
        });
        configMock.Setup(c => c["ENCRYPTION_MASTER_KEY_V1"]).Returns(masterKey);

        var encryptionService = new AesGcmSecretEncryptionService(configMock.Object);
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

        var encryptionService = new AesGcmSecretEncryptionService(configMock.Object);
        var originalSecret = "Host=localhost;Database=test;Timeout=30;";

        var cipherText = encryptionService.Encrypt(originalSecret, 1);
        var rawBytes = Convert.FromBase64String(cipherText);
        // Flip one bit in the ciphertext/tag
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
        var encryptionService = new AesGcmSecretEncryptionService(configMock.Object);

        encryptionService.Encrypt(string.Empty).Should().BeEmpty();
        encryptionService.Decrypt(string.Empty).Should().BeEmpty();
    }
}
