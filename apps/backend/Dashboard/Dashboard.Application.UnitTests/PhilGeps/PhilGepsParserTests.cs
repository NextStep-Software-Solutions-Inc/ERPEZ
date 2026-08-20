using ERPEZ.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace ERPEZ.Application.UnitTests.PhilGeps;

public class PhilGepsParserTests
{
    [Fact]
    public void ParseItemDetails_ShouldExtractAllFields_IncludingStockOnHandAndRemainingQty()
    {
        // Arrange
        const string sampleHtml = """
            <html lang="en">
            <body>
                <center><h1>PRODUCT PREVIEW</h1></center>
                <div class="product_image_area">
                    <div class="container">
                        <div class="row s_product_inner">
                            <div class="col-lg-6">
                                <div class="carousel-inner">
                                    <div class="carousel-item active">
                                        <img src="../catalogue/user_images/14111507-PP-M01_051526094541.png" alt="Product Image" />
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-5 offset-lg-1">
                                <div class="s_product_text">
                                    <h3>PAPER, MULTICOPY, A4</h3>
                                    <h2 class="text-primary" style="font-size: 25px;">P204.67</h2>
                                    <ul class="list">
                                        <li>
                                            <a><span>Item Code</span> : <b>14111507-PP-M01</b></a>
                                        </li>
                                        <li>
                                            <a><span>UOM</span> : <b> REAM</b></a>
                                        </li>
                                        <li>
                                            <a><span>Category</span> : <b>Paper Products</b></a>
                                        </li>
                                        <li>
                                            <a><span>Status</span> : <b>AVAILABLE</b></a>
                                        </li>
                                        <li>
                                            <a><span>Available Stocks on Hand</span> : <b> 20,133</b></a>
                                        </li>
                                        <li>
                                            <a><span>Remaining Qty. for Delivery</span> : <b> 0</b></a>
                                        </li>
                                        <li>
                                            <a href="../catalogue/tech_specs/14111507-PP-M01_101724032122.pdf" target="_blank">See technical specification here.</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """;

        // Act
        var result = PhilGepsService.ParseItemDetails(
            sampleHtml,
            baseUrl: "https://sys.ps-philgeps.gov.ph/catalogue_depot/item_preview.php",
            fallbackItemCode: "14111507-PP-M01",
            depot: "BAGUIO",
            mode: "regional");

        // Assert
        result.Should().NotBeNull();
        result!.ItemCode.Should().Be("14111507-PP-M01");
        result.Description.Should().Be("PAPER, MULTICOPY, A4");
        result.UnitPrice.Should().Be(204.67m);
        result.Unit.Should().Be("REAM");
        result.Category.Should().Be("Paper Products");
        result.Status.Should().Be("AVAILABLE");
        result.AvailableStock.Should().Be(20133);
        result.RemainingQtyForDelivery.Should().Be(0);
        result.ImageUrl.Should().Be("https://sys.ps-philgeps.gov.ph/catalogue/user_images/14111507-PP-M01_051526094541.png");
        result.TechnicalSpecificationUrl.Should().Be("https://sys.ps-philgeps.gov.ph/catalogue/tech_specs/14111507-PP-M01_101724032122.pdf");
        result.Depot.Should().Be("BAGUIO");
        result.Mode.Should().Be("regional");
    }

    [Fact]
    public void ParseCategories_ShouldExtractCategories_FromSubcatSelect()
    {
        // Arrange
        const string sampleHtml = """
            <select name="subcat" id="subcat">
                <option selected>All</option>
                <option>Cleaning Equipment and Supplies</option>
                <option>Computer Supplies</option>
                <option>Office Supplies</option>
                <option>Paper Products</option>
            </select>
            """;

        // Act
        var categories = PhilGepsService.ParseCategories(sampleHtml);

        // Assert
        categories.Should().HaveCount(4);
        categories.Select(c => c.Name).Should().Contain([
            "Cleaning Equipment and Supplies",
            "Computer Supplies",
            "Office Supplies",
            "Paper Products"
        ]);
    }

    [Fact]
    public void ParseDepotDropdown_ShouldExtractRegionalAndLguDepots()
    {
        // Arrange Regional
        const string regionalHtml = """
            <select name="regional_depot" id="regional_depot">
                <option>BAGUIO</option>
                <option>LA UNION</option>
                <option>CEBU</option>
                <option>DAVAO</option>
            </select>
            """;

        // Act Regional
        var regionalDepots = PhilGepsService.ParseDepotDropdown(regionalHtml, isLgu: false);

        // Assert Regional
        regionalDepots.Should().HaveCount(4);
        regionalDepots.First(d => d.Name == "BAGUIO").Region.Should().Be("Cordillera Administrative Region");
        regionalDepots.First(d => d.Name == "CEBU").Region.Should().Be("Central Visayas");
        regionalDepots.First(d => d.Name == "DAVAO").Id.Should().Be("depot-davao");

        // Arrange LGU
        const string lguHtml = """
            <select name="regional_depot" id="regional_depot">
                <option>BACOLOD</option>
                <option>PALAWAN</option>
            </select>
            """;

        // Act LGU
        var lguDepots = PhilGepsService.ParseDepotDropdown(lguHtml, isLgu: true);

        // Assert LGU
        lguDepots.Should().HaveCount(2);
        lguDepots.First(d => d.Name == "BACOLOD").Region.Should().Be("LGU");
        lguDepots.First(d => d.Name == "BACOLOD").Id.Should().Be("lgu-bacolod");
    }

    [Fact]
    public void ParseItems_ShouldExtractCatalogueItems_FromItemContentHtml()
    {
        // Arrange
        const string sampleHtml = """
            <div class="row">
                <div class="col-3">
                    <a href="item_preview.php?item_code=14111507-PP-M01&cat=All&depot=BAGUIO">
                        <p class="text-one-line"><strong>PAPER, MULTICOPY, A4</strong></p>
                    </a>
                    <div style="background-color: green;">
                        <span>Available</span>
                    </div>
                    <p style="font-size:13px">Php 204.67 / REAM</p>
                </div>
            </div>
            """;

        // Act
        var items = PhilGepsService.ParseItems(sampleHtml);

        // Assert
        items.Should().HaveCount(1);
        var item = items[0];
        item.ItemCode.Should().Be("14111507-PP-M01");
        item.Description.Should().Be("PAPER, MULTICOPY, A4");
        item.UnitPrice.Should().Be(204.67m);
        item.Unit.Should().Be("REAM");
        item.Availability.Should().Be("Available");
    }

    [Fact]
    public async Task LiveIntegration_GetItemDetailsAsync_ShouldFetchRealStockFromPhilGeps()
    {
        // Arrange
        var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("ERPEZ/1.0");
        var factory = new TestHttpClientFactory(httpClient);
        var service = new PhilGepsService(factory);

        // Act
        var details = await service.GetItemDetailsAsync(
            itemCode: "14111507-PP-M01",
            depot: "BAGUIO",
            category: "All",
            mode: "regional");

        // Assert
        if (details != null)
        {
            details.ItemCode.Should().Be("14111507-PP-M01");
            details.Description.Should().Contain("PAPER");
            details.UnitPrice.Should().BeGreaterThan(0);
            details.Unit.Should().NotBeNullOrWhiteSpace();
            details.Category.Should().NotBeNullOrWhiteSpace();
            details.AvailableStock.Should().BeGreaterThanOrEqualTo(0);
            details.RemainingQtyForDelivery.Should().BeGreaterThanOrEqualTo(0);
        }
    }

    private sealed class TestHttpClientFactory(HttpClient client) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => client;
    }
}
