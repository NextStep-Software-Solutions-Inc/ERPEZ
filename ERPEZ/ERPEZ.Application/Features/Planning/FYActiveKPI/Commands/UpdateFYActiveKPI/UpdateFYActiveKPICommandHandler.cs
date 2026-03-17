using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;

public class UpdateFYActiveKPICommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateFYActiveKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateFYActiveKPICommand request, CancellationToken cancellationToken)
    {
        var fyActiveKpi = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("FY Active KPI not found.");

        // Validate enums if provided
        if (request.MeasurementUnit != null && 
            !Enum.TryParse<MeasurementUnitEnum>(request.MeasurementUnit, true, out _))
            throw new ValidationException($"Invalid MeasurementUnit: {request.MeasurementUnit}");

        if (request.DistributionBehavior != null && 
            !Enum.TryParse<DistributionBehaviorEnum>(request.DistributionBehavior, true, out _))
            throw new ValidationException($"Invalid DistributionBehavior: {request.DistributionBehavior}");

        if (request.FunctionCategory != null && 
            !Enum.TryParse<FunctionCategoryEnum>(request.FunctionCategory, true, out _))
            throw new ValidationException($"Invalid FunctionCategory: {request.FunctionCategory}");

        if (!string.IsNullOrEmpty(request.MonitoringFrequency) && 
            !Enum.TryParse<MonitoringFrequencyEnum>(request.MonitoringFrequency, true, out _))
            throw new ValidationException($"Invalid MonitoringFrequency: {request.MonitoringFrequency}");

        // Validate MFOPAPId if provided
        if (request.MFOPAPId.HasValue)
        {
            var mfopapExists = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.MFOPAPId.Value, cancellationToken: cancellationToken);
            if (mfopapExists == null)
                throw new NotFoundException($"MFOPAP with ID {request.MFOPAPId.Value} not found.");
        }
        
        if (request.MFOPAPId.HasValue)
            fyActiveKpi.MFOPAPId = request.MFOPAPId.Value;
        
        if (!string.IsNullOrWhiteSpace(request.Name))
            fyActiveKpi.Name = request.Name;
        
        if (!string.IsNullOrWhiteSpace(request.Code))
            fyActiveKpi.Code = request.Code;
        
        if (request.Description != null)
            fyActiveKpi.Description = request.Description;
        
        if (!string.IsNullOrWhiteSpace(request.MeasurementUnit))
            fyActiveKpi.MeasurementUnit = request.MeasurementUnit;
        
        if (!string.IsNullOrWhiteSpace(request.DistributionBehavior))
            fyActiveKpi.DistributionBehavior = request.DistributionBehavior;
        
        if (!string.IsNullOrWhiteSpace(request.FunctionCategory))
            fyActiveKpi.FunctionCategory = request.FunctionCategory;
        
        if (!string.IsNullOrWhiteSpace(request.MonitoringFrequency))
            fyActiveKpi.MonitoringFrequency = request.MonitoringFrequency;
        
        if (request.IsOptInAvailable.HasValue)
            fyActiveKpi.IsOptInAvailable = request.IsOptInAvailable.Value;
        
        if (request.IsGAD.HasValue)
            fyActiveKpi.IsGAD = request.IsGAD.Value;
        
        if (!string.IsNullOrWhiteSpace(request.Status))
            fyActiveKpi.Status = request.Status;

        // Note: SDGIds and AttributeIds are not processed here because FYActiveKPI is a snapshot
        // and doesn't have its own collections. Those belong to MasterKPI and would affect all fiscal years.

        unitOfWork.FYActiveKPIRepository.Update(fyActiveKpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "FY Active KPI updated successfully.");
    }
}
