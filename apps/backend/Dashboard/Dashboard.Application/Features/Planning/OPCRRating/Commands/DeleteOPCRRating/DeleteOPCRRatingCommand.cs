using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.DeleteOPCRRating;

public record DeleteOPCRRatingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
