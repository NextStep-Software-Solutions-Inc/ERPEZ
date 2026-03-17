using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.DeleteRatingScaleTemplate;

public class DeleteRatingScaleTemplateCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteRatingScaleTemplateCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteRatingScaleTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await unitOfWork.RatingScaleTemplateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template == null)
            throw new NotFoundException("Rating Scale Template not found.");

        // Check if template is referenced by KPIMeasurements
        var isReferenced = await unitOfWork.KPIMeasurementRepository.FindAsync(
            m => m.RatingScaleTemplateId == request.Id,
            cancellationToken);

        if (isReferenced != null)
            throw new ConflictException("Cannot delete Rating Scale Template because it is referenced by KPI Measurements.");

        unitOfWork.RatingScaleTemplateRepository.Remove(template, hardDelete: true);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Rating Scale Template deleted successfully.");
    }
}
