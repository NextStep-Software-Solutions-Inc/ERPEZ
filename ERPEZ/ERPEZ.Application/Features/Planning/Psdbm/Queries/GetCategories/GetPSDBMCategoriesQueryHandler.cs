using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using HtmlAgilityPack;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetCategories;

public class GetPsdbmCategoriesQueryHandler(IHttpClientFactory httpClientFactory)
    : IRequestHandler<GetPsdbmCategoriesQuery, ApiResponse<List<PsdbmCategoryDto>>>
{
    public async Task<ApiResponse<List<PsdbmCategoryDto>>> Handle(
        GetPsdbmCategoriesQuery request, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("psdbm");

        // catalogue/index.php requires login — scrape from depot/lgu index instead
        // Both depot and lgu index pages have the same category list
        string targetUrl = request.Mode.ToLower() switch
        {
            "main" or "regional" => "https://sys.ps-philgeps.gov.ph/catalogue_depot/index.php",
            "lgu"                => "https://sys.ps-philgeps.gov.ph/catalogue_lgu/index.php",
            _ => null!
        };

        if (targetUrl == null)
            return ApiResponse<List<PsdbmCategoryDto>>.Fail(
                "Invalid mode. Must be 'main', 'regional', or 'lgu'.");

        try
        {
            var response = await client.GetAsync(targetUrl, cancellationToken);
            response.EnsureSuccessStatusCode();

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var categories = ParseCategories(html);

            return ApiResponse<List<PsdbmCategoryDto>>.Success(
                categories, "Categories fetched successfully");
        }
        catch (HttpRequestException ex)
        {
            return ApiResponse<List<PsdbmCategoryDto>>.Fail(
                $"Failed to communicate with PhilGEPS: {ex.Message}");
        }
    }

    private static List<PsdbmCategoryDto> ParseCategories(string html)
    {
        var categories = new List<PsdbmCategoryDto>();
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // ✅ Confirmed: category select is name="subcat"
        var selectNode = doc.DocumentNode.SelectSingleNode("//select[@name='subcat']");
        if (selectNode == null) return categories;

        var options = selectNode.SelectNodes(".//option");
        if (options == null) return categories;

        foreach (var option in options)
        {
            var name = option.InnerText.Trim();
            var id   = option.GetAttributeValue("value", "").Trim();

            if (string.IsNullOrWhiteSpace(name)
                || name.Equals("All", StringComparison.OrdinalIgnoreCase)
                || name.Contains("Select", StringComparison.OrdinalIgnoreCase))
                continue;

            categories.Add(new PsdbmCategoryDto
            {
                Id        = string.IsNullOrWhiteSpace(id) ? name : id,
                Name      = name,
                ItemCount = 0
            });
        }

        return categories;
    }
}