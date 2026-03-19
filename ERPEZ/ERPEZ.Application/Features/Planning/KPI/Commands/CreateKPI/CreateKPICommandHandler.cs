using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateKPICommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPICommand request, CancellationToken cancellationToken)
    {
        // Validate uniqueness (Code + FunctionCategory)
        var existingKpi = await unitOfWork.KPIRepository.FindAsync(
            x => x.Code == request.Code && x.FunctionCategory == request.FunctionCategory,
            cancellationToken
        );

        if (existingKpi != null) 
            throw new ConflictException("KPI with the same code and function category already exists.");

        // Validate Parent KPI if provided
        if (request.ParentKPIId != null)
        {
            _ = await unitOfWork.KPIRepository.GetByIdAsync(request.ParentKPIId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Parent KPI not found.");
        }

        // Validate enums
        if (!Enum.TryParse<MeasurementUnitEnum>(request.MeasurementUnit, true, out _))
            throw new ValidationException($"Invalid MeasurementUnit: {request.MeasurementUnit}");

        if (!Enum.TryParse<DistributionBehaviorEnum>(request.DistributionBehavior, true, out _))
            throw new ValidationException($"Invalid DistributionBehavior: {request.DistributionBehavior}");

        if (!Enum.TryParse<FunctionCategoryEnum>(request.FunctionCategory, true, out _))
            throw new ValidationException($"Invalid FunctionCategory: {request.FunctionCategory}");

        if (!string.IsNullOrEmpty(request.MonitoringFrequency) && 
            !Enum.TryParse<MonitoringFrequencyEnum>(request.MonitoringFrequency, true, out _))
            throw new ValidationException($"Invalid MonitoringFrequency: {request.MonitoringFrequency}");

        var kpi = new Domain.Entities.Planning.KPI
        {
            ParentKPIId = request.ParentKPIId,
            MFOPAPId = request.MFOPAPId,
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            MeasurementUnit = request.MeasurementUnit,
            DistributionBehavior = request.DistributionBehavior,
            FunctionCategory = request.FunctionCategory,
            MonitoringFrequency = request.MonitoringFrequency,
            IsOptInAvailable = request.IsOptInAvailable,
            IsGAD = request.IsGAD,
            Status = "Active",
        };

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await unitOfWork.KPIRepository.AddAsync(kpi, cancellationToken);

            // Validate and link MFOPAP
            if (request.MFOPAPId.HasValue)
            {
                _ = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.MFOPAPId.Value, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"MFOPAP with ID {request.MFOPAPId.Value} was not found.");
            }

            // Link SDGs
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

            // Link Attributes
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

            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        return ApiResponse<Guid>.Success(kpi.Id, "KPI created successfully.");
    }
}
