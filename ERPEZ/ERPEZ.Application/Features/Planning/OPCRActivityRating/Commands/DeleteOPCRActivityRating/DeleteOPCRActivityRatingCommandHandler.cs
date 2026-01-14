using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.DeleteOPCRActivityRating;

public class DeleteOPCRActivityRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOPCRActivityRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRActivityRatingCommand request, CancellationToken cancellationToken)
    {
        var rating = await unitOfWork.OPCRActivityRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Rating not found.");

        unitOfWork.OPCRActivityRatingRepository.Delete(rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity Rating deleted successfully.");
    }
}
