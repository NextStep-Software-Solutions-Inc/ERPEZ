using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerificationById;

public class GetKPIModeOfVerificationByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetKPIModeOfVerificationByIdQuery, ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>> Handle(GetKPIModeOfVerificationByIdQuery request, CancellationToken cancellationToken)
    {
        var kPIModeOfVerification = await _unitOfWork.KPIModeOfVerificationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>.Success(kPIModeOfVerification, "Retrieved successfully");
    }
}
