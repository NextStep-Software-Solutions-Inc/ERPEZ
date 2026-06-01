using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using HtmlAgilityPack;
using System.Web;

namespace ERPEZ.Infrastructure.Services;

public class PhilGepsService(IHttpClientFactory httpClientFactory) : IPhilGepsService
{
    public async Task<List<PsdbmItemDto>> GetItemsAsync(
        string mode,
        string? search,
        string? category,
        int max,
        string? depot,
        CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("psdbm");

        string baseUrl = mode.ToLower() switch
        {
            "main"     => "https://sys.ps-philgeps.gov.ph/catalogue/item_content.php",
            "regional" => "https://sys.ps-philgeps.gov.ph/catalogue_depot/item_content.php",
            "lgu"      => "https://sys.ps-philgeps.gov.ph/catalogue_lgu/item_content.php",
            _          => throw new ArgumentException($"Invalid mode: {mode}")
        };

        var query = HttpUtility.ParseQueryString(string.Empty);
        if (!string.IsNullOrWhiteSpace(search))   query["search"] = search;
        if (!string.IsNullOrWhiteSpace(category)) query["cat"]    = category;
        if (max > 0)                               query["max"]    = max.ToString();
        if (!string.IsNullOrWhiteSpace(depot) && mode.ToLower() != "main")
            query["depot"] = depot;

        var response = await client.GetAsync($"{baseUrl}?{query}", cancellationToken);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseItems(html);
    }

    public async Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
        string mode,
        CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("psdbm");

        string targetUrl = mode.ToLower() switch
        {
            "main" or "regional" => "https://sys.ps-philgeps.gov.ph/catalogue_depot/index.php",
            "lgu"                => "https://sys.ps-philgeps.gov.ph/catalogue_lgu/index.php",
            _                    => throw new ArgumentException($"Invalid mode: {mode}")
        };

        var response = await client.GetAsync(targetUrl, cancellationToken);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseCategories(html);
    }

    public async Task<List<PsdbmDepotDto>> GetDepotsAsync(
        CancellationToken cancellationToken = default)
    {
        // Last verified: May 2026
        // Source: https://sys.ps-philgeps.gov.ph/catalogue_depot/index.php
        // Update if PS-PhilGEPS opens or closes regional depots
        var depots = new List<PsdbmDepotDto>
        {
            new() { Id = "depot-baguio",         Name = "BAGUIO",         Region = "Cordillera Administrative Region" },
            new() { Id = "depot-la-union",        Name = "LA UNION",       Region = "Ilocos Region" },
            new() { Id = "depot-tuguegarao",      Name = "TUGUEGARAO",     Region = "Cagayan Valley" },
            new() { Id = "depot-legazpi",         Name = "LEGAZPI",        Region = "Bicol Region" },
            new() { Id = "depot-cebu",            Name = "CEBU",           Region = "Central Visayas" },
            new() { Id = "depot-tacloban",        Name = "TACLOBAN",       Region = "Eastern Visayas" },
            new() { Id = "depot-cagayan-de-oro",  Name = "CAGAYAN DE ORO", Region = "Northern Mindanao" },
            new() { Id = "depot-davao",           Name = "DAVAO",          Region = "Davao Region" },
            new() { Id = "depot-koronadal",       Name = "KORONADAL",      Region = "SOCCSKSARGEN" },
            new() { Id = "depot-butuan",          Name = "BUTUAN",         Region = "Caraga" },
            new() { Id = "depot-pampanga",        Name = "PAMPANGA",       Region = "Central Luzon" },
        };

        var lguDepots = await FetchLguDepotsAsync(cancellationToken);
        depots.AddRange(lguDepots);
        return depots;
    }

    // =====================
    // Private helpers
    // =====================

    private async Task<List<PsdbmDepotDto>> FetchLguDepotsAsync(
        CancellationToken cancellationToken)
    {
        var depots = new List<PsdbmDepotDto>();
        try
        {
            var client   = httpClientFactory.CreateClient("psdbm");
            var response = await client.GetAsync(
                "https://sys.ps-philgeps.gov.ph/catalogue_lgu/index.php", cancellationToken);

            if (!response.IsSuccessStatusCode) return depots;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var doc  = new HtmlDocument();
            doc.LoadHtml(html);

            var selectNode = doc.DocumentNode
                .SelectSingleNode("//select[@name='regional_depot']");
            if (selectNode == null) return depots;

            var options = selectNode.SelectNodes(".//option");
            if (options == null) return depots;

            foreach (var option in options)
            {
                var name  = option.InnerText.Trim();
                var value = option.GetAttributeValue("value", "").Trim();
                if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(value))
                    continue;

                depots.Add(new PsdbmDepotDto
                {
                    Id     = $"lgu-{value.ToLower().Replace(" ", "-")}",
                    Name   = name,
                    Region = "LGU"
                });
            }
        }
        catch { /* Silently return empty — regional depots still returned */ }

        return depots;
    }

    private static List<PsdbmItemDto> ParseItems(string html)
    {
        var items = new List<PsdbmItemDto>();
        var doc   = new HtmlDocument();
        doc.LoadHtml(html);

        var col3Divs = doc.DocumentNode
            .SelectNodes("//div[contains(@class,'col-3')]");
        if (col3Divs == null) return items;

        foreach (var col3 in col3Divs)
        {
            var anchor = col3.SelectSingleNode(".//a[contains(@href,'item_code')]");
            if (anchor == null) continue;

            var href      = anchor.GetAttributeValue("href", "");
            var itemCode  = "";
            var hrefParts = href.Split('?');
            if (hrefParts.Length > 1)
            {
                var queryParams = HttpUtility.ParseQueryString(hrefParts[1]);
                itemCode = queryParams["item_code"] ?? "";
            }

            var availSpan    = col3.SelectSingleNode(".//div[contains(@style,'background-color')]/span");
            var availability = availSpan?.InnerText.Trim() ?? "";

            var descNode    = col3.SelectSingleNode(".//p[contains(@class,'text-one-line')]//strong");
            var description = descNode != null
                ? System.Text.RegularExpressions.Regex.Replace(descNode.InnerText, @"\s+", " ").Trim()
                : "";

            var priceNode = col3.SelectSingleNode(".//p[contains(@style,'font-size:13px')]");
            var priceRaw  = priceNode?.InnerText.Trim() ?? "";

            decimal unitPrice = 0;
            var unit = "";
            if (!string.IsNullOrWhiteSpace(priceRaw))
            {
                var slashIndex = priceRaw.IndexOf('/');
                if (slashIndex > -1)
                {
                    var priceStr = priceRaw[..slashIndex].Replace("Php", "").Trim();
                    unit = priceRaw[(slashIndex + 1)..].Trim();
                    decimal.TryParse(priceStr,
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

    private static List<PsdbmCategoryDto> ParseCategories(string html)
    {
        var categories = new List<PsdbmCategoryDto>();
        var doc        = new HtmlDocument();
        doc.LoadHtml(html);

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
