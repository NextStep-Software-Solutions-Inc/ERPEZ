using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.DeleteOPCRActivity;

public record class DeleteOPCRActivityCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
