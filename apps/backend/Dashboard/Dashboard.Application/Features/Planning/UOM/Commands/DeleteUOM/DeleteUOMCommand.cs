using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.DeleteUOM;

public record DeleteUOMCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
