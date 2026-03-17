using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;

/// <summary>
/// Activation Logic (The "Clone" Service)
/// Clones Master KPIs and KPIMeasurements into FYActiveKPIs and FYActiveKPIMeasurements
/// Supports bulk activation of multiple KPIs in a single transaction.
/// </summary>
public class ActivateFYActiveKPICommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<ActivateFYActiveKPICommand, ApiResponse<List<FYActiveKPIResponse>>>
{
    public async Task<ApiResponse<List<FYActiveKPIResponse>>> Handle(ActivateFYActiveKPICommand request, CancellationToken cancellationToken)
    {
        // Validate Fiscal Year exists
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        if (request.KPIs == null || request.KPIs.Count == 0)
            throw new ValidationException("At least one KPI must be provided for activation.");

        var activatedKPIs = new List<FYActiveKPIResponse>();

        // Process all KPIs in a single transaction
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Track activated KPIs in this batch for parent-child resolution
            var activatedKPIMap = new Dictionary<Guid, Guid>(); // MasterKPIId -> FYActiveKPIId

            foreach (var kpiRequest in request.KPIs)
            {
                // Validate Master KPI exists
                var masterKPI = await unitOfWork.KPIRepository.GetKPIWithDetailsAsync(kpiRequest.MasterKPIId, cancellationToken)
                    ?? throw new NotFoundException($"Master KPI with ID {kpiRequest.MasterKPIId} not found.");

                // Check if this KPI is already activated for this fiscal year
                var existingActivation = await unitOfWork.FYActiveKPIRepository.FindAsync(
                    f => f.FiscalYearId == request.FiscalYearId && f.MasterKPIId == kpiRequest.MasterKPIId,
                    cancellationToken);

                if (existingActivation != null)
                    throw new ConflictException($"KPI '{masterKPI.Name}' has already been activated for Fiscal Year {fiscalYear.Year}.");

                Guid fyActiveKPIId = Guid.NewGuid();

                // Resolve ParentKPIId: Check in-memory map first, then database
                Guid? fyActiveParentKPIId = null;
                if (masterKPI.ParentKPIId.HasValue)
                {
                    // First check if parent was activated in this same batch
                    if (activatedKPIMap.TryGetValue(masterKPI.ParentKPIId.Value, out var parentId))
                    {
                        fyActiveParentKPIId = parentId;
                    }
                    else
                    {
                        // Otherwise check if parent was activated in a previous transaction
                        var parentFYActiveKPI = await unitOfWork.FYActiveKPIRepository.FindAsync(
                            f => f.FiscalYearId == request.FiscalYearId && f.MasterKPIId == masterKPI.ParentKPIId.Value,
                            cancellationToken);
                        
                        fyActiveParentKPIId = parentFYActiveKPI?.Id;
                    }
                }

                // Clone Master KPI to FYActiveKPI
                var fyActiveKPI = new Domain.Entities.Planning.FYActiveKPI
                {
                    Id = fyActiveKPIId,
                    FiscalYearId = request.FiscalYearId,
                    MasterKPIId = kpiRequest.MasterKPIId,
                    
                    // Copy metadata from Master KPI
                    ParentKPIId = fyActiveParentKPIId, // Use resolved FYActiveKPI parent ID
                    MFOPAPId = masterKPI.MFOPAPId,
                    Name = masterKPI.Name,
                    Code = masterKPI.Code,
                    Description = masterKPI.Description,
                    MeasurementUnit = masterKPI.MeasurementUnit,
                    DistributionBehavior = masterKPI.DistributionBehavior,
                    FunctionCategory = masterKPI.FunctionCategory,
                    MonitoringFrequency = masterKPI.MonitoringFrequency,
                    IsOptInAvailable = masterKPI.IsOptInAvailable,
                    IsGAD = masterKPI.IsGAD,
                    Status = "Draft", // Targets set separately via SetFYActiveKPITargetsCommand
                    
                    // Agency targets initialized to defaults, set later via SetFYActiveKPITargetsCommand
                    AgencyTargetAnnual = 0,
                    AgencyTargetQ1 = null,
                    AgencyTargetQ2 = null,
                    AgencyTargetQ3 = null,
                    AgencyTargetQ4 = null,
                };

                await unitOfWork.FYActiveKPIRepository.AddAsync(fyActiveKPI, cancellationToken);

                // Track this activation for parent-child resolution within the same batch
                activatedKPIMap[kpiRequest.MasterKPIId] = fyActiveKPIId;

                // Clone all KPIMeasurements to FYActiveKPIMeasurements
                var fyActiveMeasurements = new List<FYActiveKPIMeasurementResponse>();
                if (masterKPI.KPIMeasurements?.Count > 0)
                {
                    foreach (var measurement in masterKPI.KPIMeasurements)
                    {
                        var fyActiveMeasurement = new Domain.Entities.Planning.FYActiveKPIMeasurement
                        {
                            Id = Guid.NewGuid(),
                            FYActiveKPIId = fyActiveKPIId,
                            Dimension = measurement.Dimension,
                            RatingScaleTemplateId = measurement.RatingScaleTemplateId,
                            MOVs = new List<string>(measurement.MOVs), // Deep copy array
                            IsMOVEditable = measurement.IsMOVEditable,
                            IsScaleEditable = measurement.IsScaleEditable,
                        };

                        await unitOfWork.FYActiveKPIMeasurementRepository.AddAsync(fyActiveMeasurement, cancellationToken);
                        
                        fyActiveMeasurements.Add(new FYActiveKPIMeasurementResponse
                        {
                            Id = fyActiveMeasurement.Id,
                            FYActiveKPIId = fyActiveMeasurement.FYActiveKPIId,
                            Dimension = fyActiveMeasurement.Dimension,
                            MOVs = fyActiveMeasurement.MOVs,
                            RatingScaleTemplateId = fyActiveMeasurement.RatingScaleTemplateId,
                            IsMOVEditable = fyActiveMeasurement.IsMOVEditable,
                            IsScaleEditable = fyActiveMeasurement.IsScaleEditable,
                            CreatedAt = fyActiveMeasurement.CreatedAt,
                            CreatedBy = fyActiveMeasurement.CreatedBy
                        });
                    }
                }

                // Build detailed response with nested entities from master KPI
                var response = new FYActiveKPIResponse
                {
                    Id = fyActiveKPI.Id,
                    FiscalYearId = fyActiveKPI.FiscalYearId,
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
                    CreatedAt = fyActiveKPI.CreatedAt,
                    CreatedBy = fyActiveKPI.CreatedBy,
                    FYActiveKPIMeasurements = fyActiveMeasurements,
                    MFOPAP = masterKPI.MFOPAP != null ? new MFOPAPResponse
                    {
                        Id = masterKPI.MFOPAP.Id,
                        ParentId = masterKPI.MFOPAP.ParentId,
                        Name = masterKPI.MFOPAP.Name,
                        Code = masterKPI.MFOPAP.Code,
                        Type = masterKPI.MFOPAP.Type,
                        IsActive = masterKPI.MFOPAP.IsActive
                    } : null,
                    Attributes = masterKPI.Attributes.Select(a => new AttributeResponse
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Code = a.Code,
                        Description = a.Description,
                        ParentAttributeId = a.ParentAttributeId
                    }).ToList(),
                    SDGs = masterKPI.SDGs.Select(s => new SDGResponse
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Description = s.Description
                    }).ToList()
                };

                activatedKPIs.Add(response);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<List<FYActiveKPIResponse>>.Success(
            activatedKPIs, 
            $"{activatedKPIs.Count} KPI(s) successfully activated for Fiscal Year {fiscalYear.Year}.");
    }
}
 