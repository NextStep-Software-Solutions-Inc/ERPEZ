using ERPEZ.Application.Features.Planning.MFOKPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.CreateMFOKPI;

public class CreateMFOKPICommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMFOKPICommand, ApiResponse<MFOKPIDto>>
{
    public async Task<ApiResponse<MFOKPIDto>> Handle(CreateMFOKPICommand request, CancellationToken cancellationToken)
    {
        if (request.MFOPAPId == Guid.Empty || request.KPIId == Guid.Empty)
        {
            return new ApiResponse<MFOKPIDto>
            {
                Message = "MFOPAP and KPI are required.",
                Succeeded = false
            };
        }
        var mfoKPIExist = await unitOfWork.MFOKPIRepository.FindAsync(
            t => t.MFOPAPId == request.MFOPAPId && t.KPIId == request.KPIId,
            cancellationToken: cancellationToken
        );

        if (mfoKPIExist != null)
            throw new ConflictException("MFOKPI already exists.");

        if (request.MFOPAPId != Guid.Empty)
        {
            var mfopap = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.MFOPAPId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("MFOPAP not found.");
        }

        if (request.KPIId != Guid.Empty)
        {
            var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");
        }

        var mfokpi = new Domain.Entities.Planning.MFOKPI
        {
            KPIId = request.KPIId,
            MFOPAPId = request.MFOPAPId
        };

        await unitOfWork.MFOKPIRepository.AddAsync(mfokpi, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var dto = new MFOKPIDto
        {
            Id = mfokpi.Id,
            KPIId = mfokpi.KPIId,
            MFOPAPId = mfokpi.MFOPAPId
        };
        return ApiResponse<MFOKPIDto>.Success(dto, "MFOKPI created successfully.");
    }
}
