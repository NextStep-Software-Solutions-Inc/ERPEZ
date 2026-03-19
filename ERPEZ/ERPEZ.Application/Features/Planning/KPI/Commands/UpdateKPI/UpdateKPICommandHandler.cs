using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPICommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var kpi = await unitOfWork.KPIRepository.GetKPIWithDetailsAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException("KPI not found.");

            // Build duplicate check query conditionally for partial updates - check Code + FunctionCategory
            if (request.Dto.Code != null || request.Dto.FunctionCategory != null)
            {
                var codeToCheck = request.Dto.Code ?? kpi.Code;
                var categoryToCheck = request.Dto.FunctionCategory ?? kpi.FunctionCategory;
                
                var duplicate = await unitOfWork.KPIRepository.FindAsync(
                    x => x.Id != request.Id && x.Code == codeToCheck && x.FunctionCategory == categoryToCheck,
                    cancellationToken);
                    
                if (duplicate != null)
                    throw new ConflictException("KPI with the same code and function category already exists.");
            }

            // Validate enums if provided
            if (request.Dto.MeasurementUnit != null && 
                !Enum.TryParse<MeasurementUnitEnum>(request.Dto.MeasurementUnit, true, out _))
                throw new ValidationException($"Invalid MeasurementUnit: {request.Dto.MeasurementUnit}");

            if (request.Dto.DistributionBehavior != null && 
                !Enum.TryParse<DistributionBehaviorEnum>(request.Dto.DistributionBehavior, true, out _))
                throw new ValidationException($"Invalid DistributionBehavior: {request.Dto.DistributionBehavior}");

            if (request.Dto.FunctionCategory != null && 
                !Enum.TryParse<FunctionCategoryEnum>(request.Dto.FunctionCategory, true, out _))
                throw new ValidationException($"Invalid FunctionCategory: {request.Dto.FunctionCategory}");

            if (!string.IsNullOrEmpty(request.Dto.MonitoringFrequency) && 
                !Enum.TryParse<MonitoringFrequencyEnum>(request.Dto.MonitoringFrequency, true, out _))
                throw new ValidationException($"Invalid MonitoringFrequency: {request.Dto.MonitoringFrequency}");

            // Update KPI properties
            kpi.Name = request.Dto.Name ?? kpi.Name;
            kpi.Code = request.Dto.Code ?? kpi.Code;
            kpi.Description = request.Dto.Description ?? kpi.Description;
            kpi.MeasurementUnit = request.Dto.MeasurementUnit ?? kpi.MeasurementUnit;
            kpi.DistributionBehavior = request.Dto.DistributionBehavior ?? kpi.DistributionBehavior;
            kpi.FunctionCategory = request.Dto.FunctionCategory ?? kpi.FunctionCategory;
            kpi.MonitoringFrequency = request.Dto.MonitoringFrequency ?? kpi.MonitoringFrequency;
            kpi.IsOptInAvailable = request.Dto.IsOptInAvailable ?? kpi.IsOptInAvailable;
            kpi.IsGAD = request.Dto.IsGAD ?? kpi.IsGAD;
            kpi.Status = request.Dto.Status ?? kpi.Status;

            // Handle SDGs - Only update if provided
            if (request.Dto.SDGIds?.Count > 0)
            {
                kpi.SDGs.Clear();
                var sdgIds = request.Dto.SDGIds.Distinct().ToList();
                var sdgs = await unitOfWork.SDGRepository.ToListAsync(unitOfWork.SDGRepository.Query(s => sdgIds.Contains(s.Id)), cancellationToken);
                var sdgsDict = sdgs.ToDictionary(s => s.Id, s => s);
                foreach (var sdgId in sdgIds)
                {
                    if (sdgsDict.TryGetValue(sdgId, out var sdg))
                    {
                        kpi.SDGs.Add(sdg);
                    }
                    else
                    {
                        throw new NotFoundException($"SDG with ID {sdgId} not found.");
                    }
                }
            }

            // Handle MFOPAP - Only update if provided
            if (request.Dto.MFOPAPId.HasValue)
            {
                var existingMfopap = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.Dto.MFOPAPId.Value, cancellationToken: cancellationToken) ?? throw new NotFoundException($"MFOPAP with ID {request.Dto.MFOPAPId.Value} not found.");
                kpi.MFOPAPId = request.Dto.MFOPAPId.Value;
            }

            // Handle Attributes - Only update if provided
            if (request.Dto.AttributeIds?.Count > 0)
            {
                kpi.Attributes.Clear();
                var attrIds = request.Dto.AttributeIds.Distinct().ToList();
                var attrs = await unitOfWork.AttributeRepository.ToListAsync(unitOfWork.AttributeRepository.Query(a => attrIds.Contains(a.Id)), cancellationToken);
                var attrsDict = attrs.ToDictionary(a => a.Id, a => a);
                foreach (var attrId in attrIds)
                {
                    if (attrsDict.TryGetValue(attrId, out var attr))
                    {
                        kpi.Attributes.Add(attr);
                    }
                    else
                    {
                        throw new NotFoundException($"Attribute with ID {attrId} not found.");
                    }
                }
            }

            // ========== NESTED ENTITIES REMOVED ==========
            // KPIMeasurements, KPIRatings, KPITargets, and KPIMOVs are now managed via their own separate endpoints.
            // Use the dedicated endpoints for managing these entities:
            // - KPIMeasurement: POST/PUT/DELETE /kpi-measurements
            // - KPITargets: Managed via FYActiveKPI
            // - KPIRatings: Legacy - not used in Version 2
            // - KPIMOVs: MOVs stored as List<string> in KPIMeasurement.MOVs
            
            // ========== LEGACY SUPPORT - COMMENTED OUT (Version 2 uses KPIMeasurements only) ==========
            // In Version 2:
            // - Targets are set at FYActiveKPI level (AgencyTargetAnnual, Q1-Q4), not master KPI
            // - MOVs are stored in KPIMeasurement.MOVs (List<string>), not separate entities
            // - Ratings use RatingScaleTemplate system, not KPIPerformanceMeasure
            
            /*
            // Legacy support: Handle KPIRatings - Upsert logic (update existing, add new, delete orphaned)
            if (request.Dto.KPIRatings?.Count > 0)
            {
                var kpmByPmId = kpi.KPIPerformanceMeasures
                    .ToDictionary(x => x.PerformanceMeasureId, x => x);

                var existingRatings = await unitOfWork.RatingRepository.ToListAsync(
                    unitOfWork.RatingRepository.Query(r => r.KPIPerformanceMeasure!.KPIId == kpi.Id),
                    cancellationToken);

                var requestedRatingIds = request.Dto.KPIRatings
                    .Where(r => r.Id.HasValue)
                    .Select(r => r.Id!.Value)
                    .ToHashSet();

                // Delete ratings not in the request
                foreach (var existingRating in existingRatings.Where(r => !requestedRatingIds.Contains(r.Id)))
                {
                    unitOfWork.RatingRepository.Remove(existingRating, hardDelete: true);
                }

                // Update or add ratings
                foreach (var ratingRequest in request.Dto.KPIRatings)
                {
                    if (ratingRequest.Id.HasValue)
                    {
                        // Update existing rating
                        var existingRating = existingRatings.FirstOrDefault(r => r.Id == ratingRequest.Id.Value);
                        if (existingRating != null)
                        {
                            if (!kpmByPmId.TryGetValue(ratingRequest.PerformanceMeasureId, out var kpm))
                            {
                                kpm = new Domain.Entities.Planning.KPIPerformanceMeasure
                                {
                                    KPIId = kpi.Id,
                                    PerformanceMeasureId = ratingRequest.PerformanceMeasureId
                                };
                                kpi.KPIPerformanceMeasures.Add(kpm);
                                kpmByPmId[ratingRequest.PerformanceMeasureId] = kpm;
                            }
                            existingRating.KPIPerformanceMeasureId = kpm.Id;
                            existingRating.NumericalRating = ratingRequest.NumericalRating;
                            existingRating.Remarks = ratingRequest.Remarks;
                            unitOfWork.RatingRepository.Update(existingRating);
                        }
                        else
                        {
                            throw new NotFoundException($"Rating with ID {ratingRequest.Id.Value} not found.");
                        }
                    }
                    else
                    {
                        // Add new rating
                        if (!kpmByPmId.TryGetValue(ratingRequest.PerformanceMeasureId, out var kpm))
                        {
                            kpm = new Domain.Entities.Planning.KPIPerformanceMeasure
                            {
                                KPIId = kpi.Id,
                                PerformanceMeasureId = ratingRequest.PerformanceMeasureId
                            };
                            kpi.KPIPerformanceMeasures.Add(kpm);
                            kpmByPmId[ratingRequest.PerformanceMeasureId] = kpm;
                        }
                        kpm.Ratings.Add(new Domain.Entities.Planning.Rating
                        {
                            NumericalRating = ratingRequest.NumericalRating,
                            Remarks = ratingRequest.Remarks
                        });
                    }
                }
            }

            // Handle KPITargets - Upsert logic (update existing, add new, delete orphaned if safe)
            if (request.Dto.KPITargets?.Count > 0)
            {
                var existingTargets = await unitOfWork.KPITargetRepository.ToListAsync(
                    unitOfWork.KPITargetRepository.Query(t => t.KPIId == kpi.Id),
                    cancellationToken);

                var requestedTargetIds = request.Dto.KPITargets
                    .Where(t => t.Id.HasValue)
                    .Select(t => t.Id!.Value)
                    .ToHashSet();

                // Delete targets not in the request (only if not referenced by DUKPITargetAssignment)
                foreach (var existingTarget in existingTargets.Where(t => !requestedTargetIds.Contains(t.Id)))
                {
                    // Check if target is referenced by any DUKPITargetAssignment
                    var isReferenced = await unitOfWork.DUKPITargetAssignmentRepository.FindAsync(
                        a => a.KPITargetId == existingTarget.Id,
                        cancellationToken);

                    if (isReferenced != null)
                    {
                        throw new ConflictException(
                            $"Cannot delete KPITarget with ID {existingTarget.Id} because it is referenced by delivery unit assignments.");
                    }

                    unitOfWork.KPITargetRepository.Remove(existingTarget, hardDelete: true);
                }

                // Update or add targets
                foreach (var targetRequest in request.Dto.KPITargets)
                {
                    if (targetRequest.Id.HasValue)
                    {
                        // Update existing target
                        var existingTarget = existingTargets.FirstOrDefault(t => t.Id == targetRequest.Id.Value);
                        if (existingTarget != null)
                        {
                            existingTarget.Period = Enum.Parse<PeriodEnum>(targetRequest.Period);
                            existingTarget.TargetValue = targetRequest.TargetValue;
                            existingTarget.QuarterName = targetRequest.QuarterName;
                            unitOfWork.KPITargetRepository.Update(existingTarget);
                        }
                        else
                        {
                            throw new NotFoundException($"KPITarget with ID {targetRequest.Id.Value} not found.");
                        }
                    }
                    else
                    {
                        // Add new target
                        var newTarget = new Domain.Entities.Planning.KPITarget
                        {
                            KPIId = kpi.Id,
                            Period = Enum.Parse<PeriodEnum>(targetRequest.Period),
                            TargetValue = targetRequest.TargetValue,
                            QuarterName = targetRequest.QuarterName
                        };
                        kpi.KPITargets.Add(newTarget);
                    }
                }
            }

            // Handle KPIMOVs - Upsert logic (update existing, add new, delete orphaned)
            if (request.Dto.KPIMOVs?.Count > 0)
            {
                var existingMOVs = await unitOfWork.KPIModeOfVerificationRepository.ToListAsync(
                    unitOfWork.KPIModeOfVerificationRepository.Query(m => m.KPIId == kpi.Id),
                    cancellationToken);

                var requestedMOVIds = request.Dto.KPIMOVs
                    .Where(m => m.Id.HasValue)
                    .Select(m => m.Id!.Value)
                    .ToHashSet();

                // Delete MOVs not in the request
                foreach (var existingMOV in existingMOVs.Where(m => !requestedMOVIds.Contains(m.Id)))
                {
                    unitOfWork.KPIModeOfVerificationRepository.Remove(existingMOV, hardDelete: true);
                }

                // Update or add MOVs
                foreach (var movRequest in request.Dto.KPIMOVs)
                {
                    string? url = null;
                    if (movRequest.FileId.HasValue)
                    {
                        url = await fileStorageService.PromoteFileAsync(movRequest.FileId.Value);
                    }

                    if (movRequest.Id.HasValue)
                    {
                        // Update existing MOV
                        var existingMOV = existingMOVs.FirstOrDefault(m => m.Id == movRequest.Id.Value);
                        if (existingMOV != null)
                        {
                            existingMOV.Name = movRequest.Name;
                            existingMOV.Description = movRequest.Description;
                            if (url != null)
                            {
                                existingMOV.Url = url;
                            }
                            unitOfWork.KPIModeOfVerificationRepository.Update(existingMOV);
                        }
                        else
                        {
                            throw new NotFoundException($"KPIModeOfVerification with ID {movRequest.Id.Value} not found.");
                        }
                    }
                    else
                    {
                        // Add new MOV
                        var newMov = new Domain.Entities.Planning.KPIModeOfVerification
                        {
                            KPIId = kpi.Id,
                            Name = movRequest.Name,
                            Description = movRequest.Description,
                            Url = url
                        };
                        kpi.KPIModeOfVerifications.Add(newMov);
                    }
                }
            }
            */

            unitOfWork.KPIRepository.Update(kpi);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI updated successfully.");
    }
}
