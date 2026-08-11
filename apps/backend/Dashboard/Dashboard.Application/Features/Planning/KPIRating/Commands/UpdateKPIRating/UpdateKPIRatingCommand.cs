using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.UpdateKPIRating;

public class UpdateKPIRatingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateKPIRatingRequest UpdateRating { get; set; }
}
