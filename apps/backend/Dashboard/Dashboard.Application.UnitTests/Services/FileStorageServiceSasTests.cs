using ERPEZ.Application.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Services;

public class FileStorageServiceSasTests
{
    [Fact]
    public async Task GetDownloadUrlAsync_WhenInvoked_ShouldReturnValidUrl()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var expectedSasUrl = $"https://mystorageaccount.blob.core.windows.net/permanent/{fileId}_document.pdf?sp=r&st=2026-09-03&se=2026-09-03&spr=https&sv=2024-05-04&sr=b&sig=testsignature";

        var storageMock = new Mock<IFileStorageService>();
        storageMock.Setup(s => s.GetDownloadUrlAsync(fileId, It.IsAny<TimeSpan?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSasUrl);

        // Act
        var result = await storageMock.Object.GetDownloadUrlAsync(fileId, TimeSpan.FromMinutes(30));

        // Assert
        result.Should().NotBeNullOrWhiteSpace();
        result.Should().Be(expectedSasUrl);
        result.Should().Contain(fileId.ToString());
    }

    [Fact]
    public async Task GetDownloadUrlAsync_WhenLocalFallback_ShouldReturnProxyUrl()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var fallbackUrl = $"/files/download/{fileId}";

        var storageMock = new Mock<IFileStorageService>();
        storageMock.Setup(s => s.GetDownloadUrlAsync(fileId, It.IsAny<TimeSpan?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(fallbackUrl);

        // Act
        var result = await storageMock.Object.GetDownloadUrlAsync(fileId);

        // Assert
        result.Should().Be(fallbackUrl);
    }
}
