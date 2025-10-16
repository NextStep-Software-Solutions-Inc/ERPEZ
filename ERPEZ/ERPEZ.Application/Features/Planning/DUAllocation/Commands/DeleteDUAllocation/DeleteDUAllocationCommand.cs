using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.DeleteDUAllocation;

public record class DeleteDUAllocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;