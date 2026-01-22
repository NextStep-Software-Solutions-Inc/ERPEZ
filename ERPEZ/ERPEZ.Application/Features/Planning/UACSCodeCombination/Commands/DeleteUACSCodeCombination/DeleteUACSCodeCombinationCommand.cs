using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.DeleteUACSCodeCombination;

public record DeleteUACSCodeCombinationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
