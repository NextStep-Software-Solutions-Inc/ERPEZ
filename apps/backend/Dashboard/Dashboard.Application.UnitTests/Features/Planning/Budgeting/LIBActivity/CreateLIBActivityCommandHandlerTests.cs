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
    private readonly Mock<IFiscalYearRepository> fiscalYearRepoMock;
    private readonly Mock<IOfficeRepository> officeRepoMock;
    private readonly CreateLIBActivityCommandHandler handler;

    public CreateLIBActivityCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        libActivityRepoMock = new Mock<ILineItemBudgetActivityRepository>();
        opcrActivityRepoMock = new Mock<IOPCRActivityRepository>();
        wfpActivityRepoMock = new Mock<IWFPObjectiveActivityRepository>();
        fiscalYearRepoMock = new Mock<IFiscalYearRepository>();
        officeRepoMock = new Mock<IOfficeRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetActivityRepository).Returns(libActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OPCRActivityRepository).Returns(opcrActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WFPObjectiveActivityRepository).Returns(wfpActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.FiscalYearRepository).Returns(fiscalYearRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OfficeRepository).Returns(officeRepoMock.Object);

        libActivityRepoMock.Setup(r => r.FindAllAsync(
            It.IsAny<Expression<Func<LineItemBudgetActivity, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<LineItemBudgetActivity>());

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

    [Fact]
    public async Task Handle_WhenPAPCodeEmpty_ShouldAutoGeneratePAPCode()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var opcrActivityId = Guid.NewGuid();

        var lib = new LineItemBudget
        {
            Id = libId,
            FiscalYearId = fiscalYearId,
            OfficeId = officeId,
            SourceType = "OPCR",
            Status = "Draft"
        };

        var fiscalYear = new FiscalYear { Id = fiscalYearId, Year = 2026 };
        var office = new Office { Id = officeId, Code = "17" };

        var opcrActivity = new OPCRActivity
        {
            Id = opcrActivityId,
            Name = "Strategic Research Activity",
            Budget = 100000m
        };

        var existingActivities = new List<LineItemBudgetActivity>
        {
            new() { Id = Guid.NewGuid(), LineItemBudgetId = libId }
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);
        fiscalYearRepoMock.Setup(r => r.GetByIdAsync(fiscalYearId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(fiscalYear);
        officeRepoMock.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(office);
        libActivityRepoMock.Setup(r => r.FindAllAsync(
            It.IsAny<Expression<Func<LineItemBudgetActivity, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingActivities);
        opcrActivityRepoMock.Setup(r => r.GetByIdAsync(opcrActivityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcrActivity);

        var command = new CreateLIBActivityCommand(new CreateLIBActivityRequest
        {
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            PAPCode = null
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        // Existing count is 1, next sequence is 2 formatted as 00002 -> "2026-17-00002"
        libActivityRepoMock.Verify(r => r.AddAsync(It.Is<LineItemBudgetActivity>(a =>
            a.PAPCode == "2026-17-00002"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPAPCodeProvided_ShouldPreserveProvidedPAPCode()
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
            Name = "Reproduction of contracts",
            Budget = 50000m
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);
        opcrActivityRepoMock.Setup(r => r.GetByIdAsync(opcrActivityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opcrActivity);

        var command = new CreateLIBActivityCommand(new CreateLIBActivityRequest
        {
            LineItemBudgetId = libId,
            OPCRActivityId = opcrActivityId,
            PAPCode = "2026-17-21335"
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        libActivityRepoMock.Verify(r => r.AddAsync(It.Is<LineItemBudgetActivity>(a =>
            a.PAPCode == "2026-17-21335"), It.IsAny<CancellationToken>()), Times.Once);
    }
}

