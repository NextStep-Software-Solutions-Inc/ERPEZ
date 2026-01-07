using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRCommand request, CancellationToken cancellationToken)
    {
        var du = await unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");

        if(du.ParentId != null) throw new ConflictException("Only top-level Delivery Units can have OPCRs.");
        
        var opcr = new Domain.Entities.Planning.OPCR
        {
            DeliveryUnitId = request.DeliveryUnitId,
            FiscalYearId = request.FiscalYearId,
            Name = request.Name ?? string.Empty,
        };
        await unitOfWork.OPCRRepository.AddAsync(opcr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
       
        return ApiResponse<Guid>.Success(opcr.Id, "OPCR created successfully.");
    }
}
