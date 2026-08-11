using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;

public class UpdateFundSourceCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateFundSourceRequest UpdateFundSource { get; set; }
}
