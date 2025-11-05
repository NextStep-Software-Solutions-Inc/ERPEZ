using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Commands.DeleteWFPActivity;

public record class DeleteWFPActivityCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
