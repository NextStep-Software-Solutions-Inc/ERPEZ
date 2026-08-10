using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.DeleteOPCRItemRating;

public record DeleteOPCRItemRatingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;