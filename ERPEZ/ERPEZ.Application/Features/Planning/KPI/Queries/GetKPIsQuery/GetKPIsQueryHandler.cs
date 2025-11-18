using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.MFOKPI.Dtos;
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

        Expression<Func<Domain.Entities.Planning.KPI, KPIResponse>> projection =
            kpi => new KPIResponse
            {
                Id = kpi.Id,
                ParentKPIId = kpi.ParentKPIId,
                FunctionType = kpi.FunctionType,
                Description = kpi.Description,
                Name = kpi.Name,
                IsOfficeMandate = kpi.IsOfficeMandate,
                IsPercentage = kpi.IsPercentage,
                Status = kpi.Status,
                CreatedBy = kpi.CreatedBy,
                CreatedAt = kpi.CreatedAt,

                KPIRatings = kpi.KPIRatings.Select(m => new KPIRatingResponse
                {
                    Id = m.Id,
                    KPIId = m.KPIId,
                    PerformanceMeasureId = m.PerformanceMeasureId,
                    NumericalRating = m.NumericalRating,
                    Remarks = m.Remarks,
                }).ToList(),

                KPITargets = kpi.KPITargets.Select(m => new KPITargetResponse
                {
                    Id = m.Id,
                    KPIId = m.KPIId,
                    Period = m.Period,
                    QuarterName = m.QuarterName,
                    TargetValue = m.TargetValue
                }).ToList(),

                KPIModeOfVerifications = kpi.KPIModeOfVerifications.Select(m => new KPIModeOfVerificationDto
                {
                    Id = m.Id,
                    KPIId = m.KPIId,
                    Name = m.Name,
                    Description = m.Description,
                    Url = m.Url
                }).ToList(),

                MFOKPIs = kpi.MFOKPIs.Select(m => new MFOKPIDto
                {
                    Id = m.Id,
                    KPIId = m.KPIId,
                    MFOPAP = new()
                    {
                        Name = m.MFOPAP!.Name ?? ""
                    }
                }).ToList(),

                Attributes = kpi.Attributes.Select(m => new AttributeResponse
                {
                    Id = m.Id,
                    Name = m.Name,
                    Code = m.Code,
                    Description = m.Description,
                    ParentAttributeId = m.ParentAttributeId
                }).ToList(),

                SDGs = kpi.SDGs.Select(m => new SDGResponse
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description
                }).ToList()
            };

        var includes = new List<Expression<Func<Domain.Entities.Planning.KPI, object>>>
        {
            k => k.KPIRatings,
            k => k.KPITargets,
            k => k.KPIModeOfVerifications,
            k => k.MFOKPIs,
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
