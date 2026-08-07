using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.CreateKPIModeOfVerification;

public class CreateKPIModeOfVerificationCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<CreateKPIModeOfVerificationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPIModeOfVerificationCommand request, CancellationToken cancellationToken)
    {
        if (request.KPIId == Guid.Empty)
        {
            return new ApiResponse<Guid>
            {
                Message = "KPI is required.",
                Succeeded = false
            };
        }
        var kPIModeOfVerification = await unitOfWork.KPIModeOfVerificationRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.Name == request.Name,
            cancellationToken: cancellationToken
        );

        if (kPIModeOfVerification != null)
            throw new ConflictException("KPI mode of verification already exists.");

        if (request.KPIId != Guid.Empty)
        {
            var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");
        }

        string? url = null;
        if (request.FileId.HasValue)
        {
            var promoted = await fileStorageService.PromoteFileAsync(request.FileId.Value, cancellationToken: cancellationToken);
            url = promoted.Url;
        }

        var kpiModeOfVerification = new Domain.Entities.Planning.KPIModeOfVerification
        {
            KPIId = request.KPIId,
            Name = request.Name,
            Description = request.Description,
            Url = url
        };

        await unitOfWork.KPIModeOfVerificationRepository.AddAsync(kpiModeOfVerification, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(kpiModeOfVerification.Id, "KPI Mode of verification created successfully.");
    }
}
