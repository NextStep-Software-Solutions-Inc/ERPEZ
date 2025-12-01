using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;

public class CreatePerformanceMeasureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePerformanceMeasureCommand, ApiResponse<PerformanceMeasureDto>>
{
    public async Task<ApiResponse<PerformanceMeasureDto>> Handle(CreatePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var existingPerformanceMeasure = await unitOfWork.PerformanceMeasureRepository.FindAsync(x => x.Name == request.Name, cancellationToken);
        if (existingPerformanceMeasure != null)
        {
            throw new ConflictException($"Performance Measure with name '{request.Name}' already exists.");
        }

        var pm = new Domain.Entities.Planning.PerformanceMeasure
        {
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.PerformanceMeasureRepository.AddAsync(pm, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PerformanceMeasureDto
        {
            Id = pm.Id,
            Name = pm.Name,
            Description = pm.Description
        };
        return ApiResponse<PerformanceMeasureDto>.Success(dto, "Performance Measure created successfully.");
    }
}
