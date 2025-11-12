using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.CreateKPIModeOfVerification;

public class CreateKPIModeOfVerificationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateKPIModeOfVerificationCommand, ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>> Handle(CreateKPIModeOfVerificationCommand request, CancellationToken cancellationToken)
    {
        if (request.KPIId == Guid.Empty)
        {
            return new ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>
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
        var kpiModeOfVerification = new Domain.Entities.Planning.KPIModeOfVerification
        {
            KPIId = request.KPIId,
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.KPIModeOfVerificationRepository.AddAsync(kpiModeOfVerification, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>.Success(kpiModeOfVerification, "KPI Mode of verification created successfully.");
    }
}
