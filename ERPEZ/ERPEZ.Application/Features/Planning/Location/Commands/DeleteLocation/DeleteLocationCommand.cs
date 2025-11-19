using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.DeleteLocation;

public record class DeleteLocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
