using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");
        var opcr = new Domain.Entities.Planning.OPCR
        {
            DeliveryUnitId = request.DeliveryUnitId,
            FiscalYearId = request.FiscalYearId,
        };
        await unitOfWork.OPCRRepository.AddAsync(opcr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
       
        return ApiResponse<Guid>.Success(opcr.Id, "OPCR created successfully.");
    }
}
