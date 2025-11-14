using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateKPICommand, ApiResponse<KPIResponse>>
{
    public async Task<ApiResponse<KPIResponse>> Handle(CreateKPICommand request, CancellationToken cancellationToken)
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
            var existingMeasureQuery = unitOfWork.PerformanceMeasureRepository.Query()
                .Where(pm => requiredMeasureIds.Contains(pm.Id))
                .Select(pm => pm.Id);

            var existingMeasureIds = await existingMeasureQuery.ToListAsync(cancellationToken);

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
            MFOKPIs = [.. request.MFOKPIs.Select(a => new Domain.Entities.Planning.MFOKPI
            {
                MFOPAP = new()
                {
                    Name = a.Name
                }
            })],
            SDGs = [.. request.SDGs.Select(s => new SDG
            {
                Name = s.Name
            })],
            KPIRatings = [.. request.KPIRatings.Select(r => new Domain.Entities.Planning.KPIRating
            {
                PerformanceMeasureId = r.PerformanceMeasureId,
                NumericalRating = r.NumericalRating
            })],
            KPITargets = [.. request.KPITargets.Select(t => new Domain.Entities.Planning.KPITarget
            {
                //TargetValue = t.TargetValue,
                Period = t.Period,
                //QuarterName = t.QuarterName
            })],
            KPIModeOfVerifications = [.. request.KPIModeOfVerifications.Select(m => new Domain.Entities.Planning.KPIModeOfVerification
            {
                Name = m.Name,
                Description = m.Description,
                Url = m.Url
            })],
            Attributes = [.. request.KPIAttribute.Select(a => new Domain.Entities.Planning.Attribute
            {
                Name = a.Name
            })]
        };

        await unitOfWork.KPIRepository.AddAsync(kpi, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new KPIResponse
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            FunctionType = request.FunctionType,
            Name = kpi.Name,
            Description = kpi.Description,
            IsOfficeMandate = kpi.IsOfficeMandate,
            IsPercentage = kpi.IsPercentage,
            Status = kpi.Status,
            CreatedAt = kpi.CreatedAt,
            CreatedBy = kpi.CreatedBy
        };
        return ApiResponse<KPIResponse>.Success(dto, "KPI created successfully.");
    }
}
