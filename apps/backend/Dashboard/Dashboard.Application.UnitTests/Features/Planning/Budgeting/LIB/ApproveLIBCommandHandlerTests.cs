using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.ApproveLIB;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LIB;

public class ApproveLIBCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<IUserRepository> userRepoMock;
    private readonly Mock<IWorkflowMatrixRepository> matrixRepoMock;
    private readonly Mock<IPersonnelPositionRepository> personnelPositionRepoMock;
    private readonly Mock<ICurrentUserService> currentUserMock;
    private readonly ApproveLIBCommandHandler handler;

    private readonly Guid libId = Guid.NewGuid();
    private readonly Guid fiscalYearId = Guid.NewGuid();
    private readonly Guid officeId = Guid.NewGuid();
    private readonly Guid positionId = Guid.NewGuid();
    private readonly Guid internalUserId = Guid.NewGuid();
    private const string externalId = "keycloak-sub-456";

    public ApproveLIBCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        userRepoMock = new Mock<IUserRepository>();
        matrixRepoMock = new Mock<IWorkflowMatrixRepository>();
        personnelPositionRepoMock = new Mock<IPersonnelPositionRepository>();
        currentUserMock = new Mock<ICurrentUserService>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.UserRepository).Returns(userRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WorkflowMatrixRepository).Returns(matrixRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PersonnelPositionRepository).Returns(personnelPositionRepoMock.Object);

        currentUserMock.Setup(c => c.ExternalIdentityId).Returns(externalId);
        currentUserMock.Setup(c => c.IsSuperAdmin).Returns(false);

        handler = new ApproveLIBCommandHandler(unitOfWorkMock.Object, currentUserMock.Object);
    }

    [Fact]
    public async Task Handle_ApproveLIB_WhenSubmittedAndHoldingPosition_ShouldApprove()
    {
        // Arrange
        var lib = new LineItemBudget
        {
            Id = libId,
            FiscalYearId = fiscalYearId,
            OfficeId = officeId,
            Status = "Submitted"
        };
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var user = new User
        {
            Id = internalUserId,
            ExternalIdentityId = externalId
        };
        userRepoMock.Setup(r => r.GetByExternalIdentityIdAsync(externalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var matrix = new WorkflowMatrix
        {
            FiscalYearId = fiscalYearId,
            OfficeId = officeId,
            DocumentType = "LIB",
            FinalApproverPositionId = positionId
        };
        matrixRepoMock.Setup(m => m.FindAllAsync(It.IsAny<Expression<Func<WorkflowMatrix, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([matrix]);

        personnelPositionRepoMock.Setup(p => p.HasActiveAssignmentAsync(internalUserId, positionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await handler.Handle(new ApproveLIBCommand(libId, IsFinalApproval: true), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        lib.Status.Should().Be("Approved");
        lib.ApprovedDate.Should().NotBeNull();
        libRepoMock.Verify(r => r.Update(lib), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ApproveLIB_WhenNotSubmitted_ShouldThrowValidationException()
    {
        // Arrange
        var lib = new LineItemBudget
        {
            Id = libId,
            FiscalYearId = fiscalYearId,
            OfficeId = officeId,
            Status = "Draft" // Not submitted
        };
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        // Act & Assert
        var act = () => handler.Handle(new ApproveLIBCommand(libId), CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Only Submitted LIBs can be approved.*");
    }

    [Fact]
    public async Task Handle_ApproveLIB_WhenNotHoldingRequiredPosition_ShouldThrowForbiddenException()
    {
        // Arrange
        var lib = new LineItemBudget
        {
            Id = libId,
            FiscalYearId = fiscalYearId,
            OfficeId = officeId,
            Status = "Submitted"
        };
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        var user = new User
        {
            Id = internalUserId,
            ExternalIdentityId = externalId
        };
        userRepoMock.Setup(r => r.GetByExternalIdentityIdAsync(externalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var matrix = new WorkflowMatrix
        {
            FiscalYearId = fiscalYearId,
            OfficeId = officeId,
            DocumentType = "LIB",
            FinalApproverPositionId = positionId
        };
        matrixRepoMock.Setup(m => m.FindAllAsync(It.IsAny<Expression<Func<WorkflowMatrix, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([matrix]);

        personnelPositionRepoMock.Setup(p => p.HasActiveAssignmentAsync(internalUserId, positionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false); // Does NOT hold position

        // Act & Assert
        var act = () => handler.Handle(new ApproveLIBCommand(libId, IsFinalApproval: true), CancellationToken.None);
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*You do not hold the designated Position required to approve this Line Item Budget.*");
    }
}
