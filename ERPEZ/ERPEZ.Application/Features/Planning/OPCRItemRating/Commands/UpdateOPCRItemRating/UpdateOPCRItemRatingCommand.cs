using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.UpdateOPCRItemRating;

public class UpdateOPCRItemRatingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public UpdateOPCRItemRatingRequest UpdateOPCRItemRating { get; set; } = null!;
}