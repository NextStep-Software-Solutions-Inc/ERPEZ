using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ERPEZ.Application.UnitTests.PhilGeps;

public class PsdbmSyncServiceTests
{
    private static ApplicationDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task SyncAsync_ShouldPopulateProductsAndDepotStocks_AndCreateStockHistory()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(SyncAsync_ShouldPopulateProductsAndDepotStocks_AndCreateStockHistory));
        var fakePhilGeps = new FakePhilGepsService();
        var syncService = new PsdbmSyncService(db, fakePhilGeps, NullLogger<PsdbmSyncService>.Instance);

        // Act
        var result = await syncService.SyncAsync(new PsdbmSyncRequestDto
        {
            SyncMode = PsdbmSyncMode.Full,
            MaxConcurrency = 2
        });

        // Assert
        result.Status.Should().Be(PsdbmSyncStatus.Completed);
        result.DepotsProcessed.Should().Be(1);
        result.ItemsCreated.Should().Be(1);
        result.StockRecordsUpdated.Should().Be(1);

        var product = await db.PsdbmProducts!.FirstOrDefaultAsync(p => p.ItemCode == "14111507-PP-M01");
        product.Should().NotBeNull();
        product!.Description.Should().Be("PAPER, MULTICOPY, A4");
        product.Category.Should().Be("Paper Products");

        var depotProduct = await db.PsdbmDepotProducts!.FirstOrDefaultAsync(dp => dp.ProductId == product.Id);
        depotProduct.Should().NotBeNull();
        depotProduct!.AvailableStock.Should().Be(20133);
        depotProduct.RemainingQtyForDelivery.Should().Be(5);
        depotProduct.Price.Should().Be(204.67m);

        var stockHistory = await db.PsdbmStockHistories!.ToListAsync();
        stockHistory.Should().HaveCount(1);
        stockHistory[0].AvailableStock.Should().Be(20133);
        stockHistory[0].RemainingQtyForDelivery.Should().Be(5);
    }

    [Fact]
    public async Task SyncAsync_WhenStockChanges_ShouldRecordNewStockHistorySnapshot()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(SyncAsync_WhenStockChanges_ShouldRecordNewStockHistorySnapshot));
        var fakePhilGeps = new FakePhilGepsService();
        var syncService = new PsdbmSyncService(db, fakePhilGeps, NullLogger<PsdbmSyncService>.Instance);

        // Act 1: Initial sync (Stock = 20133)
        await syncService.SyncAsync(new PsdbmSyncRequestDto { SyncMode = PsdbmSyncMode.Full });

        // Act 2: Stock reduces to 19500
        fakePhilGeps.AvailableStock = 19500;
        fakePhilGeps.RemainingQty = 10;
        var secondResult = await syncService.SyncAsync(new PsdbmSyncRequestDto { SyncMode = PsdbmSyncMode.Stock });

        // Assert
        secondResult.Status.Should().Be(PsdbmSyncStatus.Completed);

        var stockHistories = await db.PsdbmStockHistories!.OrderBy(s => s.CapturedAt).ToListAsync();
        stockHistories.Should().HaveCount(2);
        stockHistories[0].AvailableStock.Should().Be(20133);
        stockHistories[1].AvailableStock.Should().Be(19500);
        stockHistories[1].RemainingQtyForDelivery.Should().Be(10);

        var depotProduct = await db.PsdbmDepotProducts!.FirstAsync();
        depotProduct.AvailableStock.Should().Be(19500);
    }

    [Fact]
    public async Task SyncAsync_WhenItemFails_ShouldCompleteWithErrors_AndRecordFailure()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(SyncAsync_WhenItemFails_ShouldCompleteWithErrors_AndRecordFailure));
        var fakePhilGeps = new FakePhilGepsService { ShouldThrowOnDetails = true };
        var syncService = new PsdbmSyncService(db, fakePhilGeps, NullLogger<PsdbmSyncService>.Instance);

        // Act
        var result = await syncService.SyncAsync(new PsdbmSyncRequestDto { SyncMode = PsdbmSyncMode.Full });

        // Assert
        result.Status.Should().Be(PsdbmSyncStatus.CompletedWithErrors);
        result.ErrorCount.Should().Be(1);
        result.Errors.Should().ContainSingle(e => e.ItemCode == "14111507-PP-M01");

        var syncRun = await db.PsdbmSyncRuns!.FirstOrDefaultAsync(r => r.Id == result.SyncRunId);
        syncRun.Should().NotBeNull();
        syncRun!.Status.Should().Be(PsdbmSyncStatus.CompletedWithErrors);
    }

    private sealed class FakePhilGepsService : IPhilGepsService
    {
        public int AvailableStock { get; set; } = 20133;
        public int RemainingQty { get; set; } = 5;
        public bool ShouldThrowOnDetails { get; set; }

        public Task<List<PsdbmItemDto>> GetItemsAsync(
            string mode,
            string? search,
            string? category,
            int max,
            string? depot,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<PsdbmItemDto>
            {
                new()
                {
                    ItemCode = "14111507-PP-M01",
                    Description = "PAPER, MULTICOPY, A4",
                    UnitPrice = 204.67m,
                    Unit = "REAM",
                    Availability = "AVAILABLE"
                }
            });
        }

        public Task<PsdbmItemDetailsDto?> GetItemDetailsAsync(
            string itemCode,
            string? depot = null,
            string? category = "All",
            string mode = "regional",
            CancellationToken cancellationToken = default)
        {
            if (ShouldThrowOnDetails)
            {
                throw new HttpRequestException("Simulated network timeout");
            }

            return Task.FromResult<PsdbmItemDetailsDto?>(new PsdbmItemDetailsDto
            {
                ItemCode = itemCode,
                Description = "PAPER, MULTICOPY, A4",
                UnitPrice = 204.67m,
                Unit = "REAM",
                Category = "Paper Products",
                Status = "AVAILABLE",
                AvailableStock = AvailableStock,
                RemainingQtyForDelivery = RemainingQty,
                ImageUrl = "https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111507-PP-M01.png",
                TechnicalSpecificationUrl = "https://sys.ps-philgeps.gov.ph/catalogue/tech_specs/14111507-PP-M01.pdf",
                Depot = depot,
                Mode = mode
            });
        }

        public Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
            string mode,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<PsdbmCategoryDto>
            {
                new() { Id = "Paper Products", Name = "Paper Products", ItemCount = 1 }
            });
        }

        public Task<List<PsdbmDepotDto>> GetDepotsAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<PsdbmDepotDto>
            {
                new() { Id = "depot-baguio", Name = "BAGUIO", Region = "Cordillera Administrative Region" }
            });
        }

        public Task<List<PsdbmDepotDto>> GetRegionalDepotsAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<PsdbmDepotDto>
            {
                new() { Id = "depot-baguio", Name = "BAGUIO", Region = "Cordillera Administrative Region" }
            });
        }

        public Task<List<PsdbmDepotDto>> GetLguDepotsAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<PsdbmDepotDto>());
        }
    }
}
