using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService) : IRequestHandler<UpdateKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPICommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");

            var duplicate = await unitOfWork.KPIRepository.FindAsync(
                x => x.Name == request.Name &&
                x.FunctionType == request.FunctionType &&
                request.Id != kpi.Id,
                cancellationToken
            );

            if (duplicate != null)
                throw new ConflictException("KPI with the same name and Function type already exists.");

            kpi.Name = request.Name ?? kpi.Name;
            kpi.Description = request.Description ?? kpi.Description;
            kpi.FunctionType = request.FunctionType ?? kpi.FunctionType;
            kpi.IsOfficeMandate = request.IsOfficeMandate ?? kpi.IsOfficeMandate;
            kpi.IsPercentage = request.IsPercentage ?? kpi.IsPercentage;
            kpi.Status = request.Status ?? kpi.Status;
            kpi.IsTargetValueAllocable = request.IsTargetValueAllocable ?? kpi.IsTargetValueAllocable;

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

            // Handle MFOPAPs - Only update if provided
            if (request.Dto.MFOPAPIds?.Count > 0)
            {
                kpi.MFOPAPs.Clear();
                var mfopapIds = request.Dto.MFOPAPIds.Distinct().ToList();
                var mfopaps = await unitOfWork.MFOPAPRepository.ToListAsync(unitOfWork.MFOPAPRepository.Query(m => mfopapIds.Contains(m.Id)), cancellationToken);
                var mfopapsDict = mfopaps.ToDictionary(m => m.Id, m => m);
                foreach (var mfopapId in mfopapIds)
                {
                    if (mfopapsDict.TryGetValue(mfopapId, out var mfopap))
                    {
                        kpi.MFOPAPs.Add(mfopap);
                    }
                    else
                    {
                        throw new NotFoundException($"MFOPAP with ID {mfopapId} not found.");
                    }
                }
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

            // Handle KPIRatings - Only update if provided
            if (request.Dto.KPIRatings?.Count > 0)
            {
                kpi.KPIRatings.Clear();
                foreach (var ratingRequest in request.Dto.KPIRatings)
                {
                    foreach (var numericalRating in ratingRequest.Ratings)
                    {
                        var newRating = new Domain.Entities.Planning.KPIRating
                        {
                            KPIId = kpi.Id,
                            PerformanceMeasureId = ratingRequest.PerformanceMeasureId,
                            NumericalRating = numericalRating.Value,
                            Remarks = numericalRating.Remarks
                        };
                        kpi.KPIRatings.Add(newRating);
                    }
                }
            }

            // Handle KPITargets - Only update if provided
            if (request.Dto.KPITargets?.Count > 0)
            {
                kpi.KPITargets.Clear();
                foreach (var targetRequest in request.Dto.KPITargets)
                {
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

            // Handle KPIMOVs - Only update if provided
            if (request.Dto.KPIMOVs?.Count > 0)
            {
                kpi.KPIModeOfVerifications.Clear();
                foreach (var movRequest in request.Dto.KPIMOVs)
                {
                string? url = null;
                if (movRequest.FileId.HasValue)
                {
                    url = await fileStorageService.PromoteFileAsync(movRequest.FileId.Value);
                }

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

            unitOfWork.KPIRepository.Update(kpi);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI updated successfully.");
    }
}
