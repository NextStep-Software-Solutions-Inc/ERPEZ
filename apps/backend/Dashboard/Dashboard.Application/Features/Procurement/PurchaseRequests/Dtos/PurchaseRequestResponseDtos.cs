using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public record PurchaseRequestSummaryResponse
{
    public Guid     Id            { get; init; }
    public string   PRNumber      { get; init; } = string.Empty;
    public string?  Description   { get; init; }
    public string   PRType        { get; init; } = string.Empty;
    public string   Status        { get; init; } = string.Empty;
    public decimal  TotalAmount   { get; init; }
    public DateOnly RequestedDate { get; init; }
    public DateOnly CreatedDate   { get; init; }
    public Guid     OfficeId      { get; init; }
    public string   OfficeName    { get; init; } = string.Empty;
}

public record PurchaseRequestDetailResponse
{
    public Guid     Id                  { get; init; }
    public string   PRNumber            { get; init; } = string.Empty;
    public string?  Description         { get; init; }
    public string   Purpose             { get; init; } = string.Empty;
    public string   PRType              { get; init; } = string.Empty;
    public string   Status              { get; init; } = string.Empty;
    public DateOnly RequestedDate       { get; init; }
    public decimal  TotalAmount         { get; init; }
    public Guid     OfficeId            { get; init; }
    public string   OfficeName          { get; init; } = string.Empty;
    public string?  UACSCode            { get; init; }
    public string?  FundSource         { get; init; }
    public string?  ProcurementCategory { get; init; }
    public List<PRItemDetailResponse> Items { get; init; } = [];
    public List<ConsolidatedPRBacResolutionResponse>? BacResolutions { get; init; } = [];
}
