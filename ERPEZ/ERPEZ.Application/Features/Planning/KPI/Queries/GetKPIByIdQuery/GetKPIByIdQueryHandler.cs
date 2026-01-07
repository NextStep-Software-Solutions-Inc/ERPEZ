using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;

public class GetKPIByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIByIdQuery, ApiResponse<KPIResponse>>
{
    public async Task<ApiResponse<KPIResponse>> Handle(GetKPIByIdQuery request, CancellationToken cancellationToken)
    {
        var kpi = await unitOfWork.KPIRepository.GetKPIWithDetailsAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var kpiRatings = kpi.KPIPerformanceMeasures
            .SelectMany(kpm => kpm.Ratings.Select(r => new RatingResponse
            {
                Id = r.Id,
                KPIId = kpm.KPIId,
                PerformanceMeasureId = kpm.PerformanceMeasureId,
                NumericalRating = r.NumericalRating,
                Remarks = r.Remarks,
            }))
            .ToList();

        var kpiTargets = kpi.KPITargets
            .Select(m => new KPITargetResponse
            {
                Id = m.Id,
                KPIId = m.KPIId,
                Period = m.Period.ToString(),
                QuarterName = m.QuarterName,
                TargetValue = m.TargetValue,
                RemainingTargetValue = m.TargetValue, // Temporary value, will be calculated below
                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy
            }).ToList();

        // Calculate remaining target values
        var kpiTargetIds = kpiTargets.Select(t => t.Id).ToList();
        if (kpiTargetIds.Count != 0)
        {
            var allocationsByTarget = await unitOfWork.DUKPITargetAssignmentRepository.GetTotalAllocatedByKPITargetIdsAsync(kpiTargetIds, cancellationToken);

            kpiTargets = [.. kpiTargets.Select(target => target with
            {
                RemainingTargetValue = target.TargetValue - 
                    (allocationsByTarget.TryGetValue(target.Id, out var allocated) ? allocated : 0)
            })];
        }

        var modeOfVerification = kpi.KPIModeOfVerifications
            .Select(m => new KPIModeOfVerificationResponse
            {
                Id = m.Id,
                KPIId = m.KPIId,
                Name = m.Name,
                Description = m.Description,
                Url = m.Url
            }).ToList();

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
            Description = m.Description
        }).ToList();

        var dto = new KPIResponse()
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
            KPIRatings = kpiRatings,
            KPITargets = kpiTargets,
            KPIModeOfVerifications = modeOfVerification,
            MFOPAP = mfopap,
            Attributes = attributes,
            SDGs = sdgs
        };
        return ApiResponse<KPIResponse>.Success(dto, "Retrieved successfully");
    }
}
