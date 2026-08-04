using ERPEZ.Domain.Enums;
using ERPEZ.Application.Common.Dtos;

namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class MarketScopingDataDto
{
    public string ProcuringEntity { get; set; } = string.Empty;
    public string ImplementingUnit { get; set; } = string.Empty;
    public string RepresentativeNameAndDesignation { get; set; } = string.Empty;

    public string ProjectName { get; set; } = string.Empty;
    public decimal EstimatedBudget { get; set; }
    public DateTime PeriodFrom { get; set; }
    public DateTime PeriodTo { get; set; }
    public DateTime ExpectedDeliveryDate { get; set; }

    public List<MarketScopingActivityDto> Activities { get; set; } = [];
    public List<MarketScopingParameterDto> Parameters { get; set; } = [];

    public SignatoryDto PreparedBy { get; set; } = new();
    public SignatoryDto ApprovedBy { get; set; } = new();
}

public class MarketScopingActivityDto
{
    public bool IsChecked { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Documentation { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class MarketScopingParameterDto
{
    public string ParameterName { get; set; } = string.Empty;
    public string GuidedQuestion { get; set; } = string.Empty;
    public string? Considered { get; set; } // Yes, No, Not Applicable
    public string? Recommendations { get; set; }
    public int SortOrder { get; set; }
}


