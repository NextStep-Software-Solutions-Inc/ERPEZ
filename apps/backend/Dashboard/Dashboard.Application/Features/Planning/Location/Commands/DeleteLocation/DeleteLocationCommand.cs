using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.DeleteLocation;

public record DeleteLocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
