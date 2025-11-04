using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerifications;

public class GetKPIModeOfVerificationsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetKPIModeOfVerificationsQuery, PaginatedApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.KPIModeOfVerification>> Handle(GetKPIModeOfVerificationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (kpiMoVs, totalCount) = await _unitOfWork.KPIModeOfVerificationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.KPIModeOfVerification>(
            [.. kpiMoVs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
