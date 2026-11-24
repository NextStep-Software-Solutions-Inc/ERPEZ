using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIBStatus;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LIB;

public class UpdateLIBStatusCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly UpdateLIBStatusCommandHandler handler;

    public UpdateLIBStatusCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        handler = new UpdateLIBStatusCommandHandler(unitOfWorkMock.Object);
    }

    private LineItemBudget CreateCompleteValidLIB(Guid libId)
    {
        var activityId = Guid.NewGuid();
        var activity = new LineItemBudgetActivity
        {
            Id = activityId,
            LineItemBudgetId = libId,
            Name = "Core Operations",
            IsDeleted = false,
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = libId,
                    LineItemBudgetActivityId = activityId,
                    ObjectId = Guid.NewGuid(),
                    Budget = 50000m,
                    IsDeleted = false
                }
            }
        };

        return new LineItemBudget
        {
            Id = libId,
            FiscalYearId = Guid.NewGuid(),
            FundSourceId = Guid.NewGuid(),
            OfficeId = Guid.NewGuid(),
            SourceType = "OPCR",
            SourceId = Guid.NewGuid(),
            Scope = "Activity",
            Name = "Test Valid LIB",
            LIBNumber = "LIB-2026-001",
            Status = "Draft",
            LineItemBudgetActivities = new List<LineItemBudgetActivity> { activity }
        };
    }

    [Fact]
    public async Task Handle_SubmitValidDraftLIB_ShouldSucceedAndSetSubmittedDate()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        lib.Status.Should().Be("Submitted");
        lib.SubmittedDate.Should().NotBeNull();
        libRepoMock.Verify(r => r.Update(lib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SubmitDraftLIB_WhenNoActivities_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.LineItemBudgetActivities.Clear(); // No activities

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*At least one LIB Activity is required*");
    }

    [Fact]
    public async Task Handle_SubmitDraftLIB_WhenActivityHasNoExpenditureItems_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.LineItemBudgetActivities.First().LineItemBudgetDetails.Clear(); // Activity with 0 line items

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*has no expenditure line items*");
    }

    [Fact]
    public async Task Handle_SubmitDraftLIB_WhenMissingMetadata_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.FiscalYearId = null;
        lib.OfficeId = null;

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Fiscal Year is required*");
    }

    [Fact]
    public async Task Handle_SubmitAlreadyApprovedLIB_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.Status = "Approved";

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot submit LIB with status 'Approved'*");
    }

    [Fact]
    public async Task Handle_ApproveSubmittedLIB_ShouldSucceedAndSetApprovedDate()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.Status = "Submitted";
        lib.SubmittedDate = DateTime.UtcNow.AddDays(-1);

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Approved");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        lib.Status.Should().Be("Approved");
        lib.ApprovedDate.Should().NotBeNull();
        libRepoMock.Verify(r => r.Update(lib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ApproveDraftLIB_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.Status = "Draft";

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Approved");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot approve LIB with status 'Draft'. Only Submitted LIBs can be approved*");
    }

    [Fact]
    public async Task Handle_ReturnSubmittedLIB_ShouldSucceedAndClearApprovedDate()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.Status = "Submitted";
        lib.ApprovedDate = DateTime.UtcNow;

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Returned");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        lib.Status.Should().Be("Returned");
        lib.ApprovedDate.Should().BeNull();
        libRepoMock.Verify(r => r.Update(lib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnDraftLIB_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.Status = "Draft";

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Returned");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Cannot return LIB with status 'Draft'. Only Submitted LIBs can be returned*");
    }

    [Fact]
    public async Task Handle_SubmitProjectScopedMultiYearLIB_WhenNoFiscalYear_ShouldSucceedAndSetSubmittedDate()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = new LineItemBudget
        {
            Id = libId,
            FiscalYearId = null, // No Fiscal Year for Project-scoped multi-year WFP
            FundSourceId = Guid.NewGuid(),
            OfficeId = Guid.NewGuid(),
            SourceType = "WFP",
            SourceId = Guid.NewGuid(),
            Scope = "Project",
            Name = "Multi-Year Infrastructure Project",
            LIBNumber = "LIB-OFF-WFP-2026-2028-12345678",
            Status = "Draft",
            LineItemBudgetDetails = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = libId,
                    ObjectId = Guid.NewGuid(),
                    Budget = 250000m,
                    IsDeleted = false
                }
            }
        };

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        lib.Status.Should().Be("Submitted");
        lib.SubmittedDate.Should().NotBeNull();
        libRepoMock.Verify(r => r.Update(lib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SubmitActivityScopedMultiYearWFPLIB_WhenNoFiscalYear_ShouldSucceedAndSetSubmittedDate()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.SourceType = "WFP";
        lib.Scope = "Activity";
        lib.FiscalYearId = null; // No FY on multi-year WFP
        lib.LIBNumber = "LIB-NMMEIC-WFP-2026-2027-01a01801"; // Multi-year pattern 2026-2027

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        lib.Status.Should().Be("Submitted");
        lib.SubmittedDate.Should().NotBeNull();
        libRepoMock.Verify(r => r.Update(lib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SubmitActivityScopedSingleYearWFPLIB_WhenNoFiscalYear_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.SourceType = "WFP";
        lib.Scope = "Activity";
        lib.FiscalYearId = null; // Missing FY on single-year WFP
        lib.LIBNumber = "LIB-ITSD-WFP-2026-01a00d65"; // Single-year pattern 2026

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Fiscal Year is required*");
    }

    [Fact]
    public async Task Handle_SubmitActivityScopedOPCRLIB_WhenNoFiscalYear_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.SourceType = "OPCR";
        lib.Scope = "Activity";
        lib.FiscalYearId = null; // Missing FY in OPCR

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Fiscal Year is required*");
    }

    [Fact]
    public async Task Handle_SubmitActivityScopedIndependentLIB_WhenNoFiscalYear_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var lib = CreateCompleteValidLIB(libId);
        lib.SourceType = "Independent";
        lib.SourceId = null;
        lib.Scope = "Activity";
        lib.FiscalYearId = null; // Missing FY in Independent Activity LIB

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var command = new UpdateLIBStatusCommand(libId, "Submitted");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Fiscal Year is required*");
    }
}
