using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.DeleteAPP;

public record DeleteAPPCommand(Guid Id) : IRequest<ApiResponse<bool>>;
