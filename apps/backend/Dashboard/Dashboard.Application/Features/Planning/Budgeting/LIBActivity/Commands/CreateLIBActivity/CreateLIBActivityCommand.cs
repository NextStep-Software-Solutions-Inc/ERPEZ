using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.CreateLIBActivity;

public record CreateLIBActivityCommand(CreateLIBActivityRequest Request) : IRequest<ApiResponse<Guid>>;




