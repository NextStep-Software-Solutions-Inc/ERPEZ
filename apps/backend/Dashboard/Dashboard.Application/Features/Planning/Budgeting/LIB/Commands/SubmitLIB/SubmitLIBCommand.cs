using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.SubmitLIB;

public record SubmitLIBCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
