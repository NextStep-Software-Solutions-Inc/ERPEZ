using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.DeleteKPIRating;

public record DeleteKPIRatingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
