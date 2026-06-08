using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.CreateKPIMeasurement;

public class CreateKPIMeasurementCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateKPIMeasurementCommand, ApiResponse<List<Guid>>>
{
    public async Task<ApiResponse<List<Guid>>> Handle(CreateKPIMeasurementCommand request, CancellationToken cancellationToken)
    {
        // Validate KPI exists
        _ = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"KPI with ID {request.KPIId} not found.");

        // 2. Validate all RatingScaleTemplateIds up front
        var templateIds = request.Measurements
            .Where(m => m.RatingScaleTemplateId.HasValue)
            .Select(m => m.RatingScaleTemplateId!.Value)
            .Distinct();
        
        foreach (var templateId in templateIds)
        {
            _= await unitOfWork.RatingScaleTemplateRepository.GetByIdAsync(templateId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"RatingScaleTemplate with ID {templateId} not found.");
        }

        // Delete existing measurements for this KPI
        var existing = await unitOfWork.KPIMeasurementRepository.FindAllAsync(
            m => m.KPIId == request.KPIId, cancellationToken);

        unitOfWork.KPIMeasurementRepository.RemoveRange(existing);

        // 4. Insert the new set
        var newMeasurements = request.Measurements.Select(m => new Domain.Entities.Planning.KPIMeasurement
        {
            Id = Guid.NewGuid(),
            KPIId = request.KPIId,
            Name = m.Name,
            Statement = m.Statement,
            Dimensions = m.Dimensions,
            RatingScaleTemplateId = m.RatingScaleTemplateId,
            MOVs = m.MOVs,
            IsMOVEditable = m.IsMOVEditable,
            IsScaleEditable = m.IsScaleEditable,
        }).ToList();
    
        await unitOfWork.KPIMeasurementRepository.AddRangeAsync(newMeasurements, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<List<Guid>>.Success(
            newMeasurements.Select(m => m.Id).ToList(),
            "KPI Measurements created successfully.");
    }
}
