using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;

public record CreateAPPCommand : IRequest<ApiResponse<Guid>>
{
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public Guid OfficeId { get; init; }
    public string IsFinal { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? Description { get; init; }
}
