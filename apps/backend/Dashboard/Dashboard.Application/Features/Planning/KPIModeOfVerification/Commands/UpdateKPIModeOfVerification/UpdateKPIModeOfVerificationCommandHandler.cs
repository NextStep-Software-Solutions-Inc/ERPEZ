using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.UpdateKPIModeOfVerification;

public class UpdateKPIModeOfVerificationCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService) : IRequestHandler<UpdateKPIModeOfVerificationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPIModeOfVerificationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPIModeOfVerification;
        var kPIModeOfVerification = await unitOfWork.KPIModeOfVerificationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI mode of verification assignment not found.");

        var duplicate = await unitOfWork.KPIModeOfVerificationRepository
            .FindAsync(x => x.KPIId == dto.KPIId && x.Name == dto.Name, cancellationToken);

        if (duplicate != null)
            throw new ConflictException("KPI mode of verification with the same KPI and Delivery Unit already exists.");

        string? url = null;
        if (dto?.FileId.HasValue == true)
        {
            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(dto.FileId.Value, cancellationToken);
            url = promotedUrl;
        }

        kPIModeOfVerification.KPIId = dto?.KPIId ?? kPIModeOfVerification.KPIId;
        kPIModeOfVerification.Name = dto?.Name ?? kPIModeOfVerification.Name;
        kPIModeOfVerification.Description = dto?.Description ?? kPIModeOfVerification.Description;
        if (url != null)
        {
            kPIModeOfVerification.Url = url;
        }

        unitOfWork.KPIModeOfVerificationRepository.Update(kPIModeOfVerification);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI mode of verification updated successfully.");
    }
}
