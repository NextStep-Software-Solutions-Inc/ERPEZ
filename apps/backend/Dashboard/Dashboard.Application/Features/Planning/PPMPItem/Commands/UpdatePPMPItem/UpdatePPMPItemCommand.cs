using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.UpdatePPMPItem;

public record UpdatePPMPItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid? PPMPExpenditureItemId { get; init; }
    public Guid? CSEItemId { get; init; }
    public Guid? NonCSEItemId { get; init; }
    public Guid? ProcurementModeId { get; init; }
    public string? PAPCode { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Unit { get; init; }
    public decimal? UnitPrice { get; init; }
    public bool? MOPOverride { get; init; }
    public string? MOPJustification { get; init; }
    
    // ── New scheduling & project type fields ─────────────────────────────────
    public ProcurementProjectType? ProjectType             { get; init; }
    public bool?    PreProcurementConference               { get; init; }
    public DateOnly? ProcurementStartDate                  { get; init; }
    public DateOnly? ProcurementEndDate                    { get; init; }
    public DateOnly? ExpectedDeliveryStart                 { get; init; }
    public DateOnly? ExpectedDeliveryEnd                   { get; init; }
    public string?  Remarks                                { get; init; }
}
