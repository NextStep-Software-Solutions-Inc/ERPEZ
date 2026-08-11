using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;

public class CreatePerformanceMeasureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePerformanceMeasureCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var pm = new Domain.Entities.Planning.PerformanceMeasure
        {
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.PerformanceMeasureRepository.AddAsync(pm, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(pm.Id, "Performance Measure created successfully.");
    }
}
