using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public record CreateOPCRCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OfficeId { get; set; }
    public Guid FiscalYearId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
