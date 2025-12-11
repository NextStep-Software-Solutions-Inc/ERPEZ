using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public class UpdateOPCRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCR;
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        if (dto.DeliveryUnitId != null)
        {
            _ = await unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == dto.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");
        }

        opcr.DeliveryUnitId = dto?.DeliveryUnitId ?? opcr.DeliveryUnitId;
        opcr.FiscalYearId = dto?.FiscalYearId ?? opcr.FiscalYearId;

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR updated successfully.");
    }
}
