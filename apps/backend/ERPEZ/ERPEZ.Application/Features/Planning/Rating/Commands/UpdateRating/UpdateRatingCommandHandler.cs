using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.UpdateRating;

public class UpdateRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateRating;

        var rating = await unitOfWork.RatingRepository.GetByIdWithJoinAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Rating not found.");

        rating.Remarks = dto?.Remarks ?? rating.Remarks;
        rating.NumericalRating = dto?.NumericalRating ?? rating.NumericalRating;

        unitOfWork.RatingRepository.Update(rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Unit>.Success(Unit.Value, "Rating updated successfully.");
    }
}
