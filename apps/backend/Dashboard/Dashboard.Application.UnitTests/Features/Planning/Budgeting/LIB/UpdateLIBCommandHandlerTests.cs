using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LIB;

public class UpdateLIBCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<IOfficeRepository> officeRepoMock;
    private readonly Mock<IFundSourceRepository> fundSourceRepoMock;
    private readonly Mock<IFiscalYearRepository> fiscalYearRepoMock;
    private readonly UpdateLIBCommandHandler handler;

    public UpdateLIBCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        officeRepoMock = new Mock<IOfficeRepository>();
        fundSourceRepoMock = new Mock<IFundSourceRepository>();
        fiscalYearRepoMock = new Mock<IFiscalYearRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OfficeRepository).Returns(officeRepoMock.Object);
        unitOfWorkMock.Setup(u => u.FundSourceRepository).Returns(fundSourceRepoMock.Object);
        unitOfWorkMock.Setup(u => u.FiscalYearRepository).Returns(fiscalYearRepoMock.Object);

        handler = new UpdateLIBCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_UpdateLIB_WhenStatusIsDraft_ShouldUpdateNameSuccessfully()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var existingLib = new LineItemBudget
        {
            Id = libId,
            Name = "Old LIB Name",
            Status = "Draft",
            LIBNumber = "LIB-2026-001",
            SourceType = "WFP"
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLib);

        var command = new UpdateLIBCommand(libId, new UpdateLIBRequest
        {
            Name = "Updated LIB Name"
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        existingLib.Name.Should().Be("Updated LIB Name");
        libRepoMock.Verify(r => r.Update(existingLib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UpdateLIB_WhenStatusIsApproved_ShouldThrowValidationException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var existingLib = new LineItemBudget
        {
            Id = libId,
            Name = "Approved LIB",
            Status = "Approved"
        };

        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLib);

        var command = new UpdateLIBCommand(libId, new UpdateLIBRequest
        {
            Name = "New Name"
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Only LIBs with status 'Proposed', 'Draft', or 'Returned' can be edited*");
    }

    [Fact]
    public async Task Handle_UpdateLIB_WhenNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        var libId = Guid.NewGuid();
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((LineItemBudget?)null);

        var command = new UpdateLIBCommand(libId, new UpdateLIBRequest
        {
            Name = "New Name"
        });

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*LIB with ID {libId} not found.*");
    }
}
