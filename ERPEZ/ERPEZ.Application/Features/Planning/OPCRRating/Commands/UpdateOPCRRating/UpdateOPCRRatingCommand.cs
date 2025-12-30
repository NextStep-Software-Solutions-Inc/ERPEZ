using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.UpdateOPCRRating;

public class UpdateOPCRRatingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRRatingRequest UpdateOPCRRating { get; set; }
}

