using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public record UpdateWFPCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public UpdateWFPRequest UpdateWFP { get; init; } = null!;
}

