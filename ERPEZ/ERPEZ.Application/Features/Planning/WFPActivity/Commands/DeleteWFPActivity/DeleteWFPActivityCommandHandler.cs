using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Commands.DeleteWFPActivity;

public class DeleteWFPActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPActivityCommand request, CancellationToken cancellationToken)
    {
        var wFPActivity = await unitOfWork.WFPActivityRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Actvity not found.");

        unitOfWork.WFPActivityRepository.Remove(wFPActivity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Activity with ID {request.Id} deleted successfully.");
    }
}
