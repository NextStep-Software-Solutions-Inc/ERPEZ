using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.DeleteOPCRItemRating;

public class DeleteOPCRItemRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOPCRItemRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        DeleteOPCRItemRatingCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OPCRItemRatingRepository.GetByIdAsync(
            request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item Rating not found.");

        unitOfWork.OPCRItemRatingRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item Rating deleted successfully.");
    }
}