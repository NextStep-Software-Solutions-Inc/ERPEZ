using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.DeleteKPIRating;

public record class DeleteKPIRatingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
