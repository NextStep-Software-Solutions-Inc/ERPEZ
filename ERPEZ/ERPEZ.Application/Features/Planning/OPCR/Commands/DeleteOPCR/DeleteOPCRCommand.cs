using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.DeleteOPCR;

public record class DeleteOPCRCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
