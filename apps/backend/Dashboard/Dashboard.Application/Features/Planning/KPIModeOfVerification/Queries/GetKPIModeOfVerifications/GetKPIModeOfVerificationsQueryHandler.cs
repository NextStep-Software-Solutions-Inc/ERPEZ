using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerifications;

public class GetKPIModeOfVerificationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIModeOfVerificationsQuery, PaginatedApiResponse<KPIModeOfVerificationResponse>>
{
    public async Task<PaginatedApiResponse<KPIModeOfVerificationResponse>> Handle(GetKPIModeOfVerificationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPIModeOfVerification, KPIModeOfVerificationResponse>> projection = kpiMov => new KPIModeOfVerificationResponse
        {
            Id = kpiMov.Id,
            KPIId = kpiMov.KPIId,
            Name = kpiMov.Name,
            Description = kpiMov.Description,
            Url = kpiMov.Url
        };

        var (kpiMoVs, totalCount) = await unitOfWork.KPIModeOfVerificationRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        return new PaginatedApiResponse<KPIModeOfVerificationResponse>(
            [.. kpiMoVs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
