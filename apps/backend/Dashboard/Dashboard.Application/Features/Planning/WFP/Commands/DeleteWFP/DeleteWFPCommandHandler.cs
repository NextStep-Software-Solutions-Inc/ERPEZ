using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.DeleteWFP;

public class DeleteWFPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPCommand request, CancellationToken cancellationToken)
    {
        var wfp = await unitOfWork.WFPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP not found.");

        if (wfp.Status == Domain.Enums.StatusEnum.Approved ||
            wfp.Status == Domain.Enums.StatusEnum.Active)
        {
            throw new ValidationException($"Cannot delete a Work and Financial Plan with status '{wfp.Status}'.");
        }

        unitOfWork.WFPRepository.Remove(wfp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP with ID {request.Id} deleted successfully.");
    }
}
