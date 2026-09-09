using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.CreateProcurementActivityType;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.ProcurementActivityType;

public class CreateProcurementActivityTypeCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IProcurementActivityTypeRepository> repoMock;
    private readonly CreateProcurementActivityTypeCommandHandler handler;
    private readonly List<ERPEZ.Domain.Entities.Planning.ProcurementActivityType> existingEntities;

    public CreateProcurementActivityTypeCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        repoMock = new Mock<IProcurementActivityTypeRepository>();
        existingEntities = [];

        unitOfWorkMock.Setup(u => u.ProcurementActivityTypeRepository).Returns(repoMock.Object);

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

        handler = new CreateProcurementActivityTypeCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldSucceedAndPersistActivityCode()
    {
        // Arrange
        ERPEZ.Domain.Entities.Planning.ProcurementActivityType? capturedEntity = null;
        repoMock.Setup(r => r.AddAsync(
                It.IsAny<ERPEZ.Domain.Entities.Planning.ProcurementActivityType>(),
                It.IsAny<CancellationToken>()))
            .Callback<ERPEZ.Domain.Entities.Planning.ProcurementActivityType, CancellationToken>((entity, _) => capturedEntity = entity)
            .Returns(Task.CompletedTask);

        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Public Bidding",
            ActivityCode = "PB01",
            Description = "Standard public bidding activity",
            MinDays = 7,
            MaxDays = 14
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        capturedEntity.Should().NotBeNull();
        capturedEntity!.Name.Should().Be("Public Bidding");
        capturedEntity.ActivityCode.Should().Be("PB01");
        capturedEntity.Description.Should().Be("Standard public bidding activity");
        capturedEntity.MinDays.Should().Be(7);
        capturedEntity.MaxDays.Should().Be(14);
        capturedEntity.IsActive.Should().BeTrue();

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateActivityCode_ShouldThrowConflictException()
    {
        // Arrange
        existingEntities.Add(new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Existing Activity",
            ActivityCode = "PB01",
            IsDeleted = false
        });

        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "New Activity",
            ActivityCode = "PB01",
            Description = "Some description"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Procurement activity type with code 'PB01' already exists.");

        repoMock.Verify(r => r.AddAsync(It.IsAny<ERPEZ.Domain.Entities.Planning.ProcurementActivityType>(), It.IsAny<CancellationToken>()), Times.Never);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_DuplicateActivityCode_WhenPreviousIsDeleted_ShouldSucceed()
    {
        // Arrange
        existingEntities.Add(new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Deleted Activity",
            ActivityCode = "PB01",
            IsDeleted = true
        });

        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "New Active Activity",
            ActivityCode = "PB01",
            Description = "Reusable code from deleted record"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateName_ShouldThrowConflictException()
    {
        // Arrange
        existingEntities.Add(new ERPEZ.Domain.Entities.Planning.ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Advertisement",
            ActivityCode = "ADV01",
            IsDeleted = false
        });

        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Advertisement",
            ActivityCode = "ADV02",
            Description = "Another advertisement"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Procurement activity type with name 'Advertisement' already exists.");

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
