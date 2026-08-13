using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.DeleteOPCRRating;

public class DeleteOPCRRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOPCRRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        var oPCRRating = await unitOfWork.OPCRRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR Rating not found.");

        unitOfWork.OPCRRatingRepository.Remove(oPCRRating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR Rating with ID {request.Id} deleted successfully.");
    }
}
