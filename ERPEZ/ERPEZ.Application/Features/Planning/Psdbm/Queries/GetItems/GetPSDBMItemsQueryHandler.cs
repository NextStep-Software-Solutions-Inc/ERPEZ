using ERPEZ.Shared.Common;
using MediatR;
using HtmlAgilityPack;
using System.Web;
using ERPEZ.Application.Features.Planning.Psdbm.Dtos;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

public class GetPsdbmItemsQueryHandler(IHttpClientFactory httpClientFactory)
    : IRequestHandler<GetPsdbmItemsQuery, ApiResponse<GetPsdbmItemsResponse>> 
{
    public async Task<ApiResponse<GetPsdbmItemsResponse>> Handle(
        GetPsdbmItemsQuery request, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient();

        string baseUrl;
        switch (request.Mode.ToLower())
        {
            case "main":
                baseUrl = "https://sys.ps-philgeps.gov.ph/catalogue/item_content.php";
                break;
            case "regional":
                baseUrl = "https://sys.ps-philgeps.gov.ph/catalogue_depot/item_content.php";
                break;
            case "lgu":
                baseUrl = "https://sys.ps-philgeps.gov.ph/catalogue_lgu/item_content.php";
                break;
            default:
                return ApiResponse<GetPsdbmItemsResponse>.Fail(
                    "Invalid mode. Must be 'main', 'regional', or 'lgu'.");
        }

        var query = HttpUtility.ParseQueryString(string.Empty);
        if (!string.IsNullOrWhiteSpace(request.Search))
            query["search"] = request.Search;
        if (!string.IsNullOrWhiteSpace(request.Category))
            query["cat"] = request.Category;
        if (request.Max > 0)
            query["max"] = request.Max.ToString();
        if (!string.IsNullOrWhiteSpace(request.Depot) && request.Mode.ToLower() != "main")
            query["depot"] = request.Depot;

        var targetUrl = $"{baseUrl}?{query}";

        try
        {
            var response = await client.GetAsync(targetUrl, cancellationToken);
            response.EnsureSuccessStatusCode();

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var items = ParseItems(html);

            var result = new GetPsdbmItemsResponse  // ✅ correct DTO name
            {
                Items = items,
                TotalItems = items.Count,
                Category = request.Category,
                SearchTerm = request.Search,
                Mode = request.Mode,
                Depot = request.Mode.ToLower() == "main" ? null : request.Depot
            };

            return ApiResponse<GetPsdbmItemsResponse>.Success(result, "Items fetched successfully");
        }
        catch (HttpRequestException ex)
        {
            return ApiResponse<GetPsdbmItemsResponse>.Fail(
                $"Failed to communicate with PhilGEPS: {ex.Message}");
        }
    }

    private static List<PsdbmItemDto> ParseItems(string html)
    {
        var items = new List<PsdbmItemDto>();
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var col3Divs = doc.DocumentNode
            .SelectNodes("//div[contains(@class,'col-3')]");

        if (col3Divs == null) return items;

        foreach (var col3 in col3Divs)
        {
            var anchor = col3.SelectSingleNode(".//a[contains(@href,'item_code')]");
            if (anchor == null) continue;

            // Item code from href
            var href = anchor.GetAttributeValue("href", "");
            var itemCode = "";
            var hrefParts = href.Split('?');
            if (hrefParts.Length > 1)
            {
                var queryParams = HttpUtility.ParseQueryString(hrefParts[1]);
                itemCode = queryParams["item_code"] ?? "";
            }

            // Availability
            var availSpan = col3.SelectSingleNode(".//div[contains(@style,'background-color')]/span");
            var availability = availSpan?.InnerText.Trim() ?? "";

            // Description
            var descNode = col3.SelectSingleNode(".//p[contains(@class,'text-one-line')]//strong");
            var description = descNode != null
                ? System.Text.RegularExpressions.Regex.Replace(descNode.InnerText, @"\s+", " ").Trim()
                : "";

            // Price + Unit
            var priceNode = col3.SelectSingleNode(".//p[contains(@style,'font-size:13px')]");
            var priceRaw = priceNode?.InnerText.Trim() ?? "";

            decimal unitPrice = 0;
            var unit = "";
            if (!string.IsNullOrWhiteSpace(priceRaw))
            {
                var slashIndex = priceRaw.IndexOf('/');
                if (slashIndex > -1)
                {
                    var priceStr = priceRaw[..slashIndex]
                        .Replace("Php", "")
                        .Trim();
                    unit = priceRaw[(slashIndex + 1)..]
                        .Trim();

                    decimal.TryParse(
                        priceStr,
                        System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture,
                        out unitPrice);
                }
            }

            items.Add(new PsdbmItemDto
            {
                ItemCode     = itemCode,
                Description  = description,
                UnitPrice    = unitPrice,
                Unit         = unit,
                Availability = availability
            });
        }

        return items;
    }
}