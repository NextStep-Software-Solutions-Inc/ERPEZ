using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.UpdateOPCRItemRating;

public class UpdateOPCRItemRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRItemRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRItemRatingCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OPCRItemRatingRepository.GetByIdAsync(
            request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item Rating not found.");

        var dto = request.UpdateOPCRItemRating;

        if (dto.PMTRating.HasValue)
            entity.PMTRating = dto.PMTRating;

        if (dto.PMTRemark != null)
            entity.PMTRemark = dto.PMTRemark;

        unitOfWork.OPCRItemRatingRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item Rating updated successfully.");
    }
}