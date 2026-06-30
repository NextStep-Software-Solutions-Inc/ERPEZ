using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;

public class GetKPIByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIByIdQuery, ApiResponse<KPIResponse>>
{
    public async Task<ApiResponse<KPIResponse>> Handle(GetKPIByIdQuery request, CancellationToken cancellationToken)
    {
        var kpi = await unitOfWork.KPIRepository.GetKPIWithDetailsAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        // Map KPIMeasurements (Version 2)
        var kpiMeasurements = kpi.KPIMeasurements
            .Select(m => new KPIMeasurementResponse
            {
                Id = m.Id,
                KPIId = m.KPIId,
                Name = m.Name,
                Statement = m.Statement,
                Dimensions = m.Dimensions,
                MOVs = m.MOVs,
                RatingScaleTemplateId = m.RatingScaleTemplateId,
                IsMOVEditable = m.IsMOVEditable,
                IsScaleEditable = m.IsScaleEditable,
                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy
            }).ToList();

        // Legacy collections - not used in Version 2
        // KPIRatings, KPITargets, KPIModeOfVerifications are now managed differently
        // Targets are set at FYActiveKPI level
        // MOVs are stored in KPIMeasurement.MOVs
        // Ratings use RatingScaleTemplate system

        MFOPAPResponse? mfopap = null;
        if (kpi.MFOPAP != null)
        {
            mfopap = new MFOPAPResponse
            {
                Id = kpi.MFOPAP.Id,
                Name = kpi.MFOPAP.Name,
                Code = kpi.MFOPAP.Code,
                Type = kpi.MFOPAP.Type,
                IsActive = kpi.MFOPAP.IsActive,
                ParentId = kpi.MFOPAP.ParentId
            };
        }

        var attributes = kpi.Attributes
            .Select(m => new AttributeResponse
            {
                Id = m.Id,
                Name = m.Name,
                Code = m.Code,
                Description = m.Description,
                ParentAttributeId = m.ParentAttributeId
            }).ToList();

        var sdgs = kpi.SDGs.Select(m => new SDGResponse
        {
            Id = m.Id,
            Name = m.Name,
            Description = m.Description,
            SdgCode = m.SdgCode   // ← add
        }).ToList();

        ParentKPIResponse? parentKpi = null;
        if (kpi.ParentKPI != null)
        {
            parentKpi = new ParentKPIResponse
            {
                Id = kpi.ParentKPI.Id,
                Name = kpi.ParentKPI.Name,
                Code = kpi.ParentKPI.Code,
                Description = kpi.ParentKPI.Description,
                Status = kpi.ParentKPI.Status,
                FunctionCategory = kpi.ParentKPI.FunctionCategory
            };
        }

        var dto = new KPIResponse()
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            ParentKPI = parentKpi,
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
            KPIMeasurements = kpiMeasurements,
            KPIRatings = new List<RatingResponse>(),
            KPITargets = new List<KPITargetResponse>(),
            KPIModeOfVerifications = new List<KPIModeOfVerificationResponse>(),
            MFOPAP = mfopap,
            Attributes = attributes,
            SDGs = sdgs
        };
        return ApiResponse<KPIResponse>.Success(dto, "Retrieved successfully");
    }
}
