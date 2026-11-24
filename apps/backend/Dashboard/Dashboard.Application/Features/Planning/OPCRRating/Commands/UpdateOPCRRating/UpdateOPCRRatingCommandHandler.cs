using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.UpdateOPCRRating;

public class UpdateOPCRRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRRating;
        var opcrRating = await unitOfWork.OPCRRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Rating not found.");

        opcrRating.NumericalRating = dto.NumericalRating ?? opcrRating.NumericalRating;
        opcrRating.Remarks = dto.Remarks ?? opcrRating.Remarks;

        unitOfWork.OPCRRatingRepository.Update(opcrRating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Rating updated successfully.");
    }
}
