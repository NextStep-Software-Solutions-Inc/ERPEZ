using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.DeleteOPCRActivity;

public record DeleteOPCRActivityCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
