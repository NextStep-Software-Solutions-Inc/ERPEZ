using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRRatingStatus;

public record UpdateOPCRRatingStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRRatingStatusRequest UpdateStatus { get; set; }
}
