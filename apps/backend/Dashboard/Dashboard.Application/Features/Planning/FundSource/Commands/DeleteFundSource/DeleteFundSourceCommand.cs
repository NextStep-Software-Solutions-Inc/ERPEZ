using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.DeleteFundSource;

public record DeleteFundSourceCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
