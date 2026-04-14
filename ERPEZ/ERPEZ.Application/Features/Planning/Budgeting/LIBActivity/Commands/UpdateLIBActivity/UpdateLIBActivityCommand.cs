using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.UpdateLIBActivity;

public record UpdateLIBActivityCommand(UpdateLIBActivityRequest Request) : IRequest<ApiResponse<Unit>>;




