using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetails;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Sieve.Models;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LineItemBudgetDetail;

public class GetLineItemBudgetDetailsQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetDetailRepository> libDetailRepoMock;
    private readonly GetLineItemBudgetDetailsQueryHandler handler;

    public GetLineItemBudgetDetailsQueryHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libDetailRepoMock = new Mock<ILineItemBudgetDetailRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetDetailRepository).Returns(libDetailRepoMock.Object);

        handler = new GetLineItemBudgetDetailsQueryHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WfpActivityScope_FilterByActivityA_ShouldPassActivityFilterAndReturnActivityAItemsOnly()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var activityAId = Guid.NewGuid();
        var activityBId = Guid.NewGuid();

        var itemA = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityAId,
            Description = "Item A for Activity A",
            Budget = 50000m,
            TimelineType = "Quarterly"
        };

        SieveModel? capturedSieveModel = null;
        libDetailRepoMock.Setup(r => r.GetAllWithDetailsAsync(It.IsAny<SieveModel>(), It.IsAny<CancellationToken>()))
            .Callback<SieveModel, CancellationToken>((sieve, _) => capturedSieveModel = sieve)
            .ReturnsAsync((new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail> { itemA }, 1));

        var query = new GetLineItemBudgetDetailsQuery
        {
            PageNumber = 1,
            PageSize = 1000,
            Filters = $"lineItemBudgetId=={libId},lineItemBudgetActivityId=={activityAId}",
            Sorts = null
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        result.Data!.First().LineItemBudgetActivityId.Should().Be(activityAId);
        result.Data!.First().Description.Should().Be("Item A for Activity A");

        capturedSieveModel.Should().NotBeNull();
        capturedSieveModel!.Filters.Should().Be($"lineItemBudgetId=={libId},lineItemBudgetActivityId=={activityAId}");
    }

    [Fact]
    public async Task Handle_WfpActivityScope_FilterByActivityB_ShouldPassActivityFilterAndReturnActivityBItemsOnly()
    {
        // Arrange
        var libId = Guid.NewGuid();
        var activityBId = Guid.NewGuid();

        var itemB = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = activityBId,
            Description = "Item B for Activity B",
            Budget = 75000m,
            TimelineType = "Quarterly"
        };

        SieveModel? capturedSieveModel = null;
        libDetailRepoMock.Setup(r => r.GetAllWithDetailsAsync(It.IsAny<SieveModel>(), It.IsAny<CancellationToken>()))
            .Callback<SieveModel, CancellationToken>((sieve, _) => capturedSieveModel = sieve)
            .ReturnsAsync((new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail> { itemB }, 1));

        var query = new GetLineItemBudgetDetailsQuery
        {
            PageNumber = 1,
            PageSize = 1000,
            Filters = $"lineItemBudgetId=={libId},lineItemBudgetActivityId=={activityBId}",
            Sorts = null
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        result.Data!.First().LineItemBudgetActivityId.Should().Be(activityBId);
        result.Data!.First().Description.Should().Be("Item B for Activity B");

        capturedSieveModel.Should().NotBeNull();
        capturedSieveModel!.Filters.Should().Be($"lineItemBudgetId=={libId},lineItemBudgetActivityId=={activityBId}");
    }

    [Fact]
    public async Task Handle_WfpProjectScope_FilterByLibIdOnly_ShouldReturnAllProjectItems()
    {
        // Arrange
        var libId = Guid.NewGuid();

        var item1 = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = null,
            Description = "Project Item 1",
            Budget = 100000m,
            TimelineType = "Quarterly"
        };
        var item2 = new ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = libId,
            LineItemBudgetActivityId = null,
            Description = "Project Item 2",
            Budget = 200000m,
            TimelineType = "Quarterly"
        };

        SieveModel? capturedSieveModel = null;
        libDetailRepoMock.Setup(r => r.GetAllWithDetailsAsync(It.IsAny<SieveModel>(), It.IsAny<CancellationToken>()))
            .Callback<SieveModel, CancellationToken>((sieve, _) => capturedSieveModel = sieve)
            .ReturnsAsync((new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail> { item1, item2 }, 2));

        var query = new GetLineItemBudgetDetailsQuery
        {
            PageNumber = 1,
            PageSize = 1000,
            Filters = $"lineItemBudgetId=={libId}",
            Sorts = null
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);

        capturedSieveModel.Should().NotBeNull();
        capturedSieveModel!.Filters.Should().Be($"lineItemBudgetId=={libId}");
    }
}
