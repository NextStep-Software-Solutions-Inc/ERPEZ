using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.DeleteOPCRActivityRating;

public record DeleteOPCRActivityRatingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
