using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;

public class GetKPIsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIsQuery, PaginatedApiResponse<KPIResponse>>
{
    public async Task<PaginatedApiResponse<KPIResponse>> Handle(GetKPIsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPI, KPIResponse>> projection = kpi => new KPIResponse
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            FunctionType = kpi.FunctionType,
            Description = kpi.Description,
            Name = kpi.Name,
            IsOfficeMandate = kpi.IsOfficeMandate,
            IsPercentage = kpi.IsPercentage,
            IsTargetValueAllocable = kpi.IsTargetValueAllocable,
            Status = kpi.Status,
            OPCRName = kpi.OPCRName,
            CreatedBy = kpi.CreatedBy,
            CreatedAt = kpi.CreatedAt,
        };

        var includes = new List<Expression<Func<Domain.Entities.Planning.KPI, object>>>
        {
            k => k.KPIPerformanceMeasures,
            k => k.KPITargets,
            k => k.KPIModeOfVerifications,
            k => k.MFOPAP!,
            k => k.Attributes,
            k => k.SDGs
        };

        var (kpiDtos, totalCount) = await unitOfWork.KPIRepository.GetKPIsWithDetailsAsync(
            sieveModel,
            projection,
            includes,
            cancellationToken
        );

        return new PaginatedApiResponse<KPIResponse>([.. kpiDtos], query.PageNumber, query.PageSize, totalCount);
    }
}
