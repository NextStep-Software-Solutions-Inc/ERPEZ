using ERPEZ.Application.Features.Planning.APPItem.Commands.CreateAPPItem;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Planning.APPItem;

public class CreateAPPItemCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IAPPRepository> appRepoMock;
    private readonly Mock<IPPMPItemRepository> ppmpItemRepoMock;
    private readonly Mock<IProcurementModeRepository> procurementModeRepoMock;
    private readonly Mock<IFundSourceRepository> fundSourceRepoMock;
    private readonly Mock<IOfficeRepository> officeRepoMock;
    private readonly Mock<IAPPItemRepository> appItemRepoMock;
    private readonly CreateAPPItemCommandHandler handler;

    public CreateAPPItemCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        appRepoMock = new Mock<IAPPRepository>();
        ppmpItemRepoMock = new Mock<IPPMPItemRepository>();
        procurementModeRepoMock = new Mock<IProcurementModeRepository>();
        fundSourceRepoMock = new Mock<IFundSourceRepository>();
        officeRepoMock = new Mock<IOfficeRepository>();
        appItemRepoMock = new Mock<IAPPItemRepository>();

        unitOfWorkMock.Setup(u => u.APPRepository).Returns(appRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPItemRepository).Returns(ppmpItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ProcurementModeRepository).Returns(procurementModeRepoMock.Object);
        unitOfWorkMock.Setup(u => u.FundSourceRepository).Returns(fundSourceRepoMock.Object);
        unitOfWorkMock.Setup(u => u.OfficeRepository).Returns(officeRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPItemRepository).Returns(appItemRepoMock.Object);

        handler = new CreateAPPItemCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenPAPCodeEmpty_ShouldInheritFromPPMPItem()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var ppmpItemId = Guid.NewGuid();
        var procurementModeId = Guid.NewGuid();
        var fundSourceId = Guid.NewGuid();
        var officeId = Guid.NewGuid();

        var app = new Domain.Entities.Planning.APP { Id = appId, APPType = "Original" };
        var ppmpItem = new Domain.Entities.Planning.PPMPItem
        {
            Id = ppmpItemId,
            PAPCode = "2026-17-21335",
            PPMPExpenditureItem = new PPMPExpenditureItem
            {
                PPMP = new PPMP { FundSourceId = fundSourceId, OfficeId = officeId }
            }
        };

        appRepoMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        ppmpItemRepoMock.Setup(r => r.GetByIdWithDetailsAsync(ppmpItemId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpItem);
        procurementModeRepoMock.Setup(r => r.GetByIdAsync(procurementModeId, It.IsAny<CancellationToken>())).ReturnsAsync(new ProcurementMode());
        fundSourceRepoMock.Setup(r => r.GetByIdAsync(fundSourceId, It.IsAny<CancellationToken>())).ReturnsAsync(new FundSource());
        officeRepoMock.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>())).ReturnsAsync(new Office());
        appItemRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Domain.Entities.Planning.APPItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Planning.APPItem?)null);

        var command = new CreateAPPItemCommand
        {
            APPId = appId,
            PPMPItemId = ppmpItemId,
            ProcurementModeId = procurementModeId,
            PAPCode = string.Empty
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        appItemRepoMock.Verify(r => r.AddAsync(It.Is<Domain.Entities.Planning.APPItem>(a =>
            a.PAPCode == "2026-17-21335"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPPMPItemPAPCodeEmpty_ShouldInheritFromLIBActivity()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var ppmpItemId = Guid.NewGuid();
        var procurementModeId = Guid.NewGuid();
        var fundSourceId = Guid.NewGuid();
        var officeId = Guid.NewGuid();

        var app = new Domain.Entities.Planning.APP { Id = appId, APPType = "Original" };
        var ppmpItem = new Domain.Entities.Planning.PPMPItem
        {
            Id = ppmpItemId,
            PAPCode = null,
            PPMPExpenditureItem = new PPMPExpenditureItem
            {
                PPMP = new PPMP { FundSourceId = fundSourceId, OfficeId = officeId },
                PPMPActivity = new PPMPActivity
                {
                    LIBActivity = new LineItemBudgetActivity
                    {
                        PAPCode = "2026-17-21335"
                    }
                }
            }
        };

        appRepoMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        ppmpItemRepoMock.Setup(r => r.GetByIdWithDetailsAsync(ppmpItemId, It.IsAny<CancellationToken>())).ReturnsAsync(ppmpItem);
        procurementModeRepoMock.Setup(r => r.GetByIdAsync(procurementModeId, It.IsAny<CancellationToken>())).ReturnsAsync(new ProcurementMode());
        fundSourceRepoMock.Setup(r => r.GetByIdAsync(fundSourceId, It.IsAny<CancellationToken>())).ReturnsAsync(new FundSource());
        officeRepoMock.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>())).ReturnsAsync(new Office());
        appItemRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Domain.Entities.Planning.APPItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Planning.APPItem?)null);

        var command = new CreateAPPItemCommand
        {
            APPId = appId,
            PPMPItemId = ppmpItemId,
            ProcurementModeId = procurementModeId,
            PAPCode = ""
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        appItemRepoMock.Verify(r => r.AddAsync(It.Is<Domain.Entities.Planning.APPItem>(a =>
            a.PAPCode == "2026-17-21335"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
