using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.UpdateProcurementActivityType;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using MediatR;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.ProcurementActivityType;

public class UpdateProcurementActivityTypeCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IProcurementActivityTypeRepository> repoMock;
    private readonly UpdateProcurementActivityTypeCommandHandler handler;
    private readonly List<ERPEZ.Domain.Entities.Planning.ProcurementActivityType> existingEntities;

    public UpdateProcurementActivityTypeCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        repoMock = new Mock<IProcurementActivityTypeRepository>();
        existingEntities = [];

        unitOfWorkMock.Setup(u => u.ProcurementActivityTypeRepository).Returns(repoMock.Object);

        repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .Returns<Guid, CancellationToken>((id, _) =>
                Task.FromResult(existingEntities.FirstOrDefault(e => e.Id == id)));

        repoMock.Setup(r => r.FindAsync(
                It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.ProcurementActivityType, bool>>>(),
                It.IsAny<CancellationToken>()))
            .Returns<Expression<Func<ERPEZ.Domain.Entities.Planning.ProcurementActivityType, bool>>, CancellationToken>(
                (predicate, _) =>
                {
                    var compiled = predicate.Compile();
                    var match = existingEntities.FirstOrDefault(compiled);
                    return Task.FromResult(match);
                });

        handler = new UpdateProcurementActivityTypeCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_UpdatingActivityCode_ToNewUniqueCode_ShouldSucceed()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var entity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = targetId,
            Name = "Initial Activity",
            ActivityCode = "INIT01",
            Description = "Initial description",
            IsDeleted = false
        };
        existingEntities.Add(entity);

        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = targetId,
            ActivityCode = "NEW01"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        entity.ActivityCode.Should().Be("NEW01");
        repoMock.Verify(r => r.Update(entity), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UpdatingActivityCode_ToDuplicateCodeOnAnotherActiveEntity_ShouldThrowConflictException()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var otherId = Guid.NewGuid();

        var targetEntity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = targetId,
            Name = "Target Activity",
            ActivityCode = "ACT01",
            IsDeleted = false
        };

        var otherEntity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = otherId,
            Name = "Other Activity",
            ActivityCode = "ACT02",
            IsDeleted = false
        };

        existingEntities.Add(targetEntity);
        existingEntities.Add(otherEntity);

        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = targetId,
            ActivityCode = "ACT02"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Procurement activity type with code 'ACT02' already exists.");

        targetEntity.ActivityCode.Should().Be("ACT01");
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UpdatingActivityCode_WhenAnotherEntityWithSameCodeIsDeleted_ShouldSucceed()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var deletedId = Guid.NewGuid();

        var targetEntity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = targetId,
            Name = "Target Activity",
            ActivityCode = "ACT01",
            IsDeleted = false
        };

        var deletedEntity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = deletedId,
            Name = "Deleted Activity",
            ActivityCode = "ACT02",
            IsDeleted = true
        };

        existingEntities.Add(targetEntity);
        existingEntities.Add(deletedEntity);

        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = targetId,
            ActivityCode = "ACT02"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        targetEntity.ActivityCode.Should().Be("ACT02");
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UpdatingWithoutChangingActivityCode_ShouldNotTriggerDuplicateCheck()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var entity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = targetId,
            Name = "Original Name",
            ActivityCode = "SAME01",
            Description = "Original description",
            IsDeleted = false
        };
        existingEntities.Add(entity);

        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = targetId,
            ActivityCode = "SAME01",
            Description = "Updated description"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        entity.Description.Should().Be("Updated description");
        entity.ActivityCode.Should().Be("SAME01");
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UpdatingWithNullOrEmptyActivityCode_ShouldNotModifyExistingActivityCode()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var entity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = targetId,
            Name = "Some Activity",
            ActivityCode = "PRESERVE01",
            Description = "Initial Description",
            IsDeleted = false
        };
        existingEntities.Add(entity);

        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = targetId,
            ActivityCode = null,
            Description = "New Description Only"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        entity.ActivityCode.Should().Be("PRESERVE01");
        entity.Description.Should().Be("New Description Only");
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_EntityNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = nonExistentId,
            ActivityCode = "ACT01"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("Procurement activity type not found.");

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UpdatingNameToDuplicateOfAnotherActiveEntity_ShouldThrowConflictException()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var otherId = Guid.NewGuid();

        var targetEntity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = targetId,
            Name = "Target Name",
            ActivityCode = "ACT01",
            IsDeleted = false
        };

        var otherEntity = new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = otherId,
            Name = "Existing Name",
            ActivityCode = "ACT02",
            IsDeleted = false
        };

        existingEntities.Add(targetEntity);
        existingEntities.Add(otherEntity);

        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = targetId,
            Name = "Existing Name"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Procurement activity type with name 'Existing Name' already exists.");

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
