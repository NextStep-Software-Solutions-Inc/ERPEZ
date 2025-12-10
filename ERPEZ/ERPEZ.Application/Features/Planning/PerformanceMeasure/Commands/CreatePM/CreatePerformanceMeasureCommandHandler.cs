using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;

public class CreatePerformanceMeasureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePerformanceMeasureCommand, ApiResponse<PerformanceMeasureResponse>>
{
    public async Task<ApiResponse<PerformanceMeasureResponse>> Handle(CreatePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var pm = new Domain.Entities.Planning.PerformanceMeasure
        {
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.PerformanceMeasureRepository.AddAsync(pm, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PerformanceMeasureResponse
        {
            Id = pm.Id,
            Name = pm.Name,
            Description = pm.Description
        };
        return ApiResponse<PerformanceMeasureResponse>.Success(dto, "Performance Measure created successfully.");
    }
}
