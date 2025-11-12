using ERPEZ.Application.Features.Planning.OPCRKPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.CreateOPCRKPI;

public class CreateOPCRKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRKPICommand, ApiResponse<OPCRKPIDto>>
{
    public async Task<ApiResponse<OPCRKPIDto>> Handle(CreateOPCRKPICommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.KPIRepository.FindAsync(k => k.Id == request.KPIId, cancellationToken) ?? throw new NotFoundException("KPI not found.");
        _ = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == request.OPCRId, cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        var opcrkpiExist = await unitOfWork.OPCRKPIRepository.FindAsync(
            x => x.KPIId == request.KPIId && x.OPCRId == request.OPCRId,
            cancellationToken
        );
        if (opcrkpiExist != null)
            throw new ConflictException("OPCR KPI with the same KPI and OPCR already exists.");

        var opcrKpi = new Domain.Entities.Planning.OPCRKPI
        {
            KPIId = request.KPIId,
            OPCRId = request.OPCRId
        };

        await unitOfWork.OPCRKPIRepository.AddAsync(opcrKpi, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCRKPIDto
        {
            Id = opcrKpi.Id,
            KPIId = opcrKpi.KPIId,
            OPCRId = opcrKpi.OPCRId
        };
        return ApiResponse<OPCRKPIDto>.Success(dto, "OPCR KPI created successfully.");
    }
}
