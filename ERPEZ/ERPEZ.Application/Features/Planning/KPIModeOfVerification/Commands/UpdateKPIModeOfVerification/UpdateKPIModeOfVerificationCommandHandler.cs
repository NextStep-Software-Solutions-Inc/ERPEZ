using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.UpdateKPIModeOfVerification;

public class UpdateKPIModeOfVerificationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateKPIModeOfVerificationCommand, ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>> Handle(UpdateKPIModeOfVerificationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPIModeOfVerification;
        var kPIModeOfVerification = await _unitOfWork.KPIModeOfVerificationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI mode of verification assignment not found.");

        var duplicate = await _unitOfWork.KPIModeOfVerificationRepository
            .FindAsync(x => x.KPIId == dto.KPIId && x.Name == dto.Name, cancellationToken);

        if (duplicate != null)
            throw new ConflictException("KPI mode of verification with the same KPI and Delivery Unit already exists.");

        kPIModeOfVerification.KPIId = dto?.KPIId ?? kPIModeOfVerification.KPIId;
        kPIModeOfVerification.Name = dto?.Name ?? kPIModeOfVerification.Name;
        kPIModeOfVerification.Description = dto?.Description ?? kPIModeOfVerification.Description;

        _unitOfWork.KPIModeOfVerificationRepository.Update(kPIModeOfVerification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>.Success(kPIModeOfVerification, "KPI mode of verification updated successfully.");
    }
}