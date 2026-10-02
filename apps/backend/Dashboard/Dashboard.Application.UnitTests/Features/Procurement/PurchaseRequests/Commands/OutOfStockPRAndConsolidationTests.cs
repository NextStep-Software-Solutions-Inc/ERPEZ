using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using Moq;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Features.Procurement.PurchaseRequests.Commands;

public class OutOfStockPRAndConsolidationTests
{
    private readonly Mock<IUnitOfWork> mockUnitOfWork = new();
    private readonly Mock<IPurchaseRequestRepository> mockPrRepo = new();
    private readonly Mock<IPRItemRepository> mockPrItemRepo = new();
    private readonly Mock<IAPRItemRepository> mockAprItemRepo = new();
    private readonly Mock<IAPRRepository> mockAprRepo = new();
    private readonly Mock<IOfficeRepository> mockOfficeRepo = new();
    private readonly Mock<IConsolidatedPRRepository> mockCprRepo = new();

    public OutOfStockPRAndConsolidationTests()
    {
        mockUnitOfWork.Setup(u => u.PurchaseRequestRepository).Returns(mockPrRepo.Object);
        mockUnitOfWork.Setup(u => u.PRItemRepository).Returns(mockPrItemRepo.Object);
        mockUnitOfWork.Setup(u => u.APRItemRepository).Returns(mockAprItemRepo.Object);
        mockUnitOfWork.Setup(u => u.APRRepository).Returns(mockAprRepo.Object);
        mockUnitOfWork.Setup(u => u.OfficeRepository).Returns(mockOfficeRepo.Object);
        mockUnitOfWork.Setup(u => u.ConsolidatedPRRepository).Returns(mockCprRepo.Object);
        mockUnitOfWork.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<Task>, CancellationToken>((action, _) => action());
    }

    [Fact]
    public async Task CreatePR_FromOutOfStockAPR_Succeeds()
    {
        // Arrange
        var officeId = Guid.NewGuid();
        var aprId = Guid.NewGuid();
        var aprItemId = Guid.NewGuid();

        mockOfficeRepo.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Office { Id = officeId, Name = "Admin Office" });

        var apr = new APR
        {
            Id = aprId,
            OfficeId = officeId,
            Status = StatusEnum.Approved,
            APRNumber = "APR-2026-0001"
        };
        mockAprRepo.Setup(r => r.GetByIdAsync(aprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apr);

        var aprItem = new APRItem
        {
            Id = aprItemId,
            APRId = aprId,
            Description = "Ballpen (Black)",
            Unit = "piece",
            QuantityRequested = 100,
            UnitCost = 15m,
            TotalCost = 1500m
        };
        mockAprItemRepo.Setup(r => r.GetByIdAsync(aprItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(aprItem);

        mockPrItemRepo.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PRItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PRItem>());

        mockPrRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PurchaseRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PurchaseRequest?)null);

