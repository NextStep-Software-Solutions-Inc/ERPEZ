using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIById;

public class GetFYActiveKPIByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetFYActiveKPIByIdQuery, ApiResponse<FYActiveKPIDetailedResponse>>
{
    public async Task<ApiResponse<FYActiveKPIDetailedResponse>> Handle(
        GetFYActiveKPIByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var fyActiveKPI = await unitOfWork.FYActiveKPIRepository.GetFYActiveKPIWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"FYActiveKPI with ID {request.Id} not found.");

        var response = new FYActiveKPIDetailedResponse
        {
            Id = fyActiveKPI.Id,
            FiscalYearId = fyActiveKPI.FiscalYearId,
            FiscalYearName = fyActiveKPI.FiscalYear?.Year.ToString() ?? string.Empty,
            MasterKPIId = fyActiveKPI.MasterKPIId,
            ParentKPIId = fyActiveKPI.ParentKPIId,
            MFOPAPId = fyActiveKPI.MFOPAPId,
            Name = fyActiveKPI.Name,
            Code = fyActiveKPI.Code,
            Description = fyActiveKPI.Description,
            MeasurementUnit = fyActiveKPI.MeasurementUnit,
            DistributionBehavior = fyActiveKPI.DistributionBehavior,
            FunctionCategory = fyActiveKPI.FunctionCategory,
            MonitoringFrequency = fyActiveKPI.MonitoringFrequency,
            IsOptInAvailable = fyActiveKPI.IsOptInAvailable,
            IsGAD = fyActiveKPI.IsGAD,
            Status = fyActiveKPI.Status,
            IsLocked = fyActiveKPI.IsLocked,
            AgencyTargetAnnual = fyActiveKPI.AgencyTargetAnnual,
            AgencyTargetQ1 = fyActiveKPI.AgencyTargetQ1,
            AgencyTargetQ2 = fyActiveKPI.AgencyTargetQ2,
            AgencyTargetQ3 = fyActiveKPI.AgencyTargetQ3,
            AgencyTargetQ4 = fyActiveKPI.AgencyTargetQ4,
            Measurements = fyActiveKPI.FYActiveKPIMeasurements?.Select(m => new FYActiveKPIMeasurementResponse
            {
                Id = m.Id,
                Name = m.Name,
                Statement = m.Statement,
                Dimensions = m.Dimensions,
                RatingScaleTemplateId = m.RatingScaleTemplateId,
                MOVs = m.MOVs,
                IsMOVEditable = m.IsMOVEditable,
                IsScaleEditable = m.IsScaleEditable
            }).ToList() ?? [],
            Assignments = fyActiveKPI.KPIAssignments?.Select(a => new KPIAssignmentResponse
            {
                Id = a.Id,
                OfficeId = a.OfficeId,
                OfficeName = a.Office?.Name ?? string.Empty,
                AssignedTargetAnnual = a.AssignedTargetAnnual,
                AssignedTargetQ1 = a.AssignedTargetQ1,
                AssignedTargetQ2 = a.AssignedTargetQ2,
                AssignedTargetQ3 = a.AssignedTargetQ3,
                AssignedTargetQ4 = a.AssignedTargetQ4,
                IsLocked = a.IsLocked
            }).ToList() ?? [],
            MFOPAP = fyActiveKPI.MasterKPI?.MFOPAP != null ? new MFOPAPResponse
            {
                Id = fyActiveKPI.MasterKPI.MFOPAP.Id,
                ParentId = fyActiveKPI.MasterKPI.MFOPAP.ParentId,
                Name = fyActiveKPI.MasterKPI.MFOPAP.Name,
                Code = fyActiveKPI.MasterKPI.MFOPAP.Code,
                Type = fyActiveKPI.MasterKPI.MFOPAP.Type,
                IsActive = fyActiveKPI.MasterKPI.MFOPAP.IsActive
            } : null,
            Attributes = fyActiveKPI.MasterKPI?.Attributes?.Select(a => new AttributeResponse
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.Code,
                Description = a.Description,
                ParentAttributeId = a.ParentAttributeId
            }).ToList() ?? [],
            SDGs = fyActiveKPI.MasterKPI?.SDGs?.Select(s => new SDGResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                SdgCode = s.SdgCode   // ← add
            }).ToList() ?? [],
            FiscalYear = fyActiveKPI.FiscalYear == null ? null : new ERPEZ.Application.Features.Planning.FiscalYear.Dtos.FiscalYearResponse
            {
                Id = fyActiveKPI.FiscalYear.Id,
                Year = fyActiveKPI.FiscalYear.Year,
                Description = fyActiveKPI.FiscalYear.Description,
                Status = fyActiveKPI.FiscalYear.Status,
                IsLocked = fyActiveKPI.FiscalYear.IsLocked,
                StartDate = fyActiveKPI.FiscalYear.StartDate,
                EndDate = fyActiveKPI.FiscalYear.EndDate
            }
        };

        return ApiResponse<FYActiveKPIDetailedResponse>.Success(response);
    }
}
