using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using HtmlAgilityPack;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetDepots;

public class GetPsdbmDepotsQueryHandler(IHttpClientFactory httpClientFactory)
    : IRequestHandler<GetPsdbmDepotsQuery, ApiResponse<List<PsdbmDepotDto>>>
{
    public async Task<ApiResponse<List<PsdbmDepotDto>>> Handle(
    GetPsdbmDepotsQuery request, CancellationToken cancellationToken)
{
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

    var lguDepots = await FetchLguDepotsAsync(
        httpClientFactory.CreateClient("psdbm"), cancellationToken); // ✅ named client

    depots.AddRange(lguDepots);

    return ApiResponse<List<PsdbmDepotDto>>.Success(depots, "Depots fetched successfully");
}

private static async Task<List<PsdbmDepotDto>> FetchLguDepotsAsync(
    HttpClient client, CancellationToken cancellationToken)
{
    var depots = new List<PsdbmDepotDto>();

    try
    {
        var response = await client.GetAsync(
            "https://sys.ps-philgeps.gov.ph/catalogue_lgu/index.php",
            cancellationToken);

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
                Region = "LGU" // ✅ fix #3 — was empty string
            });
        }
    }
    catch
    {
        // Silently return empty — regional depots still returned
    }

    return depots;
    }
}