        var handler = new CreatePRCommandHandler(mockUnitOfWork.Object);
        var command = new CreatePRCommand
        {
            PRNumber = "PR-2026-001",
            OfficeId = officeId,
            PRType = PRType.OutOfStockCSE,
            Purpose = "Out of stock CSE procurement",
            Items = new List<PRItemRequest>
            {
                new()
                {
                    APRItemId = aprItemId,
                    Name = "Ballpen (Black)",
                    UnitCost = 15m,
                    RequestedQuantity = 50,
                    RequestedMonth = AllocationMonthEnum.January
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        mockPrRepo.Verify(r => r.AddAsync(It.Is<PurchaseRequest>(pr =>
            pr.PRType == PRType.OutOfStockCSE &&
            pr.PRItems.Count == 1 &&
            pr.PRItems[0].APRItemId == aprItemId &&
            pr.PRItems[0].RequestedQuantity == 50 &&
            pr.TotalAmount == 750m), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreatePR_FromOutOfStockAPR_ThrowsWhenQuantityExceedsDeficit()
    {
        // Arrange
        var officeId = Guid.NewGuid();
        var aprId = Guid.NewGuid();
        var aprItemId = Guid.NewGuid();

        mockOfficeRepo.Setup(r => r.GetByIdAsync(officeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Office { Id = officeId, Name = "Admin Office" });

        var apr = new APR
        {
            Id = aprId,
            OfficeId = officeId,
            Status = StatusEnum.Approved,
            APRNumber = "APR-2026-0001"
        };
        mockAprRepo.Setup(r => r.GetByIdAsync(aprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apr);

        var aprItem = new APRItem
        {
            Id = aprItemId,
            APRId = aprId,
            Description = "Ballpen (Black)",
            QuantityRequested = 20, // Only 20 requested on APR
            UnitCost = 15m
        };
        mockAprItemRepo.Setup(r => r.GetByIdAsync(aprItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(aprItem);

        mockPrItemRepo.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PRItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PRItem>());

        mockPrRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<PurchaseRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PurchaseRequest?)null);

        var handler = new CreatePRCommandHandler(mockUnitOfWork.Object);
        var command = new CreatePRCommand
        {
            PRNumber = "PR-2026-002",
            OfficeId = officeId,
            PRType = PRType.OutOfStockCSE,
            Purpose = "Excessive quantity requested",
            Items = new List<PRItemRequest>
            {
                new()
                {
                    APRItemId = aprItemId,
                    Name = "Ballpen (Black)",
                    UnitCost = 15m,
                    RequestedQuantity = 50, // Exceeds 20
                    RequestedMonth = AllocationMonthEnum.January
                }
            }
        };

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task UpdatePR_WithOutOfStockAPR_SucceedsWithoutPPMPBudgetValidation()
    {
        // Arrange
        var prId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var aprId = Guid.NewGuid();
        var aprItemId = Guid.NewGuid();

        var pr = new PurchaseRequest
        {
            Id = prId,
            OfficeId = officeId,
            PRType = PRType.OutOfStockCSE,
            Status = StatusEnum.Draft,
            PRItems = new List<PRItem>()
        };

        mockPrRepo.Setup(r => r.GetPRWithDetailsAsync(prId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pr);

        var apr = new APR
        {
            Id = aprId,
            OfficeId = officeId,
            Status = StatusEnum.Approved
        };
        mockAprRepo.Setup(r => r.GetByIdAsync(aprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apr);

        var aprItem = new APRItem
        {
            Id = aprItemId,
            APRId = aprId,
            Description = "A4 Paper",
            QuantityRequested = 100,
            UnitCost = 250m,
            PPMPItemId = null // Sourced from catalog or without explicit PPMPItemId
        };
        mockAprItemRepo.Setup(r => r.GetByIdAsync(aprItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(aprItem);

        mockPrItemRepo.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PRItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PRItem>());

        var handler = new UpdatePRCommandHandler(mockUnitOfWork.Object);
        var command = new UpdatePRCommand(
            prId,
            new UpdatePRRequest
            {
                Items = new List<PRItemRequest>
                {
                    new()
                    {
                        APRItemId = aprItemId,
                        Name = "A4 Paper",
                        UnitCost = 250m,
                        RequestedQuantity = 30,
                        RequestedMonth = AllocationMonthEnum.March
                    }
                }
            });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Single(pr.PRItems);
        Assert.Equal(30, pr.PRItems[0].RequestedQuantity);
        Assert.Equal(7500m, pr.TotalAmount);
    }

    [Fact]
    public async Task AddPRsToConsolidated_WithApprovedOutOfStockPR_Succeeds()
    {
        // Arrange
        var cprId = Guid.NewGuid();
        var prId = Guid.NewGuid();
        var aprItemId = Guid.NewGuid();

        var cpr = new ConsolidatedPR
        {
            Id = cprId,
            Status = StatusEnum.Draft,
            CPRNumber = "CPR-2026-0001",
            TotalAmount = 0m,
            ConsolidatedPRItems = new List<ConsolidatedPRItem>()
        };
        mockCprRepo.Setup(r => r.GetCPRWithDetailsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cpr);

        var pr = new PurchaseRequest
        {
            Id = prId,
            PRNumber = "PR-2026-0001",
            PRType = PRType.OutOfStockCSE,
            Status = StatusEnum.Approved,
            PRItems = new List<PRItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prId,
                    APRItemId = aprItemId,
                    Name = "Ballpen (Black)",
                    RequestedQuantity = 50,
                    UnitCost = 15m,
                    Amount = 750m,
                    APRItem = new APRItem
                    {
                        Id = aprItemId,
                        Description = "Ballpen (Black)"
                    }
                }
            }
        };
        mockPrRepo.Setup(r => r.GetPRWithItemsAsync(prId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pr);

        var handler = new AddPRsToConsolidatedCommandHandler(mockUnitOfWork.Object);
        var command = new AddPRsToConsolidatedCommand(cprId, new AddPRsToConsolidatedRequest { PurchaseRequestIds = [prId] });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Single(cpr.ConsolidatedPRItems);
        Assert.Equal(750m, cpr.TotalAmount);
        mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
