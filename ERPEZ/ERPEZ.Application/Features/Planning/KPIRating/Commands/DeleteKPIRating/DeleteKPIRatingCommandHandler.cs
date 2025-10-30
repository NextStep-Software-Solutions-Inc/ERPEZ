using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.DeleteKPIRating;

public class DeleteKPIRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteKPIRatingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPIRatingCommand request, CancellationToken cancellationToken)
    {
        var kPIRating = await unitOfWork.KPIRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("KPI Rating not found.");

        unitOfWork.KPIRatingRepository.Remove(kPIRating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"KPI Rating with ID {request.Id} deleted successfully.");
    }
}
