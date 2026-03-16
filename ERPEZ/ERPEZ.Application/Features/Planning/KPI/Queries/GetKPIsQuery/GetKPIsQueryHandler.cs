using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;

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
            ParentKPI = kpi.ParentKPI != null ? new Dtos.ParentKPIResponse
            {
                Id = kpi.ParentKPI.Id,
                Name = kpi.ParentKPI.Name,
                Code = kpi.ParentKPI.Code,
                Description = kpi.ParentKPI.Description,
                Status = kpi.ParentKPI.Status,
                FunctionCategory = kpi.ParentKPI.FunctionCategory
            } : null,
            MFOPAPId = kpi.MFOPAPId,
            Name = kpi.Name,
            Code = kpi.Code,
            Description = kpi.Description,
            MeasurementUnit = kpi.MeasurementUnit,
            DistributionBehavior = kpi.DistributionBehavior,
            FunctionCategory = kpi.FunctionCategory,
            MonitoringFrequency = kpi.MonitoringFrequency,
            IsOptInAvailable = kpi.IsOptInAvailable,
            IsGAD = kpi.IsGAD,
            Status = kpi.Status,
            CreatedBy = kpi.CreatedBy,
            CreatedAt = kpi.CreatedAt,
            
            KPIMeasurements = kpi.KPIMeasurements.Select(m => new KPIMeasurement.Dtos.KPIMeasurementResponse
            {
                Id = m.Id,
                KPIId = m.KPIId,
                Dimension = m.Dimension,
                MOVs = m.MOVs,
                RatingScaleTemplateId = m.RatingScaleTemplateId,
                IsMOVEditable = m.IsMOVEditable,
                IsScaleEditable = m.IsScaleEditable,
                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy
            }).ToList(),
            
            MFOPAP = kpi.MFOPAP != null ? new MFOPAP.Dtos.MFOPAPResponse
            {
                Id = kpi.MFOPAP.Id,
                ParentId = kpi.MFOPAP.ParentId,
                Name = kpi.MFOPAP.Name,
                Code = kpi.MFOPAP.Code,
                Type = kpi.MFOPAP.Type,
                IsActive = kpi.MFOPAP.IsActive
            } : null,
            
            Attributes = kpi.Attributes.Select(a => new Attribute.Dtos.AttributeResponse
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.Code,
                Description = a.Description,
                ParentAttributeId = a.ParentAttributeId
            }).ToList(),
            
            SDGs = kpi.SDGs.Select(s => new SDG.Dtos.SDGResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description
            }).ToList(),
            
            // Legacy collections - empty in Version 2
            KPITargets = new List<KPITarget.Dtos.KPITargetResponse>(),
            KPIRatings = new List<Rating.Dtos.RatingResponse>(),
            KPIModeOfVerifications = new List<KPIModeOfVerification.Dtos.KPIModeOfVerificationResponse>()
        };

        var (kpiDtos, totalCount) = await unitOfWork.KPIRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<KPIResponse>([.. kpiDtos], query.PageNumber, query.PageSize, totalCount);
    }
}
