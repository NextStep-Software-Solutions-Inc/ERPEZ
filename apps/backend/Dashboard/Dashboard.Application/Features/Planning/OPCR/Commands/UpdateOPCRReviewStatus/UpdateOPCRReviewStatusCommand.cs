using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;


namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRReviewStatus;

public record UpdateOPCRReviewStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRReviewStatusRequest Request { get; set; }
}
