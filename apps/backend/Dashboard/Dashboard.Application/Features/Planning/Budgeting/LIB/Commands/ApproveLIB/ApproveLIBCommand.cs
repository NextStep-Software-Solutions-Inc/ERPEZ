using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.ApproveLIB;

public record ApproveLIBCommand(Guid Id, bool IsFinalApproval = true) : IRequest<ApiResponse<Unit>>;
