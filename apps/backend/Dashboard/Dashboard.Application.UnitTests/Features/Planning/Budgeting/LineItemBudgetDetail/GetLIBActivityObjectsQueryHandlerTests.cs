using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLIBActivityObjects;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.Budgeting.LineItemBudgetDetail;

public class GetLIBActivityObjectsQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetDetailRepository> libDetailRepoMock;
    private readonly GetLIBActivityObjectsQueryHandler handler;

    public GetLIBActivityObjectsQueryHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libDetailRepoMock = new Mock<ILineItemBudgetDetailRepository>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetDetailRepository).Returns(libDetailRepoMock.Object);

        handler = new GetLIBActivityObjectsQueryHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ActivityWithMultipleCategoriesAndDetails_ShouldGroupIntoParentAndChildHierarchy()
    {
        // Arrange
        var activityId = Guid.NewGuid();
        var psParentId = Guid.NewGuid();
        var mooeParentId = Guid.NewGuid();

        var salariesId = Guid.NewGuid();
        var travellingId = Guid.NewGuid();
        var trainingId = Guid.NewGuid();

        var detailsList = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>
        {
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetActivityId = activityId,
                ObjectId = salariesId,
                Budget = 100000m,
                Object = new ERPEZ.Domain.Entities.Planning.Object
                {
                    Id = salariesId,
                    Code = "50101010",
                    Name = "Salaries and Wages",
                    ParentId = psParentId,
                    ParentObject = new ERPEZ.Domain.Entities.Planning.Object
                    {
                        Id = psParentId,
                        Code = "50100000",
                        Name = "Personnel Services"
                    }
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetActivityId = activityId,
                ObjectId = salariesId,
                Budget = 50000m, // Second allocation for same salaries object
                Object = new ERPEZ.Domain.Entities.Planning.Object
                {
                    Id = salariesId,
                    Code = "50101010",
                    Name = "Salaries and Wages",
                    ParentId = psParentId,
                    ParentObject = new ERPEZ.Domain.Entities.Planning.Object
                    {
                        Id = psParentId,
                        Code = "50100000",
                        Name = "Personnel Services"
                    }
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetActivityId = activityId,
                ObjectId = travellingId,
                Budget = 30000m,
                Object = new ERPEZ.Domain.Entities.Planning.Object
                {
                    Id = travellingId,
                    Code = "50201010",
                    Name = "Travelling Expenses",
                    ParentId = mooeParentId,
                    ParentObject = new ERPEZ.Domain.Entities.Planning.Object
                    {
                        Id = mooeParentId,
                        Code = "50200000",
                        Name = "Maintenance and Other Operating Expenses"
                    }
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetActivityId = activityId,
                ObjectId = trainingId,
                Budget = 25000m,
                Object = new ERPEZ.Domain.Entities.Planning.Object
                {
                    Id = trainingId,
                    Code = "50202010",
                    Name = "Training Expenses",
                    ParentId = mooeParentId,
                    ParentObject = new ERPEZ.Domain.Entities.Planning.Object
                    {
                        Id = mooeParentId,
                        Code = "50200000",
                        Name = "Maintenance and Other Operating Expenses"
                    }
                }
            }
        };

        libDetailRepoMock.Setup(r => r.Query(It.IsAny<System.Linq.Expressions.Expression<Func<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail, bool>>>(), It.IsAny<bool?>()))
            .Returns(detailsList.AsQueryable());

        libDetailRepoMock.Setup(r => r.ToListAsync(It.IsAny<IQueryable<LIBActivityDetailRawProjection>>(), It.IsAny<CancellationToken>()))
            .Returns<IQueryable<LIBActivityDetailRawProjection>, CancellationToken>((q, _) => Task.FromResult(q.ToList()));

        var query = new GetLIBActivityObjectsQuery(activityId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);

        var psGroup = result.Data!.FirstOrDefault(g => g.ParentObjectName == "Personnel Services");
        psGroup.Should().NotBeNull();
        psGroup!.ParentObjectId.Should().Be(psParentId);
        psGroup.ParentObjectCode.Should().Be("50100000");
        psGroup.Items.Should().HaveCount(1);
        psGroup.Items[0].Id.Should().Be(salariesId);
        psGroup.Items[0].Name.Should().Be("Salaries and Wages");
        psGroup.Items[0].TotalBudget.Should().Be(150000m); // 100k + 50k summed

        var mooeGroup = result.Data!.FirstOrDefault(g => g.ParentObjectName == "Maintenance and Other Operating Expenses");
        mooeGroup.Should().NotBeNull();
        mooeGroup!.ParentObjectId.Should().Be(mooeParentId);
        mooeGroup.ParentObjectCode.Should().Be("50200000");
        mooeGroup.Items.Should().HaveCount(2);

        var travelItem = mooeGroup.Items.FirstOrDefault(i => i.Name == "Travelling Expenses");
        travelItem.Should().NotBeNull();
        travelItem!.Id.Should().Be(travellingId);
        travelItem.TotalBudget.Should().Be(30000m);

        var trainItem = mooeGroup.Items.FirstOrDefault(i => i.Name == "Training Expenses");
        trainItem.Should().NotBeNull();
        trainItem!.Id.Should().Be(trainingId);
        trainItem.TotalBudget.Should().Be(25000m);
    }

    [Fact]
    public async Task Handle_ActivityWithNoDetails_ShouldReturnEmptyList()
    {
        // Arrange
        var activityId = Guid.NewGuid();
        var emptyList = new List<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail>();

        libDetailRepoMock.Setup(r => r.Query(It.IsAny<System.Linq.Expressions.Expression<Func<ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail, bool>>>(), It.IsAny<bool?>()))
            .Returns(emptyList.AsQueryable());

        libDetailRepoMock.Setup(r => r.ToListAsync(It.IsAny<IQueryable<LIBActivityDetailRawProjection>>(), It.IsAny<CancellationToken>()))
            .Returns<IQueryable<LIBActivityDetailRawProjection>, CancellationToken>((q, _) => Task.FromResult(q.ToList()));

        var query = new GetLIBActivityObjectsQuery(activityId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().BeEmpty();
    }
}
