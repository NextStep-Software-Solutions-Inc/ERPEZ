using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.DeleteRating;

public record DeleteRatingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
