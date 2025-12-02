using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRStatus;

public class UpdateOPCRStatusCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRStatusCommand request, CancellationToken cancellationToken)
    {
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR not found.");

        opcr.Status = Enum.Parse<StatusEnum>(request.UpdateOPCRStatus.Status);

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR status updated successfully.");
    }
}