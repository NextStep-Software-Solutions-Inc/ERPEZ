using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public record UpdateSDGCommand(Guid Id, string Name, string? Description) : IRequest<ApiResponse<Unit>>;
