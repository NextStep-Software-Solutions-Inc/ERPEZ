using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.DeleteRating;

public class DeleteRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteRatingCommand request, CancellationToken cancellationToken)
    {
        var rating = await unitOfWork.RatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Rating not found.");

        unitOfWork.RatingRepository.Remove(rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"KPI Rating with ID {request.Id} deleted successfully.");
    }
}
