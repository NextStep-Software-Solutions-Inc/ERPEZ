using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccountTransactionById;

public record GetAccountTransactionByIdQuery(Guid Id) : IRequest<ApiResponse<AccountTransactionResponse>>;
