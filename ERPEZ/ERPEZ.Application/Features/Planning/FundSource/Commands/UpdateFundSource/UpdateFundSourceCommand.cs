using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;

public class UpdateFundSourceCommand : IRequest<ApiResponse<Domain.Entities.Planning.FundSource>>
{
    public Guid Id { get; set; }
    public required UpdateFundSourceDto UpdateFundSource { get; set; }
}
