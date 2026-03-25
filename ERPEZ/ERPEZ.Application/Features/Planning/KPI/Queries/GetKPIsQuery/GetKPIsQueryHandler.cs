using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
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
            ParentKPI = kpi.ParentKPI != null ? new ParentKPIResponse
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
            
            KPIMeasurements = kpi.KPIMeasurements.Select(m => new KPIMeasurementResponse
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
            
            MFOPAP = kpi.MFOPAP != null ? new MFOPAPResponse
            {
                Id = kpi.MFOPAP.Id,
                ParentId = kpi.MFOPAP.ParentId,
                Name = kpi.MFOPAP.Name,
                Code = kpi.MFOPAP.Code,
                Type = kpi.MFOPAP.Type,
                IsActive = kpi.MFOPAP.IsActive
            } : null,
            
            Attributes = kpi.Attributes.Select(a => new AttributeResponse
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.Code,
                Description = a.Description,
                ParentAttributeId = a.ParentAttributeId
            }).ToList(),
            
            SDGs = kpi.SDGs.Select(s => new SDGResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description
            }).ToList(),
            
            // Legacy collections - empty in Version 2
            KPITargets = new List<KPITargetResponse>(),
            KPIRatings = new List<RatingResponse>(),
            KPIModeOfVerifications = new List<KPIModeOfVerificationResponse>()
        };

        var (kpiDtos, totalCount) = await unitOfWork.KPIRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        var responseItems = kpiDtos.ToList();

        // Optional activation context for activation screens.
        if (responseItems.Count > 0 && (query.TargetFiscalYearId.HasValue || query.SourceFiscalYearId.HasValue))
        {
            var masterKpiIds = responseItems.Select(x => x.Id).ToList();
            var fiscalYearIds = new List<Guid>();

            if (query.TargetFiscalYearId.HasValue)
                fiscalYearIds.Add(query.TargetFiscalYearId.Value);

            if (query.SourceFiscalYearId.HasValue && !fiscalYearIds.Contains(query.SourceFiscalYearId.Value))
                fiscalYearIds.Add(query.SourceFiscalYearId.Value);

            var activationRows = await unitOfWork.FYActiveKPIRepository.ToListAsync(
                unitOfWork.FYActiveKPIRepository
                    .Query(f => fiscalYearIds.Contains(f.FiscalYearId) && masterKpiIds.Contains(f.MasterKPIId))
                    .Select(f => new { f.MasterKPIId, f.FiscalYearId, f.Id }),
                cancellationToken);

            var targetActivationMap = query.TargetFiscalYearId.HasValue
                ? activationRows
                    .Where(x => x.FiscalYearId == query.TargetFiscalYearId.Value)
                    .GroupBy(x => x.MasterKPIId)
                    .ToDictionary(
                        group => group.Key,
                        group => group
                            .OrderByDescending(row => row.Id)
                            .First()
                            .Id)
                : new Dictionary<Guid, Guid>();

            var sourceActivationMap = query.SourceFiscalYearId.HasValue
                ? activationRows
                    .Where(x => x.FiscalYearId == query.SourceFiscalYearId.Value)
                    .GroupBy(x => x.MasterKPIId)
                    .ToDictionary(
                        group => group.Key,
                        group => group
                            .OrderByDescending(row => row.Id)
                            .First()
                            .Id)
                : new Dictionary<Guid, Guid>();

            responseItems = responseItems
                .Select(kpi =>
                {
                    var hasTargetActivation = targetActivationMap.TryGetValue(kpi.Id, out var targetFYActiveKPIId);
                    var hasSourceActivation = sourceActivationMap.TryGetValue(kpi.Id, out var sourceFYActiveKPIId);

                    return kpi with
                    {
                        IsActivatedForTargetFY = query.TargetFiscalYearId.HasValue ? hasTargetActivation : null,
                        TargetFYActiveKPIId = hasTargetActivation ? targetFYActiveKPIId : null,
                        IsActivatedForSourceFY = query.SourceFiscalYearId.HasValue ? hasSourceActivation : null,
                        SourceFYActiveKPIId = hasSourceActivation ? sourceFYActiveKPIId : null
                    };
                })
                .ToList();
        }

        return new PaginatedApiResponse<KPIResponse>([.. responseItems], query.PageNumber, query.PageSize, totalCount);
    }
}
