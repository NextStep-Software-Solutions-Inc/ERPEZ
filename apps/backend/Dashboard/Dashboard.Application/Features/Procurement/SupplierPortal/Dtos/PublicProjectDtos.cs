namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;

public record PublicProjectListItemDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ContractNo { get; init; } = string.Empty;
    public decimal ABC { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime? SubmissionDeadline { get; init; }
    public DateTime? DatePosted { get; init; }
}

public record PublicProjectDetailDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ContractNo { get; init; } = string.Empty;
    public decimal ABC { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? ScopeOfWork { get; init; }
    public decimal? NonRefundableBidderFee { get; init; }
    public int? DeliveryPeriodDays { get; init; }
    public DateTime? SubmissionDeadline { get; init; }
    public DateTime? BidOpeningDate { get; init; }
    public DateTime? PreBidConferenceDate { get; init; }
    public DateTime? DatePosted { get; init; }
    public List<RequiredSubmissionDto> RequiredSubmissions { get; init; } = [];
    public List<BidNoticeDto> BidNotices { get; init; } = [];
}

public record RequiredSubmissionDto
{
    public Guid ChecklistItemId { get; init; }
    public string DocumentName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsRequired { get; init; }
    public int OrderIndex { get; init; }
    public string? DownloadUrl { get; init; }
    public bool HasTemplate => !string.IsNullOrEmpty(DownloadUrl);
}

public record BidNoticeDto
{
    public Guid ChecklistItemId { get; init; }
    public string DocumentName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string DownloadUrl { get; init; } = string.Empty;
    public int OrderIndex { get; init; }
    public DateTime PostedOn { get; init; }
}

public record PublicProjectStatsDto
{
    public int ActiveProjects { get; init; }
    public int PublicBidding { get; init; }
    public int SmallValueProcurement { get; init; }
    public int ClosingSoon { get; init; }
    public int Closed { get; init; }
}
