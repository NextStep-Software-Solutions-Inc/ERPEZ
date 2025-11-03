using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateOPCRCommand, ApiResponse<OPCRDto>>
{
    public async Task<ApiResponse<OPCRDto>> Handle(CreateOPCRCommand request, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");
        var opcr = new Domain.Entities.Planning.OPCR
        {
            DeliveryUnitId = request.DeliveryUnitId,
            FiscalYear = request.FiscalYear,
            Status = request.Status

        };
        await _unitOfWork.OPCRRepository.AddAsync(opcr, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var opcrDto = new OPCRDto
        {
            Id = opcr.Id,
            DeliveryUnitId = opcr.DeliveryUnitId,
            FiscalYear = opcr.FiscalYear,
            Status = opcr.Status
        };
        return ApiResponse<OPCRDto>.Success(opcrDto, "OPCR created successfully.");
    }
}
