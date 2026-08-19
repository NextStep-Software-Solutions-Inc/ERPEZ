using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.CreateLIBActivity;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LIBActivity;

public class CreateLIBActivityCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<ILineItemBudgetActivityRepository> libActivityRepoMock;
    private readonly Mock<IOPCRActivityRepository> opcrActivityRepoMock;
    private readonly Mock<IWFPObjectiveActivityRepository> wfpActivityRepoMock;
    private readonly CreateLIBActivityCommandHandler handler;

    public CreateLIBActivityCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        libActivityRepoMock = new Mock<ILineItemBudgetActivityRepository>();
        opcrActivityRepoMock = new Mock<IOPCRActivityRepository>();
        wfpActivityRepoMock = new Mock<IWFPObjectiveActivityRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetActivityRepository).Returns(libActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OPCRActivityRepository).Returns(opcrActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WFPObjectiveActivityRepository).Returns(wfpActivityRepoMock.Object);

        handler = new CreateLIBActivityCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_FirstOpcrAssociation_ShouldSucceed()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "OPCR",
            Status = "Draft"
        };

        var opcrActivity = new OPCRActivity
        {
            Id = opcrActivityId,
            Name = "Strategic Research Activity",
            Budget = 100000m
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.FindAsync(
            It.IsAny<Expression<Func<LineItemBudgetActivity, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync((LineItemBudgetActivity?)null);

        opcrActivityRepoMock.Setup(r => r.GetByIdAsync(opcrActivityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcrActivity);

        var command = new CreateLIBActivityCommand(new CreateLIBActivityRequest
        {
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        libActivityRepoMock.Verify(r => r.AddAsync(It.Is<LineItemBudgetActivity>(a =>
            a.LineItemBudgetId == libId &&
            a.OPCRActivityId == opcrActivityId &&
            a.Name == "Strategic Research Activity"), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateOpcrActivityOnSameLIB_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "OPCR",
            Status = "Draft"
        };

        var existingActivity = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            IsDeleted = false
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.FindAsync(
            It.IsAny<Expression<Func<LineItemBudgetActivity, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingActivity);

        var command = new CreateLIBActivityCommand(new CreateLIBActivityRequest
        {
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*already linked to this Line Item Budget*");
    }

    [Fact]
    public async Task Handle_DuplicateWFPActivityOnSameLIB_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var wfpActivityId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "WFP",
            Status = "Draft"
        };

        var existingActivity = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = libId,
            WFPObjectiveActivityId = wfpActivityId,
            IsDeleted = false
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        libActivityRepoMock.Setup(r => r.FindAsync(
            It.IsAny<Expression<Func<LineItemBudgetActivity, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingActivity);

        var command = new CreateLIBActivityCommand(new CreateLIBActivityRequest
        {
            LineItemBudgetId = libId,
            WFPObjectiveActivityId = wfpActivityId
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*already linked to this Line Item Budget*");
    }

    [Fact]
    public async Task Handle_PreviouslyDeletedOpcrActivityOnSameLIB_ShouldSucceed()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            SourceType = "OPCR",
            Status = "Draft"
        };

        var opcrActivity = new OPCRActivity
        {
            Id = opcrActivityId,
            Name = "Strategic Research Activity",
            Budget = 100000m
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        // FindAsync returns null because the query filter excludes IsDeleted == true
        libActivityRepoMock.Setup(r => r.FindAsync(
            It.IsAny<Expression<Func<LineItemBudgetActivity, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync((LineItemBudgetActivity?)null);

        opcrActivityRepoMock.Setup(r => r.GetByIdAsync(opcrActivityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcrActivity);

        var command = new CreateLIBActivityCommand(new CreateLIBActivityRequest
        {
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        libActivityRepoMock.Verify(r => r.AddAsync(It.Is<LineItemBudgetActivity>(a =>
            a.LineItemBudgetId == libId &&
            a.OPCRActivityId == opcrActivityId), It.IsAny<CancellationToken>()), Times.Once);
    }
}
