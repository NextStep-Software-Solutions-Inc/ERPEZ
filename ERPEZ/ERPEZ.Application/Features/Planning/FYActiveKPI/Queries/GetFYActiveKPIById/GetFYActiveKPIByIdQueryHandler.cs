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
            AgencyTargetAnnual = fyActiveKPI.AgencyTargetAnnual,
            AgencyTargetQ1 = fyActiveKPI.AgencyTargetQ1,
            AgencyTargetQ2 = fyActiveKPI.AgencyTargetQ2,
            AgencyTargetQ3 = fyActiveKPI.AgencyTargetQ3,
            AgencyTargetQ4 = fyActiveKPI.AgencyTargetQ4,
            Measurements = fyActiveKPI.FYActiveKPIMeasurements?.Select(m => new FYActiveKPIMeasurementResponse
            {
                Id = m.Id,
                Dimension = m.Dimension,
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
        };

        return ApiResponse<FYActiveKPIDetailedResponse>.Success(response);
    }
}
