using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomeById;

public record class GetWFPOutcomeByIdQueryHandler(IUnitOfWork UnitOfWork) : IRequestHandler<GetWFPOutcomeByIdQuery, ApiResponse<Domain.Entities.Planning.WFPOutcome>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPOutcome>> Handle(GetWFPOutcomeByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpOutcome = await UnitOfWork.WFPOutcomeRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.WFPOutcome>.Success(wfpOutcome, "Retrieved successfully");
    }
}
