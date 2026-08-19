using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ERPEZ.Application.UnitTests.PhilGeps;

public class PsdbmQueryServiceTests
{
    private static ApplicationDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var db = new ApplicationDbContext(options);
        SeedSampleData(db);
        return db;
    }

    private static void SeedSampleData(ApplicationDbContext db)
    {
        var baguioDepot = new PsdbmDepot
        {
            Id = Guid.NewGuid(),
            Name = "BAGUIO",
            Region = "Cordillera Administrative Region",
            Mode = "regional",
            IsActive = true
        };

        var cebuDepot = new PsdbmDepot
        {
            Id = Guid.NewGuid(),
            Name = "CEBU",
            Region = "Central Visayas",
            Mode = "regional",
            IsActive = true
        };

        db.PsdbmDepots!.AddRange(baguioDepot, cebuDepot);

        var paperProduct = new PsdbmProduct
        {
            Id = Guid.NewGuid(),
            ItemCode = "14111507-PP-M01",
            Description = "PAPER, MULTICOPY, A4, 80gsm",
            Category = "Paper Products",
            Unit = "REAM",
            IsActive = true
        };

        var penProduct = new PsdbmProduct
        {
            Id = Guid.NewGuid(),
            ItemCode = "44121708-MP-B01",
            Description = "MARKER, PERMANENT, bullet type, black",
            Category = "Writing Instruments",
            Unit = "PIECE",
            IsActive = true
        };

        db.PsdbmProducts!.AddRange(paperProduct, penProduct);

        var paperInBaguio = new PsdbmDepotProduct
        {
            Id = Guid.NewGuid(),
            ProductId = paperProduct.Id,
            Product = paperProduct,
            DepotId = baguioDepot.Id,
            Depot = baguioDepot,
            Price = 204.67m,
            Availability = "AVAILABLE",
            AvailableStock = 20133,
            RemainingQtyForDelivery = 5,
            LastSyncedAt = DateTime.UtcNow
        };

        var paperInCebu = new PsdbmDepotProduct
        {
            Id = Guid.NewGuid(),
            ProductId = paperProduct.Id,
            Product = paperProduct,
            DepotId = cebuDepot.Id,
            Depot = cebuDepot,
            Price = 209.50m,
            Availability = "AVAILABLE",
            AvailableStock = 5400,
            RemainingQtyForDelivery = 0,
            LastSyncedAt = DateTime.UtcNow
        };

        db.PsdbmDepotProducts!.AddRange(paperInBaguio, paperInCebu);
        db.SaveChanges();
    }

    [Fact]
    public async Task GetItemsAsync_WithDepot_ShouldReturnItemsWithStockAndPrices()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetItemsAsync_WithDepot_ShouldReturnItemsWithStockAndPrices));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var result = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO"
        });

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().ContainSingle();
        var item = result.Items[0];
        item.ItemCode.Should().Be("14111507-PP-M01");
        item.UnitPrice.Should().Be(204.67m);
        item.AvailableStock.Should().Be(20133);
        item.RemainingQtyForDelivery.Should().Be(5);
        item.Depot.Should().Be("BAGUIO");
    }

    [Fact]
    public async Task GetItemsAsync_WithSearchAndCategoryFilter_ShouldFilterCorrectly()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetItemsAsync_WithSearchAndCategoryFilter_ShouldFilterCorrectly));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act - matching filter
        var result = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO",
            Category = "Paper Products",
            Search = "MULTICOPY"
        });

        // Assert
        result.Items.Should().ContainSingle();

        // Act - non-matching filter
        var nonMatching = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO",
            Category = "Writing Instruments"
        });

        nonMatching.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetItemDetailAsync_ShouldReturnProductWithAllDepotStocks()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetItemDetailAsync_ShouldReturnProductWithAllDepotStocks));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var detail = await queryService.GetItemDetailAsync(null, "14111507-PP-M01");

        // Assert
        detail.Should().NotBeNull();
        detail!.ItemCode.Should().Be("14111507-PP-M01");
        detail.DepotStocks.Should().HaveCount(2);
        detail.DepotStocks.Should().Contain(s => s.DepotName == "BAGUIO" && s.AvailableStock == 20133);
        detail.DepotStocks.Should().Contain(s => s.DepotName == "CEBU" && s.AvailableStock == 5400);
    }

    [Fact]
    public async Task GetCategoriesAsync_ShouldReturnDistinctCategoriesWithCounts()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetCategoriesAsync_ShouldReturnDistinctCategoriesWithCounts));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var categories = await queryService.GetCategoriesAsync("regional");

        // Assert
        categories.Should().HaveCount(2);
        categories.Should().Contain(c => c.Name == "Paper Products" && c.ItemCount == 1);
        categories.Should().Contain(c => c.Name == "Writing Instruments" && c.ItemCount == 1);
    }

    [Fact]
    public async Task GetDepotsAsync_ShouldReturnActiveDepots()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetDepotsAsync_ShouldReturnActiveDepots));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var depots = await queryService.GetDepotsAsync();

        // Assert
        depots.Should().HaveCount(2);
        depots.Should().Contain(d => d.Name == "BAGUIO");
        depots.Should().Contain(d => d.Name == "CEBU");
    }

    [Fact]
    public async Task GetItemsAsync_WithPagination_ShouldReturnCorrectPageAndTotal()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetItemsAsync_WithPagination_ShouldReturnCorrectPageAndTotal));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var result = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO",
            PageNumber = 1,
            PageSize = 10
        });

        // Assert
        result.Should().NotBeNull();
        result.TotalItems.Should().Be(1);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(1);
        result.HasPreviousPage.Should().BeFalse();
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public async Task GetItemsAsync_WithStockFilter_ShouldFilterInStock()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetItemsAsync_WithStockFilter_ShouldFilterInStock));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var inStock = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO",
            StockFilter = "in_stock"
        });

        var outOfStock = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO",
            StockFilter = "out_of_stock"
        });

        // Assert
        inStock.Items.Should().ContainSingle();
        outOfStock.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetItemsAsync_WithSorting_ShouldSortByPrice()
    {
        // Arrange
        var db = CreateInMemoryDbContext(nameof(GetItemsAsync_WithSorting_ShouldSortByPrice));
        var queryService = new PsdbmQueryService(db, new StubPhilGepsService(), NullLogger<PsdbmQueryService>.Instance);

        // Act
        var result = await queryService.GetItemsAsync(new GetPsdbmItemsQuery
        {
            Mode = "regional",
            Depot = "BAGUIO",
            SortBy = "price",
            SortDescending = true
        });

        // Assert
        result.Items.Should().ContainSingle();
        result.Items[0].UnitPrice.Should().Be(204.67m);
    }

    private sealed class StubPhilGepsService : IPhilGepsService
    {
        public Task<List<PsdbmItemDto>> GetItemsAsync(string mode, string? search, string? category, int max, string? depot, CancellationToken cancellationToken = default)
            => Task.FromResult(new List<PsdbmItemDto>());

        public Task<PsdbmItemDetailsDto?> GetItemDetailsAsync(string itemCode, string? depot = null, string? category = "All", string mode = "regional", CancellationToken cancellationToken = default)
            => Task.FromResult<PsdbmItemDetailsDto?>(null);

        public Task<List<PsdbmCategoryDto>> GetCategoriesAsync(string mode, CancellationToken cancellationToken = default)
            => Task.FromResult(new List<PsdbmCategoryDto>());

        public Task<List<PsdbmDepotDto>> GetDepotsAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(new List<PsdbmDepotDto>());

        public Task<List<PsdbmDepotDto>> GetRegionalDepotsAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(new List<PsdbmDepotDto>());

        public Task<List<PsdbmDepotDto>> GetLguDepotsAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(new List<PsdbmDepotDto>());
    }
}
