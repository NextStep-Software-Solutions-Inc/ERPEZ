using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService) : IRequestHandler<CreateKPICommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPICommand request, CancellationToken cancellationToken)
    {
        var existingKpi = await unitOfWork.KPIRepository.FindAsync(
            x => x.Name == request.Name && x.FunctionType == request.FunctionType,
            cancellationToken
        );

        if (existingKpi != null)
            throw new ConflictException("KPI with the same name and Function type already exists.");

        if (request.ParentKPIId != null)
        {
            var parentKpi = await unitOfWork.KPIRepository.GetByIdAsync(request.ParentKPIId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Parent KPI not found.");
        }

        var requiredMeasureIds = request.KPIRatings
            .Select(r => r.PerformanceMeasureId)
            .Distinct()
            .ToList();

        if (requiredMeasureIds.Count > 0)
        {
            var existingMeasures = await unitOfWork.PerformanceMeasureRepository.ToListAsync(
                unitOfWork.PerformanceMeasureRepository.Query(pm => requiredMeasureIds.Contains(pm.Id)), cancellationToken);

            var existingMeasureIds = existingMeasures.Select(pm => pm.Id).ToList();

            var missingMeasureIds = requiredMeasureIds
                .Where(id => !existingMeasureIds.Contains(id))
                .ToList();

            if (missingMeasureIds.Count > 0)
            {
                var idList = string.Join(", ", missingMeasureIds);
                throw new NotFoundException($"One or more referenced Performance Measure IDs were not found: {idList}");
            }
        }

        var kpi = new Domain.Entities.Planning.KPI
        {
            ParentKPIId = request.ParentKPIId,
            FunctionType = request.FunctionType,
            Name = request.Name,
            Description = request.Description,
            IsOfficeMandate = request.IsOfficeMandate,
            IsPercentage = request.IsPercentage,
            IsTargetValueAllocable = request.IsTargetValueAllocable,
            Status = "Draft",
        };

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await unitOfWork.KPIRepository.AddAsync(kpi, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            if (request.MFOPAPIds.Count > 0)
            {
                var existingMfopapsQuery = unitOfWork.MFOPAPRepository.Query(m => request.MFOPAPIds.Contains(m.Id));

                var existingMfopaps = await unitOfWork.MFOPAPRepository.ToListAsync(existingMfopapsQuery, cancellationToken);

                if (existingMfopaps.Count != request.MFOPAPIds.Count)
                {
                    var foundIds = existingMfopaps.Select(m => m.Id).ToList();
                    var missingIds = request.MFOPAPIds.Where(id => !foundIds.Contains(id)).ToList();
                    throw new NotFoundException($"One or more MFOPAP IDs were not found: {string.Join(", ", missingIds)}");
                }

                kpi.MFOPAPs = existingMfopaps;
            }

            if (request.SDGIds.Count > 0)
            {
                var existingSDGsQuery = unitOfWork.SDGRepository
                    .Query(s => request.SDGIds.Contains(s.Id));

                var existingSDGs = await unitOfWork.SDGRepository.ToListAsync(existingSDGsQuery, cancellationToken);

                if (existingSDGs.Count != request.SDGIds.Count)
                {
                    var foundIds = existingSDGs.Select(s => s.Id).ToList();
                    var missingIds = request.SDGIds.Where(id => !foundIds.Contains(id)).ToList();
                    throw new NotFoundException($"One or more SDG IDs were not found: {string.Join(", ", missingIds)}");
                }

                kpi.SDGs = existingSDGs;
            }

            if (request.AttributeIds.Count > 0)
            {
                var existingAttributesQuery = unitOfWork.AttributeRepository
                    .Query(a => request.AttributeIds.Contains(a.Id));

                var existingAttributes = await unitOfWork.AttributeRepository.ToListAsync(existingAttributesQuery, cancellationToken);

                if (existingAttributes.Count != request.AttributeIds.Count)
                {
                    var foundIds = existingAttributes.Select(a => a.Id).ToList();
                    var missingIds = request.AttributeIds.Where(id => !foundIds.Contains(id)).ToList();
                    throw new NotFoundException($"One or more Attribute IDs were not found: {string.Join(", ", missingIds)}");
                }

                kpi.Attributes = existingAttributes;
            }

            var kpiRatings = request.KPIRatings
                .SelectMany(ratingRequest => ratingRequest.Ratings.Select(ratingDto => new Domain.Entities.Planning.KPIRating
                {
                    KPIId = kpi.Id,
                    PerformanceMeasureId = ratingRequest.PerformanceMeasureId,
                    NumericalRating = ratingDto.Value,
                    Remarks = ratingDto.Remarks
                })).ToList();

            var kpiTargets = request.KPITargets
                .Select(targetRequest => new Domain.Entities.Planning.KPITarget
                {
                    KPIId = kpi.Id,
                    TargetValue = targetRequest.TargetValue,
                    QuarterName = targetRequest.QuarterName,
                    Period = Enum.Parse<PeriodEnum>(targetRequest.Period),
                }).ToList();

            var kpiModeOfVerifications = new List<Domain.Entities.Planning.KPIModeOfVerification>();
            foreach (var m in request.KPIMOVs)
            {
                string? url = null;
                if (m.FileId.HasValue)
                {
                    url = await fileStorageService.PromoteFileAsync(m.FileId.Value);
                }

                kpiModeOfVerifications.Add(new Domain.Entities.Planning.KPIModeOfVerification
                {
                    KPIId = kpi.Id,
                    Name = m.Name,
                    Description = m.Description,
                    Url = url
                });
            }

            kpi.KPIRatings = kpiRatings;
            kpi.KPITargets = kpiTargets;
            kpi.KPIModeOfVerifications = kpiModeOfVerifications;

            unitOfWork.KPIRepository.Update(kpi);
            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        return ApiResponse<Guid>.Success(kpi.Id, "KPI created successfully.");
    }
}
