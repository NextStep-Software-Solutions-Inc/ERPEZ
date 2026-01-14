using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRActivityRating;

public class UpdateOPCRActivityRatingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRActivityRatingRequest UpdateRating { get; set; }
}
