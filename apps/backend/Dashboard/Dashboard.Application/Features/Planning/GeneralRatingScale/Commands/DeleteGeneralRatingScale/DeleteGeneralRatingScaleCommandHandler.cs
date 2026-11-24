using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.DeleteGeneralRatingScale;

public class DeleteGeneralRatingScaleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteGeneralRatingScaleCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteGeneralRatingScaleCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.GeneralRatingScaleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("General Rating Scale not found.");

        unitOfWork.GeneralRatingScaleRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
