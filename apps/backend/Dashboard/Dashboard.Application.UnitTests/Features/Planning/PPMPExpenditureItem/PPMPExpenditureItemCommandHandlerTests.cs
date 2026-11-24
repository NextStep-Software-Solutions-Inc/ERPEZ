using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.UpdatePPMPExpenditureItem;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.PPMPExpenditureItem;

public class PPMPExpenditureItemCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IPPMPActivityRepository> ppmpActivityRepoMock;
    private readonly Mock<IPPMPExpenditureItemRepository> ppmpExpenditureRepoMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<ILineItemBudgetDetailRepository> libDetailRepoMock;
    private readonly Mock<IObjectRepository> objectRepoMock;

    private readonly CreatePPMPExpenditureItemCommandHandler createHandler;
    private readonly UpdatePPMPExpenditureItemCommandHandler updateHandler;

    public PPMPExpenditureItemCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        ppmpActivityRepoMock = new Mock<IPPMPActivityRepository>();
        ppmpExpenditureRepoMock = new Mock<IPPMPExpenditureItemRepository>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        libDetailRepoMock = new Mock<ILineItemBudgetDetailRepository>();
        objectRepoMock = new Mock<IObjectRepository>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPActivityRepository).Returns(ppmpActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPExpenditureItemRepository).Returns(ppmpExpenditureRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetDetailRepository).Returns(libDetailRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ObjectRepository).Returns(objectRepoMock.Object);

        createHandler = new CreatePPMPExpenditureItemCommandHandler(unitOfWorkMock.Object);
        updateHandler = new UpdatePPMPExpenditureItemCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Create_ValidObjectUnderLIBActivity_ShouldSucceed()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var libId = Guid.NewGuid();
        var ppmpActivityId = Guid.NewGuid();
        var libActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

        var ppmp = new PPMP { Id = ppmpId, LIBId = libId };
        var lib = new LineItemBudget { Id = libId, Scope = nameof(BudgetScope.ActivityLevel) };
        var ppmpActivity = new PPMPActivity { Id = ppmpActivityId, PPMPId = ppmpId, LIBActivityId = libActivityId };
        var obj = new ERPEZ.Domain.Entities.Planning.Object { Id = objectId, Name = "Salaries and Wages", Code = "50101010" };
        var libDetail = new LineItemBudgetDetail { Id = Guid.NewGuid(), LineItemBudgetActivityId = libActivityId, ObjectId = objectId };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>())).ReturnsAsync(lib);
        ppmpActivityRepoMock.Setup(r => r.GetByIdAsync(ppmpActivityId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpActivity);
        objectRepoMock.Setup(r => r.GetByIdAsync(objectId, It.IsAny<CancellationToken>())).ReturnsAsync(obj);

        libDetailRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LineItemBudgetDetail, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(libDetail);

        ppmpExpenditureRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem?)null);

        var command = new CreatePPMPExpenditureItemCommand
        {
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = objectId,
            IsProcurable = true
        };

        // Act
        var result = await createHandler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        ppmpExpenditureRepoMock.Verify(r => r.AddAsync(It.Is<ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem>(e =>
            e.PPMPId == ppmpId &&
            e.PPMPActivityId == ppmpActivityId &&
            e.ObjectId == objectId &&
            e.IsProcurable == true
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Create_ObjectNotConfiguredUnderLIBActivity_ShouldThrowBadRequestException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var libId = Guid.NewGuid();
        var ppmpActivityId = Guid.NewGuid();
        var libActivityId = Guid.NewGuid();
        var unconfiguredObjectId = Guid.NewGuid();

        var ppmp = new PPMP { Id = ppmpId, LIBId = libId };
        var lib = new LineItemBudget { Id = libId, Scope = nameof(BudgetScope.ActivityLevel) };
        var ppmpActivity = new PPMPActivity { Id = ppmpActivityId, PPMPId = ppmpId, LIBActivityId = libActivityId };
        var obj = new ERPEZ.Domain.Entities.Planning.Object { Id = unconfiguredObjectId, Name = "Global Unrelated Object", Code = "99999999" };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>())).ReturnsAsync(lib);
        ppmpActivityRepoMock.Setup(r => r.GetByIdAsync(ppmpActivityId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpActivity);
        objectRepoMock.Setup(r => r.GetByIdAsync(unconfiguredObjectId, It.IsAny<CancellationToken>())).ReturnsAsync(obj);

        // Not found in this activity
        libDetailRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LineItemBudgetDetail, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LineItemBudgetDetail?)null);

        var command = new CreatePPMPExpenditureItemCommand
        {
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = unconfiguredObjectId,
            IsProcurable = true
        };

        // Act & Assert
        var act = () => createHandler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("The selected object code does not belong to the selected activity.");
    }

    [Fact]
    public async Task Create_DuplicateExpenditureItemInSameActivity_ShouldThrowConflictException()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var libId = Guid.NewGuid();
        var ppmpActivityId = Guid.NewGuid();
        var libActivityId = Guid.NewGuid();
        var objectId = Guid.NewGuid();

        var ppmp = new PPMP { Id = ppmpId, LIBId = libId };
        var lib = new LineItemBudget { Id = libId, Scope = nameof(BudgetScope.ActivityLevel) };
        var ppmpActivity = new PPMPActivity { Id = ppmpActivityId, PPMPId = ppmpId, LIBActivityId = libActivityId };
        var obj = new ERPEZ.Domain.Entities.Planning.Object { Id = objectId, Name = "Salaries and Wages", Code = "50101010" };
        var libDetail = new LineItemBudgetDetail { Id = Guid.NewGuid(), LineItemBudgetActivityId = libActivityId, ObjectId = objectId };
        var existing = new ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = Guid.NewGuid(),
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = objectId
        };

        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>())).ReturnsAsync(lib);
        ppmpActivityRepoMock.Setup(r => r.GetByIdAsync(ppmpActivityId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpActivity);
        objectRepoMock.Setup(r => r.GetByIdAsync(objectId, It.IsAny<CancellationToken>())).ReturnsAsync(obj);

        libDetailRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LineItemBudgetDetail, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(libDetail);

        ppmpExpenditureRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var command = new CreatePPMPExpenditureItemCommand
        {
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = objectId,
            IsProcurable = true
        };

        // Act & Assert
        var act = () => createHandler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("An expenditure item for this object already exists under the selected activity.");
    }

    [Fact]
    public async Task Update_ValidObjectUnderLIBActivity_ShouldSucceed()
    {
        // Arrange
        var expenditureItemId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();
        var libId = Guid.NewGuid();
        var ppmpActivityId = Guid.NewGuid();
        var libActivityId = Guid.NewGuid();
        var oldObjectId = Guid.NewGuid();
        var newObjectId = Guid.NewGuid();

        var existingEntity = new ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = expenditureItemId,
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = oldObjectId,
            IsProcurable = true
        };

        var ppmp = new PPMP { Id = ppmpId, LIBId = libId };
        var lib = new LineItemBudget { Id = libId, Scope = nameof(BudgetScope.ActivityLevel) };
        var ppmpActivity = new PPMPActivity { Id = ppmpActivityId, PPMPId = ppmpId, LIBActivityId = libActivityId };
        var newObj = new ERPEZ.Domain.Entities.Planning.Object { Id = newObjectId, Name = "Travelling Expenses", Code = "50201010" };
        var libDetail = new LineItemBudgetDetail { Id = Guid.NewGuid(), LineItemBudgetActivityId = libActivityId, ObjectId = newObjectId };

        ppmpExpenditureRepoMock.Setup(r => r.GetByIdAsync(expenditureItemId, It.IsAny<CancellationToken>())).ReturnsAsync(existingEntity);
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>())).ReturnsAsync(lib);
        ppmpActivityRepoMock.Setup(r => r.GetByIdAsync(ppmpActivityId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpActivity);
        objectRepoMock.Setup(r => r.GetByIdAsync(newObjectId, It.IsAny<CancellationToken>())).ReturnsAsync(newObj);

        libDetailRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LineItemBudgetDetail, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(libDetail);

        ppmpExpenditureRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem?)null);

        var command = new UpdatePPMPExpenditureItemCommand
        {
            Id = expenditureItemId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = newObjectId,
            IsProcurable = false
        };

        // Act
        var result = await updateHandler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        existingEntity.ObjectId.Should().Be(newObjectId);
        existingEntity.IsProcurable.Should().BeFalse();

        ppmpExpenditureRepoMock.Verify(r => r.Update(existingEntity), Times.Once);
    }

    [Fact]
    public async Task Update_ObjectNotConfiguredUnderLIBActivity_ShouldThrowBadRequestException()
    {
        // Arrange
        var expenditureItemId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();
        var libId = Guid.NewGuid();
        var ppmpActivityId = Guid.NewGuid();
        var libActivityId = Guid.NewGuid();
        var oldObjectId = Guid.NewGuid();
        var unconfiguredObjectId = Guid.NewGuid();

        var existingEntity = new ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = expenditureItemId,
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = oldObjectId,
            IsProcurable = true
        };

        var ppmp = new PPMP { Id = ppmpId, LIBId = libId };
        var lib = new LineItemBudget { Id = libId, Scope = nameof(BudgetScope.ActivityLevel) };
        var ppmpActivity = new PPMPActivity { Id = ppmpActivityId, PPMPId = ppmpId, LIBActivityId = libActivityId };
        var unconfiguredObj = new ERPEZ.Domain.Entities.Planning.Object { Id = unconfiguredObjectId, Name = "Unconfigured Object", Code = "88888888" };

        ppmpExpenditureRepoMock.Setup(r => r.GetByIdAsync(expenditureItemId, It.IsAny<CancellationToken>())).ReturnsAsync(existingEntity);
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        libRepoMock.Setup(r => r.GetByIdAsync(libId, It.IsAny<CancellationToken>())).ReturnsAsync(lib);
        ppmpActivityRepoMock.Setup(r => r.GetByIdAsync(ppmpActivityId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpActivity);
        objectRepoMock.Setup(r => r.GetByIdAsync(unconfiguredObjectId, It.IsAny<CancellationToken>())).ReturnsAsync(unconfiguredObj);

        // Not in this activity
        libDetailRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LineItemBudgetDetail, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LineItemBudgetDetail?)null);

        var command = new UpdatePPMPExpenditureItemCommand
        {
            Id = expenditureItemId,
            PPMPActivityId = ppmpActivityId,
            ObjectId = unconfiguredObjectId,
            IsProcurable = false
        };

        // Act & Assert
        var act = () => updateHandler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("The selected object code does not belong to the selected activity.");
    }
}
