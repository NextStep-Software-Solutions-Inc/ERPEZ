using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerificationById;

public class GetKPIModeOfVerificationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIModeOfVerificationByIdQuery, ApiResponse<KPIModeOfVerificationResponse>>
{
    public async Task<ApiResponse<KPIModeOfVerificationResponse>> Handle(GetKPIModeOfVerificationByIdQuery request, CancellationToken cancellationToken)
    {
        var kPIModeOfVerification = await unitOfWork.KPIModeOfVerificationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new KPIModeOfVerificationResponse
        {
            Id = kPIModeOfVerification.Id,
            KPIId = kPIModeOfVerification.KPIId,
            Name = kPIModeOfVerification.Name,
            Description = kPIModeOfVerification.Description,
            Url = kPIModeOfVerification.Url
        };

        return ApiResponse<KPIModeOfVerificationResponse>.Success(response, "Retrieved successfully");
    }
}
