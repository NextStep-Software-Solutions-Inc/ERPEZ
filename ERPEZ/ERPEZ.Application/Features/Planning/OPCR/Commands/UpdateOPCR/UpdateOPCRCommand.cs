using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public record UpdateOPCRCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRRequest UpdateOPCR { get; set; }
}
