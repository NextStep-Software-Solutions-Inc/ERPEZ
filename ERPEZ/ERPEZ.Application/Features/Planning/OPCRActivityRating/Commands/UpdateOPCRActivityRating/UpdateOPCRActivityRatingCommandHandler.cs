using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRActivityRating;

public class UpdateOPCRActivityRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRActivityRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateRating;

        var rating = await unitOfWork.OPCRActivityRatingRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Rating not found.");

        // Update only provided fields
        if (dto.ActualAccomplishedValue.HasValue)
            rating.ActualAccomplishedValue = dto.ActualAccomplishedValue.Value;

        if (dto.Score.HasValue)
            rating.Score = dto.Score.Value;

        if (dto.Remarks is not null)
            rating.Remarks = dto.Remarks;

        unitOfWork.OPCRActivityRatingRepository.Update(rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity Rating updated successfully.");
    }
}
