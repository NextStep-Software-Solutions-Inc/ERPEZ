using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.UpdateOPCRKPI;

public class UpdateOPCRKPICommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateOPCRKPICommand, ApiResponse<Domain.Entities.Planning.OPCRKPI>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRKPI>> Handle(UpdateOPCRKPICommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRKPI;
        if (dto.KPIId != null)
        {
            _ = await _unitOfWork.KPIRepository.FindAsync(
                x => x.Id == dto.KPIId,
                cancellationToken
            ) ?? throw new NotFoundException("KPI not found.");
        }
        if(dto.OPCRId != null)
        {
            _ =  await _unitOfWork.OPCRRepository.FindAsync(
                x => x.Id == dto.OPCRId,
                cancellationToken
            ) ?? throw new NotFoundException("OPCR not found.");
        }

        var opcrKpi = await _unitOfWork.OPCRKPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR KPI not found.");

        opcrKpi.KPIId = dto.KPIId ?? opcrKpi.KPIId;
        opcrKpi.OPCRId = dto.OPCRId ?? opcrKpi.OPCRId;

        _unitOfWork.OPCRKPIRepository.Update(opcrKpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.OPCRKPI>.Success(opcrKpi, "OPCR KPI updated successfully.");
    }
}
