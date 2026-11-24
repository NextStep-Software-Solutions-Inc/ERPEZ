using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using HtmlAgilityPack;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Web;

namespace ERPEZ.Infrastructure.Services;

public class PhilGepsService(IHttpClientFactory httpClientFactory) : IPhilGepsService
{
    private const string baseHost = "https://sys.ps-philgeps.gov.ph";

    private static readonly Dictionary<string, string> knownRegionalDepotRegions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["BAGUIO"] = "Cordillera Administrative Region",
        ["LA UNION"] = "Ilocos Region",
        ["TUGUEGARAO"] = "Cagayan Valley",
        ["LEGAZPI"] = "Bicol Region",
        ["CEBU"] = "Central Visayas",
        ["TACLOBAN"] = "Eastern Visayas",
        ["CAGAYAN DE ORO"] = "Northern Mindanao",
        ["DAVAO"] = "Davao Region",
        ["KORONADAL"] = "SOCCSKSARGEN",
        ["BUTUAN"] = "Caraga",
        ["PAMPANGA"] = "Central Luzon"
    };

    private static readonly List<PsdbmDepotDto> fallbackRegionalDepots =
    [
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
    ];

    private static readonly List<PsdbmDepotDto> fallbackLguDepots =
    [
        new() { Id = "lgu-bacolod",            Name = "BACOLOD",            Region = "LGU" },
        new() { Id = "lgu-palawan",            Name = "PALAWAN",            Region = "LGU" },
        new() { Id = "lgu-zamboanga",          Name = "ZAMBOANGA",          Region = "LGU" },
        new() { Id = "lgu-misamis-oriental",   Name = "MISAMIS ORIENTAL",   Region = "LGU" },
        new() { Id = "lgu-calbayog",           Name = "CALBAYOG",           Region = "LGU" },
        new() { Id = "lgu-misamis-occidental", Name = "MISAMIS OCCIDENTAL", Region = "LGU" },
        new() { Id = "lgu-bontoc",             Name = "BONTOC",             Region = "LGU" },
        new() { Id = "lgu-borongan",           Name = "BORONGAN",           Region = "LGU" },
        new() { Id = "lgu-camiguin",           Name = "CAMIGUIN",           Region = "LGU" },
        new() { Id = "lgu-bukidnon",           Name = "BUKIDNON",           Region = "LGU" },
        new() { Id = "lgu-surigao",            Name = "SURIGAO",            Region = "LGU" },
        new() { Id = "lgu-biliran",            Name = "BILIRAN",            Region = "LGU" },
        new() { Id = "lgu-catarman",           Name = "CATARMAN",           Region = "LGU" },
        new() { Id = "lgu-maasin",             Name = "MAASIN",             Region = "LGU" },
        new() { Id = "lgu-zamboanga-sibugay",  Name = "ZAMBOANGA SIBUGAY",  Region = "LGU" },
    ];

    public async Task<List<PsdbmItemDto>> GetItemsAsync(
        string mode,
        string? search,
        string? category,
        int max,
        string? depot,
        CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("psdbm");

        string baseUrl = mode.ToLowerInvariant() switch
        {
            "main"     => $"{baseHost}/catalogue/item_content.php",
            "regional" => $"{baseHost}/catalogue_depot/item_content.php",
            "lgu"      => $"{baseHost}/catalogue_lgu/item_content.php",
            _          => throw new ArgumentException($"Invalid mode: {mode}")
        };

        var query = HttpUtility.ParseQueryString(string.Empty);
        if (!string.IsNullOrWhiteSpace(search))   query["search"] = search;
        if (!string.IsNullOrWhiteSpace(category)) query["cat"]    = category;
        if (max > 0)                               query["max"]    = max.ToString();
        if (!string.IsNullOrWhiteSpace(depot) && !mode.Equals("main", StringComparison.OrdinalIgnoreCase))
            query["depot"] = depot;

        var url = query.Count > 0 ? $"{baseUrl}?{query}" : baseUrl;
        var response = await client.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseItems(html);
    }

    public async Task<PsdbmItemDetailsDto?> GetItemDetailsAsync(
        string itemCode,
        string? depot = null,
        string? category = "All",
        string mode = "regional",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(itemCode))
            throw new ArgumentException("Item code cannot be null or whitespace.", nameof(itemCode));

        var client = httpClientFactory.CreateClient("psdbm");

        string baseUrl = mode.ToLowerInvariant() switch
        {
            "main"     => $"{baseHost}/catalogue/item_preview.php",
            "regional" => $"{baseHost}/catalogue_depot/item_preview.php",
            "lgu"      => $"{baseHost}/catalogue_lgu/item_preview.php",
            _          => $"{baseHost}/catalogue_depot/item_preview.php"
        };

        var query = HttpUtility.ParseQueryString(string.Empty);
        query["item_code"] = itemCode.Trim();
        query["cat"] = string.IsNullOrWhiteSpace(category) ? "All" : category.Trim();

        if (!string.IsNullOrWhiteSpace(depot) && !mode.Equals("main", StringComparison.OrdinalIgnoreCase))
        {
            query["depot"] = depot.Trim();
        }

        var requestUrl = $"{baseUrl}?{query}";
        var response = await client.GetAsync(requestUrl, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var html = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseItemDetails(html, baseUrl, itemCode, depot, mode);
    }

    public async Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
        string mode,
        CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("psdbm");

        string targetUrl = mode.ToLowerInvariant() switch
        {
            "main"     => $"{baseHost}/catalogue/index.php",
            "regional" => $"{baseHost}/catalogue_depot/index.php",
            "lgu"      => $"{baseHost}/catalogue_lgu/index.php",
            _          => throw new ArgumentException($"Invalid mode: {mode}")
        };

        var response = await client.GetAsync(targetUrl, cancellationToken);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseCategories(html);
    }

    public async Task<List<PsdbmDepotDto>> GetDepotsAsync(
        CancellationToken cancellationToken = default)
    {
        var regionalTask = GetRegionalDepotsAsync(cancellationToken);
        var lguTask = GetLguDepotsAsync(cancellationToken);

        await Task.WhenAll(regionalTask, lguTask);

        var combined = new List<PsdbmDepotDto>();
        combined.AddRange(regionalTask.Result);
        combined.AddRange(lguTask.Result);
        return combined;
    }

    public async Task<List<PsdbmDepotDto>> GetRegionalDepotsAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var client = httpClientFactory.CreateClient("psdbm");
            var response = await client.GetAsync($"{baseHost}/catalogue_depot/index.php", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return fallbackRegionalDepots;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var parsed = ParseDepotDropdown(html, isLgu: false);
            return parsed.Count > 0 ? parsed : fallbackRegionalDepots;
        }
        catch
        {
            return fallbackRegionalDepots;
        }
    }

    public async Task<List<PsdbmDepotDto>> GetLguDepotsAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var client = httpClientFactory.CreateClient("psdbm");
            var response = await client.GetAsync($"{baseHost}/catalogue_lgu/index.php", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return fallbackLguDepots;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var parsed = ParseDepotDropdown(html, isLgu: true);
            return parsed.Count > 0 ? parsed : fallbackLguDepots;
        }
        catch
        {
            return fallbackLguDepots;
        }
    }

    // =====================
    // Static HTML Parsers
    // =====================

    public static PsdbmItemDetailsDto? ParseItemDetails(
        string html,
        string baseUrl = "",
        string fallbackItemCode = "",
        string? depot = null,
        string? mode = null)
    {
        if (string.IsNullOrWhiteSpace(html)) return null;

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Product description from <h3> in s_product_text
        var descNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class,'s_product_text')]//h3")
                    ?? doc.DocumentNode.SelectSingleNode("//h3");
        var description = descNode != null
            ? Regex.Replace(HtmlEntity.DeEntitize(descNode.InnerText), @"\s+", " ").Trim()
            : string.Empty;

        // Price from <h2> inside s_product_text
        var priceNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class,'s_product_text')]//h2")
                     ?? doc.DocumentNode.SelectSingleNode("//h2[contains(@class,'text-primary')]");
        var priceRaw = priceNode != null ? HtmlEntity.DeEntitize(priceNode.InnerText).Trim() : string.Empty;
        decimal unitPrice = ParsePrice(priceRaw);

        // Extract key-value pairs from <ul><li> list
        string itemCode = fallbackItemCode;
        string unit = string.Empty;
        string category = string.Empty;
        string status = string.Empty;
        int availableStock = 0;
        int remainingQty = 0;

        var listItems = doc.DocumentNode.SelectNodes("//ul[contains(@class,'list')]//li")
                     ?? doc.DocumentNode.SelectNodes("//li[.//span and .//b]");

        if (listItems != null)
        {
            foreach (var li in listItems)
            {
                var labelNode = li.SelectSingleNode(".//span");
                var valueNode = li.SelectSingleNode(".//b");
                if (labelNode == null || valueNode == null) continue;

                var label = HtmlEntity.DeEntitize(labelNode.InnerText).Trim().TrimEnd(':').Trim();
                var value = HtmlEntity.DeEntitize(valueNode.InnerText).Trim();

                if (label.Equals("Item Code", StringComparison.OrdinalIgnoreCase))
                {
                    itemCode = value;
                }
                else if (label.Equals("UOM", StringComparison.OrdinalIgnoreCase) ||
                         label.Equals("Unit", StringComparison.OrdinalIgnoreCase))
                {
                    unit = value;
                }
                else if (label.Equals("Category", StringComparison.OrdinalIgnoreCase))
                {
                    category = value;
                }
                else if (label.Equals("Status", StringComparison.OrdinalIgnoreCase) ||
                         label.Equals("Availability", StringComparison.OrdinalIgnoreCase))
                {
                    status = value;
                }
                else if (label.Contains("Available Stocks on Hand", StringComparison.OrdinalIgnoreCase))
                {
                    availableStock = ParseInteger(value);
                }
                else if (label.Contains("Remaining Qty. for Delivery", StringComparison.OrdinalIgnoreCase) ||
                         label.Contains("Remaining Qty", StringComparison.OrdinalIgnoreCase))
                {
                    remainingQty = ParseInteger(value);
                }
            }
        }

        // Image URL resolution
        var imageNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class,'carousel-inner')]//img")
                     ?? doc.DocumentNode.SelectSingleNode("//div[contains(@class,'s_product_img')]//img")
                     ?? doc.DocumentNode.SelectSingleNode("//img[contains(@src,'user_images')]");
        string? imageUrl = null;
        if (imageNode != null)
        {
            var rawSrc = imageNode.GetAttributeValue("src", "").Trim();
            if (!string.IsNullOrWhiteSpace(rawSrc) && !rawSrc.Contains("no_image.jpg", StringComparison.OrdinalIgnoreCase))
            {
                imageUrl = ResolveUrl(rawSrc, baseUrl);
            }
        }

        // Tech specs PDF URL resolution
        var techSpecNode = doc.DocumentNode.SelectSingleNode("//a[contains(@href,'tech_specs') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'technical specification')]");
        string? techSpecUrl = null;
        if (techSpecNode != null)
        {
            var rawHref = techSpecNode.GetAttributeValue("href", "").Trim();
            if (!string.IsNullOrWhiteSpace(rawHref))
            {
                techSpecUrl = ResolveUrl(rawHref, baseUrl);
            }
        }

        return new PsdbmItemDetailsDto
        {
            ItemCode = itemCode,
            Description = description,
            UnitPrice = unitPrice,
            Unit = unit,
            Category = category,
            Status = status,
            AvailableStock = availableStock,
            RemainingQtyForDelivery = remainingQty,
            ImageUrl = imageUrl,
            TechnicalSpecificationUrl = techSpecUrl,
            Depot = depot,
            Mode = mode
        };
    }

    public static List<PsdbmItemDto> ParseItems(string html)
    {
        var items = new List<PsdbmItemDto>();
        if (string.IsNullOrWhiteSpace(html)) return items;

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var col3Divs = doc.DocumentNode.SelectNodes("//div[contains(@class,'col-3')]");
        if (col3Divs == null) return items;

        foreach (var col3 in col3Divs)
        {
            var anchor = col3.SelectSingleNode(".//a[contains(@href,'item_code')]");
            if (anchor == null) continue;

            var href = anchor.GetAttributeValue("href", "");
            var itemCode = "";
            var hrefParts = href.Split('?');
            if (hrefParts.Length > 1)
            {
                var queryParams = HttpUtility.ParseQueryString(hrefParts[1]);
                itemCode = queryParams["item_code"] ?? "";
            }

            var availSpan = col3.SelectSingleNode(".//div[contains(@style,'background-color')]/span");
            var availability = availSpan != null ? HtmlEntity.DeEntitize(availSpan.InnerText).Trim() : "";

            var descNode = col3.SelectSingleNode(".//p[contains(@class,'text-one-line')]//strong");
            var description = descNode != null
                ? Regex.Replace(HtmlEntity.DeEntitize(descNode.InnerText), @"\s+", " ").Trim()
                : "";

            var priceNode = col3.SelectSingleNode(".//p[contains(@style,'font-size:13px')]");
            var priceRaw = priceNode != null ? HtmlEntity.DeEntitize(priceNode.InnerText).Trim() : "";

            decimal unitPrice = 0;
            var unit = "";
            if (!string.IsNullOrWhiteSpace(priceRaw))
            {
                var slashIndex = priceRaw.IndexOf('/');
                if (slashIndex > -1)
                {
                    var priceStr = priceRaw[..slashIndex].Replace("Php", "", StringComparison.OrdinalIgnoreCase).Replace("P", "", StringComparison.OrdinalIgnoreCase).Trim();
                    unit = priceRaw[(slashIndex + 1)..].Trim();
                    decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out unitPrice);
                }
                else
                {
                    unitPrice = ParsePrice(priceRaw);
                }
            }

            items.Add(new PsdbmItemDto
            {
                ItemCode = itemCode,
                Description = description,
                UnitPrice = unitPrice,
                Unit = unit,
                Availability = availability
            });
        }

        return items;
    }

    public static List<PsdbmCategoryDto> ParseCategories(string html)
    {
        var categories = new List<PsdbmCategoryDto>();
        if (string.IsNullOrWhiteSpace(html)) return categories;

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var selectNode = doc.DocumentNode.SelectSingleNode("//select[@name='subcat']");
        if (selectNode == null) return categories;

        var options = selectNode.SelectNodes(".//option");
        if (options == null) return categories;

        foreach (var option in options)
        {
            var name = HtmlEntity.DeEntitize(option.InnerText).Trim();
            var id = option.GetAttributeValue("value", "").Trim();

            if (string.IsNullOrWhiteSpace(name)
                || name.Equals("All", StringComparison.OrdinalIgnoreCase)
                || name.Contains("Select", StringComparison.OrdinalIgnoreCase))
                continue;

            categories.Add(new PsdbmCategoryDto
            {
                Id = string.IsNullOrWhiteSpace(id) ? name : id,
                Name = name,
                ItemCount = 0
            });
        }

        return categories;
    }

    public static List<PsdbmDepotDto> ParseDepotDropdown(string html, bool isLgu)
    {
        var depots = new List<PsdbmDepotDto>();
        if (string.IsNullOrWhiteSpace(html)) return depots;

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var selectNode = doc.DocumentNode.SelectSingleNode("//select[@name='regional_depot']");
        if (selectNode == null) return depots;

        var options = selectNode.SelectNodes(".//option");
        if (options == null) return depots;

        foreach (var option in options)
        {
            var name = HtmlEntity.DeEntitize(option.InnerText).Trim();
            var value = option.GetAttributeValue("value", "").Trim();
            var cleanName = string.IsNullOrWhiteSpace(name) ? value : name;

            if (string.IsNullOrWhiteSpace(cleanName) ||
                cleanName.Equals("All", StringComparison.OrdinalIgnoreCase) ||
                cleanName.Contains("Select", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var idPrefix = isLgu ? "lgu-" : "depot-";
            var normalizedId = $"{idPrefix}{cleanName.ToLowerInvariant().Replace(" ", "-")}";

            string region = isLgu
                ? "LGU"
                : knownRegionalDepotRegions.GetValueOrDefault(cleanName, "Regional Depot");

            depots.Add(new PsdbmDepotDto
            {
                Id = normalizedId,
                Name = cleanName,
                Region = region
            });
        }

        return depots;
    }

    private static decimal ParsePrice(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return 0;
        var sanitized = Regex.Replace(raw, @"[^\d.]", "");
        return decimal.TryParse(sanitized, NumberStyles.Any, CultureInfo.InvariantCulture, out var price)
            ? price
            : 0;
    }

    private static int ParseInteger(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return 0;
        var sanitized = Regex.Replace(raw, @"[^\d]", "");
        return int.TryParse(sanitized, NumberStyles.Any, CultureInfo.InvariantCulture, out var value)
            ? value
            : 0;
    }

    private static string ResolveUrl(string relativeOrAbsolute, string baseUrl)
    {
        if (Uri.TryCreate(relativeOrAbsolute, UriKind.Absolute, out var absoluteUri))
        {
            return absoluteUri.ToString();
        }

        // Clean relative prefixes like ../catalogue/
        if (relativeOrAbsolute.StartsWith("../"))
        {
            return $"{baseHost}/{relativeOrAbsolute.TrimStart('.', '/')}";
        }

        if (relativeOrAbsolute.StartsWith("/"))
        {
            return $"{baseHost}{relativeOrAbsolute}";
        }

        if (!string.IsNullOrWhiteSpace(baseUrl) && Uri.TryCreate(baseUrl, UriKind.Absolute, out var baseUri))
        {
            return new Uri(baseUri, relativeOrAbsolute).ToString();
        }

        return $"{baseHost}/{relativeOrAbsolute}";
    }
}
