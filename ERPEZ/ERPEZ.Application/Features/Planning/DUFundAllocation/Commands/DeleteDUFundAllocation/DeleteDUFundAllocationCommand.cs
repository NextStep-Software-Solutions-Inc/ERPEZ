using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.DeleteDUFundAllocation;

public record class DeleteDUFundAllocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;