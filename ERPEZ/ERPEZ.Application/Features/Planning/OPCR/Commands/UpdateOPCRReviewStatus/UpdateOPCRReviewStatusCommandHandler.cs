using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRReviewStatus;


namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRReviewStatus;

public class UpdateOPCRReviewStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRReviewStatusCommand, ApiResponse<Unit>>
{
    private static readonly string[] validValues = ["Pending", "Draft", "Submitted", "Returned", "Finalized"];

    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRReviewStatusCommand request, CancellationToken cancellationToken)
    {
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        opcr.ReviewStatus = request.Request.ReviewStatus;

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Review status updated successfully.");
    }
}