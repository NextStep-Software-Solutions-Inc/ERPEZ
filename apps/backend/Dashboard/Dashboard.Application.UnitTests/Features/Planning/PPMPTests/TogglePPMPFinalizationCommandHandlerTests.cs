using ERPEZ.Application.Features.Planning.PPMP.Commands.TogglePPMPFinalization;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.PPMPTests;

public class TogglePPMPFinalizationCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IAPPPPMPRepository> appPpmpRepoMock;
    private readonly TogglePPMPFinalizationCommandHandler handler;

    public TogglePPMPFinalizationCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        appPpmpRepoMock = new Mock<IAPPPPMPRepository>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPPPMPRepository).Returns(appPpmpRepoMock.Object);

        handler = new TogglePPMPFinalizationCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenSettingFinalTrueOnApprovedPPMP_Succeeds()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            Status = StatusEnum.Approved,
            IsFinal = false
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        var command = new TogglePPMPFinalizationCommand(ppmpId, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmp.IsFinal.Should().BeTrue();
        ppmpRepoMock.Verify(r => r.Update(ppmp), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenSettingFinalTrueOnDraftPPMP_ThrowsValidationException()
    {
        // Arrange: status is Draft, not Approved (Safeguard 1: Status != Approved cannot be Final)
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            Status = StatusEnum.Draft,
            IsFinal = false
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        var command = new TogglePPMPFinalizationCommand(ppmpId, true);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Only approved PPMPs can be marked as final*");
    }

    [Fact]
    public async Task Handle_WhenSettingFinalFalseAndPPMPConsumedByApprovedFinalAPP_ThrowsValidationException()
    {
        // Arrange: Safeguard 2 - PPMP already linked to an approved Final APP
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            Status = StatusEnum.Approved,
            IsFinal = true
        };

        var finalApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = Guid.NewGuid(),
            APPNumber = "APP-2026-FINAL-001",
            APPType = "Final",
            Status = StatusEnum.Approved,
            IsFinal = "true"
        };

        var link = new APPPPMP
        {
            Id = Guid.NewGuid(),
            APPId = finalApp.Id,
            PPMPId = ppmpId,
            APP = finalApp
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);
        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([link]);

        var command = new TogglePPMPFinalizationCommand(ppmpId, false);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot unmark PPMP 'PPMP-2026-001' as final because it has already been consumed by approved Final APP*");
    }

    [Fact]
    public async Task Handle_WhenSettingFinalFalseAndPPMPNotConsumedByApprovedFinalAPP_Succeeds()
    {
        // Arrange: PPMP linked only to an Indicative APP (not an approved Final APP)
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            Status = StatusEnum.Approved,
            IsFinal = true
        };

        var indicativeApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = Guid.NewGuid(),
            APPNumber = "APP-2026-IND-001",
            APPType = "Indicative",
            Status = StatusEnum.Approved,
            IsFinal = "false"
        };

        var link = new APPPPMP
        {
            Id = Guid.NewGuid(),
            APPId = indicativeApp.Id,
            PPMPId = ppmpId,
            APP = indicativeApp
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);
        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([link]);

        var command = new TogglePPMPFinalizationCommand(ppmpId, false);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmp.IsFinal.Should().BeFalse();
        ppmpRepoMock.Verify(r => r.Update(ppmp), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
