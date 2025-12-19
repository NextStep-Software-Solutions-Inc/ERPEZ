using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.DeleteDUAllocation;

public record DeleteDUAllocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
