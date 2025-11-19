using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.DeleteOPCRActivity;

public class DeleteOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOPCRActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        var oPCRActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");

        unitOfWork.OPCRActivityRepository.Remove(oPCRActivity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR Activity with ID {request.Id} deleted successfully.");
    }
}
