using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.DeleteOPCRKPI;

public record class DeleteOPCRKPICommand(Guid Id) : IRequest<ApiResponse<Unit>>;
