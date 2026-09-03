using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ReturnDirectAcquisition;

public class ReturnDirectAcquisitionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnDirectAcquisitionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnDirectAcquisitionCommand command, CancellationToken cancellationToken)
    {
        var da = await unitOfWork.DirectAcquisitionRepository.GetByIdAsync(command.DirectAcquisitionId, cancellationToken);
        if (da == null)
        {
            return ApiResponse<Unit>.Fail("Direct Acquisition record not found.");
        }

        da.Remarks = command.Request.Remarks;
        da.Status = DirectAcquisitionStatusEnum.RETURNED;
        unitOfWork.DirectAcquisitionRepository.Update(da);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Direct Acquisition returned with remarks.");
    }
}
