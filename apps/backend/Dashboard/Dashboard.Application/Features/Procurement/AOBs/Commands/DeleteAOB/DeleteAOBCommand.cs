using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.DeleteAOB;

public record DeleteAOBCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
