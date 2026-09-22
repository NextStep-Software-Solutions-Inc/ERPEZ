using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Sieve.Models;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LIB;

public class GetLIBsQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly GetLIBsQueryHandler handler;

    public GetLIBsQueryHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        handler = new GetLIBsQueryHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnLIBsWithActivitiesAndActivityCount()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var activity1 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Procurement of Laptops",
            LineItemBudgetId = libId,
            IsDeleted = false
        };
        var activity2 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Network Upgrade",
            LineItemBudgetId = libId,
            IsDeleted = false
        };
        var deletedActivity = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Deleted Activity",
            LineItemBudgetId = libId,
            IsDeleted = true
        };

        var lib = new LineItemBudget
        {
            Id = libId,
            Name = "FY 2026 ICT Division Budget",
            LIBNumber = "LIB-ITSD-2026-001",
            SourceType = "OPCR",
            Scope = "Activity",
            Level = "Office",
            Status = "Proposed",
            CreatedAt = now,
            LineItemBudgetActivities = [activity1, activity2, deletedActivity]
        };

        libRepoMock
            .Setup(r => r.GetAllWithDetailsAsync(It.IsAny<SieveModel>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(([lib], 1));

        var query = new GetLIBsQuery { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);

        var item = result.Data.First();
        item.Id.Should().Be(libId);
        item.Name.Should().Be("FY 2026 ICT Division Budget");
        item.CreatedAt.Should().Be(now);
        item.ActivityCount.Should().Be(2);
        item.Activities.Should().HaveCount(2);
        item.Activities.Select(a => a.Name).Should().Contain(["Procurement of Laptops", "Network Upgrade"]);
    }
}
