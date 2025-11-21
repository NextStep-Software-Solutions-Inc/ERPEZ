using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
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

        var kpiRatings = kpi.KPIRatings
            .Select(m => new KPIRatingResponse
            {
                Id = m.Id,
                KPIId = m.KPIId,
                PerformanceMeasureId = m.PerformanceMeasureId,
                NumericalRating = m.NumericalRating,
                Remarks = m.Remarks,
            }).ToList();

        var kpiTargets = kpi.KPITargets
            .Select(m => new KPITargetResponse
            {
                Id = m.Id,
                KPIId = m.KPIId,
                Period = m.Period,
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
            var allocationsByTarget = await unitOfWork.DUKPIAssignmentRepository.GetTotalAllocatedByKPITargetIdsAsync(kpiTargetIds, cancellationToken);

            kpiTargets = [.. kpiTargets.Select(target => target with
            {
                RemainingTargetValue = target.TargetValue - 
                    (allocationsByTarget.TryGetValue(target.Id, out var allocated) ? allocated : 0)
            })];
        }

        var modeOfVerification = kpi.KPIModeOfVerifications
            .Select(m => new KPIModeOfVerificationDto
            {
                Id = m.Id,
                KPIId = m.KPIId,
                Name = m.Name,
                Description = m.Description,
                Url = m.Url
            }).ToList();

        var mfopaps = kpi.MFOPAPs
            .Select(m => new MFOPAPDto
            {
                Id = m.Id,
                Name = m.Name,
                Code = m.Code,
                Type = m.Type,
                IsActive = m.IsActive,
                ParentId = m.ParentId
            }).ToList();

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
            CreatedBy = kpi.CreatedBy,
            CreatedAt = kpi.CreatedAt,
            KPIRatings = kpiRatings,
            KPITargets = kpiTargets,
            KPIModeOfVerifications = modeOfVerification,
            MFOPAPs = mfopaps,
            Attributes = attributes,
            SDGs = sdgs
        };
        return ApiResponse<KPIResponse>.Success(dto, "Retrieved successfully");
    }
}
