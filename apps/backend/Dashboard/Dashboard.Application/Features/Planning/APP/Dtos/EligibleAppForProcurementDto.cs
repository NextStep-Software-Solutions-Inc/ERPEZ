using ERPEZ.Application.Features.Planning.APPItem.Dtos;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public class EligibleAppForProcurementDto
{
    public Guid Id { get; set; }
    public string APPNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid FiscalYearId { get; set; }
    public string FiscalYearName { get; set; } = string.Empty;
    public APPFiscalYearResponse? FiscalYear { get; set; }
    public List<EligibleAppItemDto> EligibleItems { get; set; } = [];
}

public record EligibleAppItemDto : APPItemResponse
{
    public string ItemNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}
