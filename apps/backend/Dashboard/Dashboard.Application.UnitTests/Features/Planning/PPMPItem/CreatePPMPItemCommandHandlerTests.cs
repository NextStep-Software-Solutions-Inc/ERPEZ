using ERPEZ.Application.Features.Planning.PPMPItem.Commands.CreatePPMPItem;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Planning.PPMPItem;

public class CreatePPMPItemCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPExpenditureItemRepository> ppmpExpenditureItemRepoMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IPPMPActivityRepository> ppmpActivityRepoMock;
    private readonly Mock<ILineItemBudgetActivityRepository> libActivityRepoMock;
    private readonly Mock<IProcurementModeRepository> procurementModeRepoMock;
    private readonly Mock<IPPMPItemRepository> ppmpItemRepoMock;
    private readonly Mock<IProcurementItemRepository> procurementItemRepoMock;
    private readonly Mock<INonCSEItemRepository> nonCseItemRepoMock;
    private readonly CreatePPMPItemCommandHandler handler;

    public CreatePPMPItemCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpExpenditureItemRepoMock = new Mock<IPPMPExpenditureItemRepository>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        ppmpActivityRepoMock = new Mock<IPPMPActivityRepository>();
        libActivityRepoMock = new Mock<ILineItemBudgetActivityRepository>();
        procurementModeRepoMock = new Mock<IProcurementModeRepository>();
        ppmpItemRepoMock = new Mock<IPPMPItemRepository>();
        procurementItemRepoMock = new Mock<IProcurementItemRepository>();
        nonCseItemRepoMock = new Mock<INonCSEItemRepository>();

        unitOfWorkMock.Setup(u => u.PPMPExpenditureItemRepository).Returns(ppmpExpenditureItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPActivityRepository).Returns(ppmpActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetActivityRepository).Returns(libActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ProcurementModeRepository).Returns(procurementModeRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPItemRepository).Returns(ppmpItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ProcurementItemRepository).Returns(procurementItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.NonCSEItemRepository).Returns(nonCseItemRepoMock.Object);

        handler = new CreatePPMPItemCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WhenPAPCodeNotProvided_ShouldInheritFromLIBActivity()
    {
        // Arrange
        var expenditureItemId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();
        var ppmpActivityId = Guid.NewGuid();
        var libActivityId = Guid.NewGuid();
        var procurementModeId = Guid.NewGuid();

        var expenditureItem = new Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = expenditureItemId,
            PPMPId = ppmpId,
            PPMPActivityId = ppmpActivityId
        };

        var ppmp = new PPMP
        {
            Id = ppmpId,
            Status = StatusEnum.Draft
        };

        var ppmpActivity = new Domain.Entities.Planning.PPMPActivity
        {
            Id = ppmpActivityId,
            LIBActivityId = libActivityId
        };

        var libActivity = new LineItemBudgetActivity
        {
            Id = libActivityId,
            PAPCode = "2026-17-21335"
        };

        var procurementMode = new Domain.Entities.Planning.ProcurementMode
        {
            Id = procurementModeId,
            Name = "Small Value Procurement"
        };

        ppmpExpenditureItemRepoMock.Setup(r => r.GetByIdAsync(expenditureItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expenditureItem);
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);
        ppmpActivityRepoMock.Setup(r => r.GetByIdAsync(ppmpActivityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmpActivity);
        libActivityRepoMock.Setup(r => r.GetByIdAsync(libActivityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(libActivity);
        procurementModeRepoMock.Setup(r => r.GetByIdAsync(procurementModeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(procurementMode);

        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = expenditureItemId,
            ProcurementModeId = procurementModeId,
            PAPCode = null,
            Name = "Reproduction Services",
            Unit = "Lot",
            UnitPrice = 50000m,
            PlannedQuantity = 1,
            ProjectType = ProcurementProjectType.Goods
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmpItemRepoMock.Verify(r => r.AddAsync(It.Is<Domain.Entities.Planning.PPMPItem>(i =>
            i.PAPCode == "2026-17-21335"), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPAPCodeExplicitlyProvided_ShouldUseProvidedPAPCode()
    {
        // Arrange
        var expenditureItemId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();
        var procurementModeId = Guid.NewGuid();

        var expenditureItem = new Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = expenditureItemId,
            PPMPId = ppmpId
        };

        var ppmp = new PPMP
        {
            Id = ppmpId,
            Status = StatusEnum.Draft
        };

        var procurementMode = new Domain.Entities.Planning.ProcurementMode
        {
            Id = procurementModeId,
            Name = "Direct Contracting"
        };

        ppmpExpenditureItemRepoMock.Setup(r => r.GetByIdAsync(expenditureItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expenditureItem);
        ppmpRepoMock.Setup(r => r.GetByIdAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);
        procurementModeRepoMock.Setup(r => r.GetByIdAsync(procurementModeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(procurementMode);

        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = expenditureItemId,
            ProcurementModeId = procurementModeId,
            PAPCode = "CUSTOM-PAP-999",
            Name = "Specialized Equipment",
            Unit = "Unit",
            UnitPrice = 120000m,
            PlannedQuantity = 1,
            ProjectType = ProcurementProjectType.Goods
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        ppmpItemRepoMock.Verify(r => r.AddAsync(It.Is<Domain.Entities.Planning.PPMPItem>(i =>
            i.PAPCode == "CUSTOM-PAP-999"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
