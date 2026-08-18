using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LineItemBudgetDetail;

public class CreateLineItemBudgetDetailCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<ILineItemBudgetActivityRepository> libActivityRepoMock;
    private readonly Mock<ILineItemBudgetDetailRepository> libDetailRepoMock;
    private readonly Mock<IOPCRActivityRepository> opcrActivityRepoMock;
    private readonly Mock<IWFPObjectiveActivityExpenditureRepository> wfpExpenditureRepoMock;
    private readonly Mock<IWFPObjectiveTimelineRepository> wfpTimelineRepoMock;
    private readonly CreateLineItemBudgetDetailCommandHandler handler;

    public CreateLineItemBudgetDetailCommandHandlerTests()
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

        handler = new CreateLineItemBudgetDetailCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_OpcrActivity_ExpenditureWithinBudget_ShouldSucceed()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

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

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                new() { Id = Guid.NewGuid(), Budget = 40000m, IsDeleted = false }
            }
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new CreateLineItemBudgetDetailCommand(new CreateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            ObjectId = objectId,
            Budget = 50000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        libDetailRepoMock.Verify(r => r.AddAsync(It.Is<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>(d =>
            d.LineItemBudgetId == libId &&
            d.LineItemBudgetActivityId == activityId &&
            d.Budget == 50000m), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_OpcrActivity_ExpenditureExceedingBudget_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

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

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                new() { Id = Guid.NewGuid(), Budget = 86000m, IsDeleted = false }
            }
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new CreateLineItemBudgetDetailCommand(new CreateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            ObjectId = objectId,
            Budget = 20000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.WithMessage("*Expenditure exceeds available OPCR Activity budget*Available: ₱14,000.00; Requested: ₱20,000.00*");
    }

    [Fact]
    public async Task Handle_OpcrActivity_ExactBudgetBoundary_ShouldSucceed()
    {
        // Arrange: Budget = 50,000, Existing = 36,000, New = 14,000 -> Total = 50,000 (Exact match)
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

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

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                new() { Id = Guid.NewGuid(), Budget = 36000m, IsDeleted = false }
            }
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new CreateLineItemBudgetDetailCommand(new CreateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            ObjectId = objectId,
            Budget = 14000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        libDetailRepoMock.Verify(r => r.AddAsync(It.Is<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>(d =>
            d.Budget == 14000m), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_OpcrActivity_ExceedingBudgetByOneCentavo_ShouldThrowValidationException()
    {
        // Arrange: Budget = 50,000, Existing = 36,000, New = 14,000.01 -> Exceeds by 0.01
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

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

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            OPCRActivity = opcrActivity,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                new() { Id = Guid.NewGuid(), Budget = 36000m, IsDeleted = false }
            }
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new CreateLineItemBudgetDetailCommand(new CreateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            ObjectId = objectId,
            Budget = 14000.01m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.WithMessage("*Expenditure exceeds available OPCR Activity budget*");
    }

    [Fact]
    public async Task Handle_WfpSource_ShouldNotApplyOpcrBudgetCeiling()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var wfpActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "WFP",
            Scope = "Activity",
            Status = "Draft"
        };

        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            WFPObjectiveActivityId = wfpActivityId,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>()
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.GetByIdForUpdateAsync(activityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activity);

        var command = new CreateLineItemBudgetDetailCommand(new CreateLineItemBudgetDetailRequest
        {
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityId,
            ObjectId = objectId,
            Budget = 250000m,
            TimelineType = "Quarterly",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        libDetailRepoMock.Verify(r => r.AddAsync(It.IsAny<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
