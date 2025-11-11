using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public class UpdateOPCRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRCommand, ApiResponse<Domain.Entities.Planning.OPCR>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCR>> Handle(UpdateOPCRCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCR;
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        if (dto.DeliveryUnitId != null)
        {
            _ = await unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == dto.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");
        }

        opcr.DeliveryUnitId = dto?.DeliveryUnitId ?? opcr.DeliveryUnitId;
        opcr.FiscalYear = dto?.FiscalYear ?? opcr.FiscalYear;
        opcr.Status = dto?.Status ?? opcr.Status;


        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.OPCR>.Success(opcr, "OPCR updated successfully.");
    }
}
