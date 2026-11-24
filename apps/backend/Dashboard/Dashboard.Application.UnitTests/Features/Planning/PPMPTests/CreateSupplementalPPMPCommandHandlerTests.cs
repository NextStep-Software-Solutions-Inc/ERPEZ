using ERPEZ.Application.Features.Planning.PPMP.Commands.CreateSupplementalPPMP;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;
using PpmpEntity = ERPEZ.Domain.Entities.Planning.PPMP;
using PpmpActivityEntity = ERPEZ.Domain.Entities.Planning.PPMPActivity;
using PpmpExpenditureItemEntity = ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem;
using PpmpItemEntity = ERPEZ.Domain.Entities.Planning.PPMPItem;
using PpmpItemAllocationEntity = ERPEZ.Domain.Entities.Planning.PPMPItemAllocation;

namespace Dashboard.Application.UnitTests.Features.Planning.PPMPTests;

public class CreateSupplementalPPMPCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IPPMPActivityRepository> ppmpActivityRepoMock;
    private readonly Mock<IPPMPExpenditureItemRepository> ppmpExpenditureItemRepoMock;
    private readonly Mock<IPPMPItemRepository> ppmpItemRepoMock;
    private readonly Mock<IPPMPItemAllocationRepository> ppmpItemAllocationRepoMock;
    private readonly CreateSupplementalPPMPCommandHandler handler;

    public CreateSupplementalPPMPCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        ppmpActivityRepoMock = new Mock<IPPMPActivityRepository>();
        ppmpExpenditureItemRepoMock = new Mock<IPPMPExpenditureItemRepository>();
        ppmpItemRepoMock = new Mock<IPPMPItemRepository>();
        ppmpItemAllocationRepoMock = new Mock<IPPMPItemAllocationRepository>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPActivityRepository).Returns(ppmpActivityRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPExpenditureItemRepository).Returns(ppmpExpenditureItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPItemRepository).Returns(ppmpItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPItemAllocationRepository).Returns(ppmpItemAllocationRepoMock.Object);

        handler = new CreateSupplementalPPMPCommandHandler(unitOfWorkMock.Object);
    }

    private static PpmpEntity CreateSourcePPMP(StatusEnum status = StatusEnum.Approved, PPMPTypeEnum type = PPMPTypeEnum.Original)
    {
        var ppmpId = Guid.NewGuid();
        var actId = Guid.NewGuid();
        var expId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        var item = new PpmpItemEntity
        {
            Id = itemId,
            PPMPExpenditureItemId = expId,
            Name = "Office Laptop",
            UnitPrice = 50000m,
            PlannedQuantity = 2,
            PPMPItemAllocations =
            [
                new PpmpItemAllocationEntity
                {
                    Id = Guid.NewGuid(),
                    PPMPItemId = itemId,
                    AllocationMonth = AllocationMonthEnum.January,
                    Quantity = 2,
                    Amount = 100000m
                }
            ]
        };

        var expenditure = new PpmpExpenditureItemEntity
        {
            Id = expId,
            PPMPId = ppmpId,
            PPMPActivityId = actId,
            ObjectId = Guid.NewGuid(),
            IsProcurable = true,
            TotalCost = 100000m,
            PPMPItems = [item]
        };

        var activity = new PpmpActivityEntity
        {
            Id = actId,
            PPMPId = ppmpId,
            LIBActivityId = Guid.NewGuid(),
            PPMPExpenditureItems = [expenditure]
        };

        return new PpmpEntity
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-001",
            OfficeId = Guid.NewGuid(),
            FiscalYearId = Guid.NewGuid(),
            FundSourceId = Guid.NewGuid(),
            LIBId = Guid.NewGuid(),
            Status = status,
            PPMPType = type,
            IsFinal = true,
            IsMaster = false,
            Version = 1,
            TotalEstimatedBudget = 100000m,
            PPMPActivities = [activity],
            PPMPExpenditureItems = [expenditure]
        };
    }

    [Fact]
    public async Task Handle_WithCopyItemsFalse_CreatesSupplementalWithActivitiesAndExpenditures_AndEmptyItemsAndZeroBudget()
    {
        // Arrange
        var source = CreateSourcePPMP();
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);
        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        ppmpRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PpmpEntity?)null);

        PpmpEntity? savedPpmp = null;
        ppmpRepoMock.Setup(r => r.AddAsync(It.IsAny<PpmpEntity>(), It.IsAny<CancellationToken>()))
            .Callback<PpmpEntity, CancellationToken>((p, _) => savedPpmp = p)
            .Returns(Task.CompletedTask);

        var command = new CreateSupplementalPPMPCommand(source.Id, new CreateSupplementalPPMPRequest { CopyItems = false });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedPpmp.Should().NotBeNull();
        savedPpmp!.PPMPType.Should().Be(PPMPTypeEnum.Supplemental);
        savedPpmp.SourcePPMPId.Should().Be(source.Id);
        savedPpmp.SupplementalNumber.Should().Be(1);
        savedPpmp.PPMPNumber.Should().Be("PPMP-2026-001-SUP-001");
        savedPpmp.Status.Should().Be(StatusEnum.Draft);
        savedPpmp.IsFinal.Should().BeTrue();
        savedPpmp.TotalEstimatedBudget.Should().Be(0m); // Safeguard 3: budget is 0 for CopyItems = false

        // Verify activity and expenditure cloned
        ppmpActivityRepoMock.Verify(r => r.AddAsync(It.IsAny<PpmpActivityEntity>(), It.IsAny<CancellationToken>()), Times.Once);
        ppmpExpenditureItemRepoMock.Verify(r => r.AddAsync(It.IsAny<PpmpExpenditureItemEntity>(), It.IsAny<CancellationToken>()), Times.Once);

        // Verify items and allocations are NOT cloned
        ppmpItemRepoMock.Verify(r => r.AddAsync(It.IsAny<PpmpItemEntity>(), It.IsAny<CancellationToken>()), Times.Never);
        ppmpItemAllocationRepoMock.Verify(r => r.AddAsync(It.IsAny<PpmpItemAllocationEntity>(), It.IsAny<CancellationToken>()), Times.Never);

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCopyItemsTrue_DeepClonesItemsAndMonthlyAllocations_AndComputesBudget()
    {
        // Arrange
        var source = CreateSourcePPMP();
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);
        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        ppmpRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PpmpEntity?)null);

        PpmpEntity? savedPpmp = null;
        ppmpRepoMock.Setup(r => r.AddAsync(It.IsAny<PpmpEntity>(), It.IsAny<CancellationToken>()))
            .Callback<PpmpEntity, CancellationToken>((p, _) => savedPpmp = p)
            .Returns(Task.CompletedTask);

        var command = new CreateSupplementalPPMPCommand(source.Id, new CreateSupplementalPPMPRequest { CopyItems = true });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedPpmp.Should().NotBeNull();
        savedPpmp!.TotalEstimatedBudget.Should().Be(100000m);

        // Verify items and allocations cloned
        ppmpItemRepoMock.Verify(r => r.AddAsync(It.IsAny<PpmpItemEntity>(), It.IsAny<CancellationToken>()), Times.Once);
        ppmpItemAllocationRepoMock.Verify(r => r.AddAsync(It.IsAny<PpmpItemAllocationEntity>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCustomPPMPNumber_UsesProvidedNumber()
    {
        // Arrange
        var source = CreateSourcePPMP();
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);
        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        ppmpRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PpmpEntity?)null);

        PpmpEntity? savedPpmp = null;
        ppmpRepoMock.Setup(r => r.AddAsync(It.IsAny<PpmpEntity>(), It.IsAny<CancellationToken>()))
            .Callback<PpmpEntity, CancellationToken>((p, _) => savedPpmp = p)
            .Returns(Task.CompletedTask);

        var command = new CreateSupplementalPPMPCommand(source.Id, new CreateSupplementalPPMPRequest
        {
            PPMPNumber = "CUSTOM-SUPP-999"
        });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedPpmp!.PPMPNumber.Should().Be("CUSTOM-SUPP-999");
    }

    [Fact]
    public async Task Handle_WhenExistingSupplementalsExist_IncrementsSupplementalNumber()
    {
        // Arrange
        var source = CreateSourcePPMP();
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);

        var existingList = new List<PpmpEntity>
        {
            new() { Id = Guid.NewGuid(), PPMPNumber = "PPMP-2026-001-SUP-001", SupplementalNumber = 1 },
            new() { Id = Guid.NewGuid(), PPMPNumber = "PPMP-2026-001-SUP-002", SupplementalNumber = 2 }
        };

        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingList);
        ppmpRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PpmpEntity?)null);

        PpmpEntity? savedPpmp = null;
        ppmpRepoMock.Setup(r => r.AddAsync(It.IsAny<PpmpEntity>(), It.IsAny<CancellationToken>()))
            .Callback<PpmpEntity, CancellationToken>((p, _) => savedPpmp = p)
            .Returns(Task.CompletedTask);

        var command = new CreateSupplementalPPMPCommand(source.Id);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedPpmp!.SupplementalNumber.Should().Be(3);
        savedPpmp.PPMPNumber.Should().Be("PPMP-2026-001-SUP-003");
    }

    [Fact]
    public async Task Handle_WhenSourcePPMPNotApproved_ThrowsValidationException()
    {
        // Arrange: status is Draft
        var source = CreateSourcePPMP(status: StatusEnum.Draft);
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);

        var command = new CreateSupplementalPPMPCommand(source.Id);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*must be approved*");
    }

    [Fact]
    public async Task Handle_WhenSourcePPMPIsSupplemental_ThrowsValidationException()
    {
        // Arrange: source PPMP is itself Supplemental (Safeguard 4: strict star lineage)
        var source = CreateSourcePPMP(type: PPMPTypeEnum.Supplemental);
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);

        var command = new CreateSupplementalPPMPCommand(source.Id);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*A Supplemental PPMP can only be created from an Original PPMP*");
    }

    [Fact]
    public async Task Handle_WhenDuplicatePPMPNumberInFiscalYear_ThrowsConflictException()
    {
        // Arrange: duplicate number exists
        var source = CreateSourcePPMP();
        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);
        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        ppmpRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PpmpEntity, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PpmpEntity { Id = Guid.NewGuid(), PPMPNumber = "PPMP-2026-001-SUP-001" });

        var command = new CreateSupplementalPPMPCommand(source.Id);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*already exists for this fiscal year*");
    }

    [Fact]
    public async Task Handle_WhenSourcePpmpIsNotFinal_ThrowsValidationException()
    {
        // Arrange
        var source = CreateSourcePPMP();
        source.IsFinal = false; // Not yet marked as final

        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(source);

        var command = new CreateSupplementalPPMPCommand(source.Id);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*must be marked as Final before a Supplemental PPMP can be created*");
    }
}
