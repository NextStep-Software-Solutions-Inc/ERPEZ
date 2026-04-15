using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;

public record UpdateLIBCommand(Guid Id, UpdateLIBRequest Request) : IRequest<ApiResponse<Unit>>;




