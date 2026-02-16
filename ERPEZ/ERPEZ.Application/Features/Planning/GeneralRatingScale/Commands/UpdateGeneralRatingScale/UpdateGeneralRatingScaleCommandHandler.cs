using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.UpdateGeneralRatingScale;

public class UpdateGeneralRatingScaleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateGeneralRatingScaleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateGeneralRatingScaleCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.GeneralRatingScaleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("General Rating Scale not found.");

        entity.AdjectivalRatingName = request.AdjectivalRatingName;
        entity.MinScore = request.MinScore;
        entity.MaxScore = request.MaxScore;

        unitOfWork.GeneralRatingScaleRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
