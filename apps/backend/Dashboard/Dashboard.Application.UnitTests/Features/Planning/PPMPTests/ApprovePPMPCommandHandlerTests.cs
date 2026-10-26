using ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.PPMPTests;

public class ApprovePPMPCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IApprovalEventRepository> approvalEventRepoMock;
    private readonly ApprovePPMPCommandHandler handler;

    public ApprovePPMPCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        approvalEventRepoMock = new Mock<IApprovalEventRepository>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ApprovalEventRepository).Returns(approvalEventRepoMock.Object);

        handler = new ApprovePPMPCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenPPMPInSubmittedStatus_ApprovesAndRecordsEvent()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            Status = StatusEnum.Submitted
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        ApprovalEvent? savedEvent = null;
        approvalEventRepoMock.Setup(r => r.AddAsync(It.IsAny<ApprovalEvent>(), It.IsAny<CancellationToken>()))
            .Callback<ApprovalEvent, CancellationToken>((ae, _) => savedEvent = ae)
            .Returns(Task.CompletedTask);

        var request = new ApprovePPMPRequest
        {
            ActorName = "Dr. Approver",
            Role = "Approver",
            Notes = "Approved per annual work plan."
        };
        var command = new ApprovePPMPCommand(ppmpId, request);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmp.Status.Should().Be(StatusEnum.Approved);
        ppmp.ApprovedDate.Should().NotBeNull();
        ppmpRepoMock.Verify(r => r.Update(ppmp), Times.Once);

        savedEvent.Should().NotBeNull();
        savedEvent!.PPMPId.Should().Be(ppmpId);
        savedEvent.Action.Should().Be("Approved");
        savedEvent.Role.Should().Be("Approver");
        savedEvent.ActorName.Should().Be("Dr. Approver");
        savedEvent.Notes.Should().Be("Approved per annual work plan.");

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPPMPNotInSubmittedStatus_ThrowsValidationException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            Status = StatusEnum.Draft
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        var command = new ApprovePPMPCommand(ppmpId);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Only PPMPs in 'Submitted' status can be approved*");
    }

    [Fact]
    public async Task Handle_WhenPPMPNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.PPMP?)null);

        var command = new ApprovePPMPCommand(ppmpId);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("PPMP not found.");
    }
}
