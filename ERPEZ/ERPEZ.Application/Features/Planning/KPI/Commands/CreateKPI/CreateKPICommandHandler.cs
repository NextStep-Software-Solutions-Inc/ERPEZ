using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateKPICommand, ApiResponse<Guid>>
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
            Status = "Draft",
        };

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await unitOfWork.KPIRepository.AddAsync(kpi, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var mfoKPIs = new List<Domain.Entities.Planning.MFOKPI>();

            var mfopapNames = request.MFOKPIs.Select(m => m.Name).Distinct().ToList();

            var existingMfopapsQuery = unitOfWork.MFOPAPRepository
                .Query()
                .Where(m => mfopapNames.Contains(m.Name));

            var existingMfopapsList = await unitOfWork.MFOPAPRepository.ToListAsync(existingMfopapsQuery, cancellationToken);
            var existingMfopaps = existingMfopapsList.ToDictionary(m => m.Name);

            foreach (var req in request.MFOKPIs)
            {
                if (!existingMfopaps.TryGetValue(req.Name, out var mfopap))
                {
                    mfopap = new Domain.Entities.Planning.MFOPAP { Name = req.Name };
                    existingMfopaps.Add(req.Name, mfopap);
                }

                mfoKPIs.Add(new Domain.Entities.Planning.MFOKPI
                {
                    KPIId = kpi.Id,
                    MFOPAP = mfopap
                });
            }

            var sdgs = request.SDGs.Select(s => new Domain.Entities.Planning.SDG
            {
                Name = s.Name
            }).ToList();

            var kpiRatings = request.KPIRatings
                .SelectMany(targetRequest => targetRequest.NumericalRatings.Select(targetValueDto => new Domain.Entities.Planning.KPIRating
                {
                    KPIId = kpi.Id,
                    PerformanceMeasureId = targetRequest.PerformanceMeasureId,
                    NumericalRating = targetValueDto.NumericalRating,
                    Remarks = targetValueDto.Remarks
                })).ToList();

            var kpiTargets = request.KPITargets.TargetValues
                .Select(targetValueDto => new Domain.Entities.Planning.KPITarget
                {
                    KPIId = kpi.Id,
                    TargetValue = targetValueDto.TargetValue,
                    QuarterName = targetValueDto.QuarterName,
                    Period = request.KPITargets.Period,
                }).ToList();

            var kpiModeOfVerifications = request.KPIModeOfVerifications.Select(m => new Domain.Entities.Planning.KPIModeOfVerification
            {
                KPIId = kpi.Id,
                Name = m.Name,
                Description = m.Description,
                Url = m.Url
            }).ToList();

            var attributes = request.KPIAttributes.Select(a => new Domain.Entities.Planning.Attribute
            {
                Name = a.Name
            }).ToList();

            kpi.MFOKPIs = mfoKPIs;
            kpi.SDGs = sdgs;
            kpi.KPIRatings = kpiRatings;
            kpi.KPITargets = kpiTargets;
            kpi.KPIModeOfVerifications = kpiModeOfVerifications;
            kpi.Attributes = attributes;

            unitOfWork.KPIRepository.Update(kpi);
            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        return ApiResponse<Guid>.Success(kpi.Id, "KPI created successfully.");
    }
}
