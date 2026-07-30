using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBVersionHistory;

public record GetLIBVersionHistoryQuery(Guid Id) : IRequest<ApiResponse<List<LIBVersionHistoryResponse>>>;
