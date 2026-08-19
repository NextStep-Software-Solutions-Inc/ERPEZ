using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LIB;

public class CreateLIBCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<IOfficeRepository> officeRepoMock;
    private readonly Mock<IWFPRepository> wfpRepoMock;
    private readonly Mock<IFundSourceRepository> fundSourceRepoMock;
    private readonly Mock<IFiscalYearRepository> fiscalYearRepoMock;
    private readonly CreateLIBCommandHandler handler;

    public CreateLIBCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        officeRepoMock = new Mock<IOfficeRepository>();
        wfpRepoMock = new Mock<IWFPRepository>();
        fundSourceRepoMock = new Mock<IFundSourceRepository>();
        fiscalYearRepoMock = new Mock<IFiscalYearRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OfficeRepository).Returns(officeRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WFPRepository).Returns(wfpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.FundSourceRepository).Returns(fundSourceRepoMock.Object);
        unitOfWorkMock.Setup(u => u.FiscalYearRepository).Returns(fiscalYearRepoMock.Object);

        handler = new CreateLIBCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_CreateFromWfp_WhenPreviousLibIsDeleted_ShouldSucceed()
    {
        // Arrange
        var officeId = Guid.NewGuid();
        var wfpId = Guid.Parse("01a01519-b601-77bc-8bef-0b4f9de3ed04");
        var fundSourceId = Guid.NewGuid();

        var office = new Office { Id = officeId, Code = "NMMEIC", Name = "NMMEIC Office" };
        var wfp = new WFP
        {
            Id = wfpId,
            ProjectStartDate = new DateOnly(2026, 7, 1),
            ProjectEndDate = new DateOnly(2027, 3, 31),
            OfficeId = officeId
        };
        var fundSource = new FundSource { Id = fundSourceId, Name = "GOP" };

        officeRepoMock.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(office);
        wfpRepoMock.Setup(r => r.GetByIdAsync(wfpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(wfp);
        fundSourceRepoMock.Setup(r => r.GetByIdAsync(fundSourceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(fundSource);

        // Previous LIB was deleted, so searching for active (!IsDeleted) returns null
        libRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<LineItemBudget, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LineItemBudget?)null);

        LineItemBudget? capturedEntity = null;
        libRepoMock.Setup(r => r.AddAsync(It.IsAny<LineItemBudget>(), It.IsAny<CancellationToken>()))
            .Callback<LineItemBudget, CancellationToken>((entity, _) => capturedEntity = entity)
            .Returns(Task.CompletedTask);

        var command = new CreateLIBCommand(new CreateLIBRequest
        {
            OfficeId = officeId,
            FiscalYearId = null,
            FundSourceId = fundSourceId,
            AgencyMasterBudgetId = null,
            ParentLIBId = null,
            ConsolidatedIntoLIBId = null,
            Scope = "Project",
            Level = "Office",
            Name = "FY 2026 NMMEIC Line Item Budget",
            SourceType = "WFP",
            SourceId = wfpId
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        capturedEntity.Should().NotBeNull();
        capturedEntity!.LIBNumber.Should().Be("LIB-NMMEIC-WFP-2026-2027-01a01519");
        capturedEntity.Status.Should().Be("Proposed");
        capturedEntity.IsDeleted.Should().BeFalse();
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CreateFromWfp_WhenActiveLibAlreadyExists_ShouldThrowConflictException()
    {
        // Arrange
        var officeId = Guid.NewGuid();
        var wfpId = Guid.NewGuid();
        var fundSourceId = Guid.NewGuid();

        var office = new Office { Id = officeId, Code = "ITSD", Name = "ITSD Office" };
        var wfp = new WFP
        {
            Id = wfpId,
            ProjectStartDate = new DateOnly(2026, 1, 1),
            ProjectEndDate = new DateOnly(2026, 12, 31),
            OfficeId = officeId
        };
        var fundSource = new FundSource { Id = fundSourceId, Name = "GOP" };
        var activeFiscalYear = new FiscalYear { Id = Guid.NewGuid(), Year = 2026 };

        officeRepoMock.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(office);
        wfpRepoMock.Setup(r => r.GetByIdAsync(wfpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(wfp);
        fundSourceRepoMock.Setup(r => r.GetByIdAsync(fundSourceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(fundSource);
        fiscalYearRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<FiscalYear, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeFiscalYear);

        // An active LIB already exists for this WFP source
        var existingActiveLib = new LineItemBudget
        {
            Id = Guid.NewGuid(),
            SourceType = "WFP",
            SourceId = wfpId,
            IsDeleted = false
        };
        libRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<LineItemBudget, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingActiveLib);

        var command = new CreateLIBCommand(new CreateLIBRequest
        {
            OfficeId = officeId,
            FiscalYearId = null,
            FundSourceId = fundSourceId,
            AgencyMasterBudgetId = null,
            ParentLIBId = null,
            ConsolidatedIntoLIBId = null,
            Scope = "Project",
            Level = "Office",
            Name = "FY 2026 ITSD Project LIB",
            SourceType = "WFP",
            SourceId = wfpId
        });

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("An active LIB already exists for this WFP source.");
        libRepoMock.Verify(r => r.AddAsync(It.IsAny<LineItemBudget>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
