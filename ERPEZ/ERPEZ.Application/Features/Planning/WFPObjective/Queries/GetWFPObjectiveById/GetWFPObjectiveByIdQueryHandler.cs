using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectiveById;

public class GetWFPObjectiveByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetWFPObjectiveByIdQuery, ApiResponse<Domain.Entities.Planning.WFPObjective>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPObjective>> Handle(GetWFPObjectiveByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpObjective = await _unitOfWork.WFPObjectiveRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.WFPObjective>.Success(wfpObjective, "Retrieved successfully");
    }
}
