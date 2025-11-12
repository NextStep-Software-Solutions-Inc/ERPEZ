using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;

public class GetFundSourceByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourceByIdQuery, ApiResponse<Domain.Entities.Planning.FundSource>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FundSource>> Handle(GetFundSourceByIdQuery request, CancellationToken cancellationToken)
    {
        var fundSource = await unitOfWork.FundSourceRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.FundSource>.Success(fundSource, "Retrieved successfully");
    }
}
