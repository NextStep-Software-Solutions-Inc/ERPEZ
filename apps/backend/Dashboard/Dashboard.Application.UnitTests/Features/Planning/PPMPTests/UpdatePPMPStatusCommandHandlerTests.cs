using ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.PPMPTests;

public class UpdatePPMPStatusCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IApprovalEventRepository> approvalEventRepoMock;
    private readonly UpdatePPMPStatusCommandHandler handler;

    public UpdatePPMPStatusCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        approvalEventRepoMock = new Mock<IApprovalEventRepository>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ApprovalEventRepository).Returns(approvalEventRepoMock.Object);

        handler = new UpdatePPMPStatusCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenReturningSubmittedPPMP_UpdatesStatusAndRecordsApprovalEvent()
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

        var command = new UpdatePPMPStatusCommand
        {
            Id = ppmpId,
            Action = "Returned",
            ActorName = "Budget Officer Jane",
            Role = "Reviewer",
            Notes = "Please reduce Q3 IT equipment count."
        };

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
        savedEvent.ActorName.Should().Be("Budget Officer Jane");
        savedEvent.Notes.Should().Be("Please reduce Q3 IT equipment count.");

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenApprovingSubmittedPPMP_SetsApprovedDateAndStatus()
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

        var command = new UpdatePPMPStatusCommand
        {
            Id = ppmpId,
            Action = "Approved",
            ActorName = "Executive Approver",
            Role = "Approver",
            Notes = "Approved as presented."
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmp.Status.Should().Be(StatusEnum.Approved);
        ppmp.ApprovedDate.Should().NotBeNull();
        ppmpRepoMock.Verify(r => r.Update(ppmp), Times.Once);
        approvalEventRepoMock.Verify(r => r.AddAsync(It.IsAny<ApprovalEvent>(), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenSubmittingPPMP_SetsSubmittedDateAndStatus()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            Status = StatusEnum.Draft
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        var command = new UpdatePPMPStatusCommand
        {
            Id = ppmpId,
            Action = "Submitted",
            ActorName = "Office User",
            Role = "Submitter",
            Notes = "Submitted for review."
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmp.Status.Should().Be(StatusEnum.Submitted);
        ppmp.SubmittedDate.Should().NotBeNull();
        ppmpRepoMock.Verify(r => r.Update(ppmp), Times.Once);
        approvalEventRepoMock.Verify(r => r.AddAsync(It.IsAny<ApprovalEvent>(), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPPMPNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.PPMP?)null);

        var command = new UpdatePPMPStatusCommand
        {
            Id = ppmpId,
            Action = "Returned"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("PPMP not found.");
    }

    [Fact]
    public async Task Handle_WhenInvalidAction_ThrowsValidationException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            Status = StatusEnum.Submitted
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        var command = new UpdatePPMPStatusCommand
        {
            Id = ppmpId,
            Action = "NonExistentStatus"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Invalid status 'NonExistentStatus'*");
    }
}
