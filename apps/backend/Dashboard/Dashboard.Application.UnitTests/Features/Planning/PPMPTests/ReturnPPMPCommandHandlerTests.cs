using ERPEZ.Application.Features.Planning.PPMP.Commands.ReturnPPMP;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.PPMPTests;

public class ReturnPPMPCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IApprovalEventRepository> approvalEventRepoMock;
    private readonly ReturnPPMPCommandHandler handler;

    public ReturnPPMPCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        approvalEventRepoMock = new Mock<IApprovalEventRepository>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ApprovalEventRepository).Returns(approvalEventRepoMock.Object);

        handler = new ReturnPPMPCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenPPMPInSubmittedStatus_ReturnsAndRecordsEvent()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-002",
            Status = StatusEnum.Submitted
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        ApprovalEvent? savedEvent = null;
        approvalEventRepoMock.Setup(r => r.AddAsync(It.IsAny<ApprovalEvent>(), It.IsAny<CancellationToken>()))
            .Callback<ApprovalEvent, CancellationToken>((ae, _) => savedEvent = ae)
            .Returns(Task.CompletedTask);

        var request = new ReturnPPMPRequest
        {
            Remarks = "Please adjust quarterly distribution for item 1.",
            ActorName = "Reviewer Jane",
            Role = "Reviewer"
        };
        var command = new ReturnPPMPCommand(ppmpId, request);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmp.Status.Should().Be(StatusEnum.Returned);
        ppmpRepoMock.Verify(r => r.Update(ppmp), Times.Once);

        savedEvent.Should().NotBeNull();
        savedEvent!.PPMPId.Should().Be(ppmpId);
        savedEvent.Action.Should().Be("Returned");
        savedEvent.Role.Should().Be("Reviewer");
        savedEvent.ActorName.Should().Be("Reviewer Jane");
        savedEvent.Notes.Should().Be("Please adjust quarterly distribution for item 1.");

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
            Status = StatusEnum.Approved
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        var request = new ReturnPPMPRequest { Remarks = "Revising approved PPMP." };
        var command = new ReturnPPMPCommand(ppmpId, request);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Only PPMPs in 'Submitted' status can be returned for revision*");
    }

    [Fact]
    public async Task Handle_WhenPPMPNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.PPMP?)null);

        var request = new ReturnPPMPRequest { Remarks = "Some remarks" };
        var command = new ReturnPPMPCommand(ppmpId, request);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("PPMP not found.");
    }
}
