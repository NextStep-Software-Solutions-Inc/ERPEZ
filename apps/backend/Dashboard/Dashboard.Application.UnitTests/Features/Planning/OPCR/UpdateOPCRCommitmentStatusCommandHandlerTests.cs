using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRCommitmentStatus;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.OPCR;

public class UpdateOPCRCommitmentStatusCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IOPCRRepository> opcrRepoMock;
    private readonly UpdateOPCRCommitmentStatusCommandHandler handler;

    public UpdateOPCRCommitmentStatusCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        opcrRepoMock = new Mock<IOPCRRepository>();
        unitOfWorkMock.Setup(u => u.OPCRRepository).Returns(opcrRepoMock.Object);
        handler = new UpdateOPCRCommitmentStatusCommandHandler(unitOfWorkMock.Object);
    }

    private static ERPEZ.Domain.Entities.Planning.OPCR CreateValidOPCR(Guid opcrId)
    {
        var itemId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var kpiAssignmentId = Guid.NewGuid();

        var activity = new OPCRActivity
        {
            Id = activityId,
            OPCRItemId = itemId,
            Name = "Conduct quarterly curriculum review",
            Budget = 10000m,
            IsDeleted = false
        };

        var kpiAssignment = new ERPEZ.Domain.Entities.Planning.KPIAssignment
        {
            Id = kpiAssignmentId,
            AssignedTargetAnnual = 100m,
            AssignedTargetQ1 = 25m,
            AssignedTargetQ2 = 25m,
            AssignedTargetQ3 = 25m,
            AssignedTargetQ4 = 25m,
            FYActiveKPI = new FYActiveKPI
            {
                Id = Guid.NewGuid(),
                Name = "Curriculum Enhancement Rate"
            }
        };

        var item = new OPCRItem
        {
            Id = itemId,
            OPCRId = opcrId,
            KPIAssignmentId = kpiAssignmentId,
            KPIAssignment = kpiAssignment,
            Q1Target = 25m,
            Q2Target = 25m,
            Q3Target = 25m,
            Q4Target = 25m,
            IsDeleted = false,
            OPCRActivities = [activity]
        };

        return new ERPEZ.Domain.Entities.Planning.OPCR
        {
            Id = opcrId,
            Name = "OPCR-2026-Academic Affairs",
            CommitmentStatus = "Draft",
            OPCRItems = [item],
            IsDeleted = false
        };
    }

    [Fact]
    public async Task Handle_SubmitValidDraftOPCR_ShouldSucceedAndSetSubmittedDate()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Submitted"
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        opcr.CommitmentStatus.Should().Be("Submitted");
        opcr.SubmittedDate.Should().NotBeNull();
        opcrRepoMock.Verify(r => r.Update(opcr), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SubmitDraftOPCR_WhenNoKPIs_ShouldThrowValidationException()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.OPCRItems.Clear();

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Submitted"
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot submit OPCR for approval without assigned KPIs*");
    }

    [Fact]
    public async Task Handle_SubmitDraftOPCR_WhenNoActivities_ShouldThrowValidationException()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.OPCRItems.First().OPCRActivities.Clear();

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Submitted"
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot submit OPCR for approval without adding at least one activity*");
    }

    [Fact]
    public async Task Handle_SubmitDraftOPCR_WhenKPIHasNoQuarterlyTargets_ShouldThrowValidationException()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        var item = opcr.OPCRItems.First();
        item.Q1Target = 0;
        item.Q2Target = 0;
        item.Q3Target = 0;
        item.Q4Target = 0;
        item.KPIAssignment.AssignedTargetQ1 = 0;
        item.KPIAssignment.AssignedTargetQ2 = 0;
        item.KPIAssignment.AssignedTargetQ3 = 0;
        item.KPIAssignment.AssignedTargetQ4 = 0;

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Submitted"
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*have no quarterly targets configured*");
    }

    [Fact]
    public async Task Handle_SubmitAlreadyApprovedOPCR_ShouldThrowValidationException()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.CommitmentStatus = "Approved";

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Submitted"
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot submit an OPCR with status 'Approved'*");
    }

    [Fact]
    public async Task Handle_ApproveSubmittedOPCR_ShouldSucceedAndSetApprovedDate()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.CommitmentStatus = "Submitted";
        opcr.SubmittedDate = DateTime.UtcNow.AddDays(-1);

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Approved"
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        opcr.CommitmentStatus.Should().Be("Approved");
        opcr.ApprovedDate.Should().NotBeNull();
        opcrRepoMock.Verify(r => r.Update(opcr), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ApproveDraftOPCR_ShouldThrowValidationException()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.CommitmentStatus = "Draft";

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Approved"
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot approve OPCR with status 'Draft'. Only Submitted OPCRs can be approved*");
    }

    [Fact]
    public async Task Handle_ReturnSubmittedOPCR_ShouldSucceedAndSetReturned()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.CommitmentStatus = "Submitted";

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Returned"
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        opcr.CommitmentStatus.Should().Be("Returned");
        opcrRepoMock.Verify(r => r.Update(opcr), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnDraftOPCR_ShouldThrowValidationException()
    {
        var opcrId = Guid.NewGuid();
        var opcr = CreateValidOPCR(opcrId);
        opcr.CommitmentStatus = "Draft";

        opcrRepoMock.Setup(r => r.GetOPCRWithDetailsAsync(opcrId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcr);

        var command = new UpdateOPCRCommitmentStatusCommand
        {
            Id = opcrId,
            Request = new UpdateOPCRCommitmentStatusRequest
            {
                CommitmentStatus = "Returned"
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot return OPCR with status 'Draft'. Only Submitted OPCRs can be returned*");
    }
}
