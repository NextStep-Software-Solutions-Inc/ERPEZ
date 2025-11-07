using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomeById;

public record class GetWFPOutcomeByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.WFPOutcome>>;
