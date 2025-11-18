using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPById;

public class GetWFPByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPByIdQuery, ApiResponse<Domain.Entities.Planning.WFP>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFP>> Handle(GetWFPByIdQuery request, CancellationToken cancellationToken)
    {
        var wfp = await unitOfWork.WFPRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.WFP>.Success(wfp, "Retrieved successfully");
    }
}
