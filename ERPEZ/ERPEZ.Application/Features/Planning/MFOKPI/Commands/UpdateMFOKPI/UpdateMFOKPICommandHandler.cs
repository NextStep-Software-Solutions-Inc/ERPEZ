using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.UpdateMFOKPI;

public class UpdateMFOKPICommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateMFOKPICommand, ApiResponse<Domain.Entities.Planning.MFOKPI>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.MFOKPI>> Handle(UpdateMFOKPICommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateMFOKPI;

        if (dto?.MFOPAPId != null)
        {
            var mfopap = await _unitOfWork.MFOPAPRepository.GetByIdAsync(dto.MFOPAPId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("MFOPAP not found.");
        }

        var mfokpi = await _unitOfWork.MFOKPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("MFOKPI not found.");

        var duplicate = await _unitOfWork.MFOKPIRepository
            .FindAsync(x => x.MFOPAPId == dto!.MFOPAPId && x.KPIId == dto.KPIId, cancellationToken);

        if (duplicate != null)
            throw new ConflictException("MFOKPI with the same MFOPAP and KPI already exists.");

        mfokpi.MFOPAPId = dto?.MFOPAPId ?? mfokpi.MFOPAPId;
        mfokpi.KPIId = dto?.KPIId ?? mfokpi.KPIId;

        _unitOfWork.MFOKPIRepository.Update(mfokpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.MFOKPI>.Success(mfokpi, "MFOKPI updated successfully.");
    }
}

