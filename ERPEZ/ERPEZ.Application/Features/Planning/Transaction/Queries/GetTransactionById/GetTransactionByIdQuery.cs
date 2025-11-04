using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactionById;

public record GetTransactionByIdQuery(Guid Id) : IRequest<ApiResponse<TransactionDto>>;
