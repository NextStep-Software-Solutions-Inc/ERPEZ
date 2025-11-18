using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.UpdateTransaction;

public class UpdateTransactionCommand : IRequest<ApiResponse<Domain.Entities.Planning.Transaction>>
{
    public Guid Id { get; set; }
    public required UpdateTransactionDto UpdateTransaction { get; set; }
}
