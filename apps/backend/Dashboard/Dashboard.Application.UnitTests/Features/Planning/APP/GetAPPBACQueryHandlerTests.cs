using ERPEZ.Application.Features.Planning.APP.Queries.GetAPPBAC;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.APP;

public class GetAPPBACQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IAPPRepository> appRepoMock;
    private readonly Mock<IAPPItemRepository> appItemRepoMock;
    private readonly GetAPPBACQueryHandler handler;

    public GetAPPBACQueryHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        appRepoMock = new Mock<IAPPRepository>();
        appItemRepoMock = new Mock<IAPPItemRepository>();

        unitOfWorkMock.Setup(u => u.APPRepository).Returns(appRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPItemRepository).Returns(appItemRepoMock.Object);

        handler = new GetAPPBACQueryHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenAPPItemHasPAPCode_ShouldPopulatePAPCodeInLineItemAndUnitItemResponse()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new ERPEZ.Domain.Entities.Planning.APP { Id = appId };

        var appItem = new ERPEZ.Domain.Entities.Planning.APPItem
        {
            Id = Guid.NewGuid(),
            APPId = appId,
            PAPCode = "2026-17-21335",
            PPMPItem = new PPMPItem
            {
                Name = "Reproduction of contracts",
                Unit = "Lot",
                UnitPrice = 1000m,
                PAPCode = "2026-17-21335"
            },
            Office = new Office { Name = "HRMO" },
            ProcurementMode = new ProcurementMode { Name = "Small Value Procurement" }
        };

        appRepoMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        appItemRepoMock.Setup(r => r.GetAPPItemsWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.APPItem> { appItem });

        var query = new GetAPPBACQuery(appId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.LineItems.Should().HaveCount(1);
        result.Data.LineItems[0].PAPCode.Should().Be("2026-17-21335");

        result.Data.AggregationsByUnit.Should().HaveCount(1);
        result.Data.AggregationsByUnit[0].Items.Should().HaveCount(1);
        result.Data.AggregationsByUnit[0].Items[0].PPMPCode.Should().Be("2026-17-21335");
    }

    [Fact]
    public async Task Handle_WhenPAPCodeInheritedFromLIBActivity_ShouldResolveInBACResponse()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new ERPEZ.Domain.Entities.Planning.APP { Id = appId };

        var appItem = new ERPEZ.Domain.Entities.Planning.APPItem
        {
            Id = Guid.NewGuid(),
            APPId = appId,
            PAPCode = string.Empty,
            PPMPItem = new PPMPItem
            {
                Name = "Reproduction of contracts",
                Unit = "Lot",
                UnitPrice = 1000m,
                PAPCode = null,
                PPMPExpenditureItem = new ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem
                {
                    PPMPActivity = new PPMPActivity
                    {
                        LIBActivity = new LineItemBudgetActivity
                        {
                            PAPCode = "2026-17-21335"
                        }
                    }
                }
            },
            Office = new Office { Name = "HRMO" },
            ProcurementMode = new ProcurementMode { Name = "Small Value Procurement" }
        };

        appRepoMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        appItemRepoMock.Setup(r => r.GetAPPItemsWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.APPItem> { appItem });

        var query = new GetAPPBACQuery(appId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.LineItems.Should().HaveCount(1);
        result.Data.LineItems[0].PAPCode.Should().Be("2026-17-21335");
        result.Data.AggregationsByUnit[0].Items[0].PPMPCode.Should().Be("2026-17-21335");
    }
}
