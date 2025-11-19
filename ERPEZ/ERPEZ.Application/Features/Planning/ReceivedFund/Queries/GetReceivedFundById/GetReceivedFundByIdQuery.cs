using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFundById;

public record class GetReceivedFundByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.ReceivedFund>>;
