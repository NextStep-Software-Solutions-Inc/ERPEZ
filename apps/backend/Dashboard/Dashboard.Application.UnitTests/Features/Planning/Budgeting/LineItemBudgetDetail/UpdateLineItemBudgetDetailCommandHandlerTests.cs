using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.UpdateLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LineItemBudgetDetail;

public class UpdateLineItemBudgetDetailCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<ILineItemBudgetActivityRepository> libActivityRepoMock;
    private readonly Mock<ILineItemBudgetDetailRepository> libDetailRepoMock;
    private readonly Mock<IOPCRActivityRepository> opcrActivityRepoMock;
    private readonly Mock<IWFPObjectiveActivityExpenditureRepository> wfpExpenditureRepoMock;
    private readonly Mock<IWFPObjectiveTimelineRepository> wfpTimelineRepoMock;
    private readonly UpdateLineItemBudgetDetailCommandHandler handler;

    public UpdateLineItemBudgetDetailCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        libActivityRepoMock = new Mock<ILineItemBudgetActivityRepository>();
        libDetailRepoMock = new Mock<ILineItemBudgetDetailRepository>();
        opcrActivityRepoMock = new Mock<IOPCRActivityRepository>();
        wfpExpenditureRepoMock = new Mock<IWFPObjectiveActivityExpenditureRepository>();
        wfpTimelineRepoMock = new Mock<IWFPObjectiveTimelineRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetActivityRepository).Returns(libActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetDetailRepository).Returns(libDetailRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OPCRActivityRepository).Returns(opcrActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WFPObjectiveActivityExpenditureRepository).Returns(wfpExpenditureRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WFPObjectiveTimelineRepository).Returns(wfpTimelineRepoMock.Object);

        // Setup ExecuteInTransactionAsync to invoke the callback directly
        unitOfWorkMock.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<Task>, CancellationToken>((op, _) => op());

        handler = new UpdateLineItemBudgetDetailCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_OpcrActivity_EditSubtractsOldAmount_WithinBudget_ShouldSucceed()
    {
        // Arrange: OPCR activity has 100,000 budget.
        // Detail 1 = 50,000. Detail 2 (being updated) = 40,000. Current total = 90,000.
        // Updating Detail 2 from 40,000 to 45,000 -> New total = 50,000 + 45,000 = 95,000 <= 100,000.
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var detailIdToUpdate = Guid.NewGuid();
        var otherDetailId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "OPCR",
            Scope = "Activity",
            Status = "Draft"
        };

        var opcrActivity = new OPCRActivity
        {
            Id = opcrActivityId,
            Budget = 100000m
        };

        var existingDetail = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = detailIdToUpdate,
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            Budget = 40000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3),
            ObjectId = Guid.NewGuid()
        };

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                existingDetail,
                new() { Id = otherDetailId, Budget = 50000m, IsDeleted = false }
            }
        };

        libDetailRepoMock.Setup(r => r.GetByIdAsync(detailIdToUpdate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDetail);

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new UpdateLineItemBudgetDetailCommand(detailIdToUpdate, new UpdateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            Budget = 45000m
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        existingDetail.Budget.Should().Be(45000m);
        libDetailRepoMock.Verify(r => r.Update(existingDetail), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_OpcrActivity_EditExceedingBudget_ShouldThrowValidationException()
    {
        // Arrange: OPCR activity has 100,000 budget.
        // Detail 1 = 50,000. Detail 2 (being updated) = 40,000.
        // Available for Detail 2 = 100,000 - 50,000 = 50,000.
        // Request tries to update Detail 2 to 60,000 (total would be 110,000).
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var detailIdToUpdate = Guid.NewGuid();
        var otherDetailId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "OPCR",
            Scope = "Activity",
            Status = "Draft"
        };

        var opcrActivity = new OPCRActivity
        {
            Id = opcrActivityId,
            Budget = 100000m
        };

        var existingDetail = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = detailIdToUpdate,
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            Budget = 40000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3),
            ObjectId = Guid.NewGuid()
        };

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                existingDetail,
                new() { Id = otherDetailId, Budget = 50000m, IsDeleted = false }
            }
        };

        libDetailRepoMock.Setup(r => r.GetByIdAsync(detailIdToUpdate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDetail);

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new UpdateLineItemBudgetDetailCommand(detailIdToUpdate, new UpdateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            Budget = 60000m
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.WithMessage("*Expenditure exceeds available OPCR Activity budget*Available: ₱50,000.00; Requested: ₱60,000.00*");
    }

    [Fact]
    public async Task Handle_OpcrActivity_UpdateExactCeiling_ShouldSucceed()
    {
        // Arrange: Budget = 50,000. Existing other = 26,000. Current detail = 10,000. Updating to 24,000 -> Total = 26,000 + 24,000 = 50,000 (Exact match)
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var detailIdToUpdate = Guid.NewGuid();
        var otherDetailId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "OPCR",
            Scope = "Activity",
            Status = "Draft"
        };

        var opcrActivity = new OPCRActivity
        {
            Id = opcrActivityId,
            Budget = 50000m
        };

        var existingDetail = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = detailIdToUpdate,
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            Budget = 10000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3),
            ObjectId = Guid.NewGuid()
        };

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                existingDetail,
                new() { Id = otherDetailId, Budget = 26000m, IsDeleted = false }
            }
        };

        libDetailRepoMock.Setup(r => r.GetByIdAsync(detailIdToUpdate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDetail);

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new UpdateLineItemBudgetDetailCommand(detailIdToUpdate, new UpdateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            Budget = 24000m
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        existingDetail.Budget.Should().Be(24000m);
        libDetailRepoMock.Verify(r => r.Update(existingDetail), Times.Once);
    }
}
