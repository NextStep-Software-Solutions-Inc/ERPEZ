using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.DeleteLIBActivity;

public record DeleteLIBActivityCommand(Guid Id) : IRequest<ApiResponse<Unit>>;




