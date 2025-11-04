using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;

public class CreatePerformanceMeasureCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreatePerformanceMeasureCommand, ApiResponse<PerformanceMeasureDto>>
{
    public async Task<ApiResponse<PerformanceMeasureDto>> Handle(CreatePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var pm = new Domain.Entities.Planning.PerformanceMeasure
        {
            Name = request.Name,
            Description = request.Description
        };

        await _unitOfWork.PerformanceMeasureRepository.AddAsync(pm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PerformanceMeasureDto
        {
            Id = pm.Id,
            Name = pm.Name,
            Description = pm.Description
        };
        return ApiResponse<PerformanceMeasureDto>.Success(dto, "Performance Measure created successfully.");
    }
}
