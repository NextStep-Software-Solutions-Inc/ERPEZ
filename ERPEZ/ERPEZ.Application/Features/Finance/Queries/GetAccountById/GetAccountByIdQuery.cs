using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccountById;

public record GetAccountByIdQuery(Guid Id) : IRequest<ApiResponse<AccountResponse>>;
