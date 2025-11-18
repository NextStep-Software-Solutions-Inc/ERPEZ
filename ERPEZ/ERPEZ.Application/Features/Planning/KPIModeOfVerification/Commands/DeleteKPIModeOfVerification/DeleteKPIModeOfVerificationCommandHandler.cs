using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.DeleteKPIModeOfVerification;

public class DeleteKPIModeOfVerificationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteKPIModeOfVerificationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPIModeOfVerificationCommand request, CancellationToken cancellationToken)
    {
        var kPIModeOfVerification = await unitOfWork.KPIModeOfVerificationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("KPI mode of verification not found.");

        unitOfWork.KPIModeOfVerificationRepository.Remove(kPIModeOfVerification);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"KPI mode of verification with ID {request.Id} deleted successfully.");
    }
}
