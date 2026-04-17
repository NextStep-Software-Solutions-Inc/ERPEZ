using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.CreatePPMP;

public record CreatePPMPCommand : IRequest<ApiResponse<Guid>>
{
    public string PPMPNumber { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid FundSourceId { get; init; }
    public Guid LIBId { get; init; }
    public Guid? ParentId { get; init; }
}
