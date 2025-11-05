using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Queries.GetWFPActivityById;

public record class GetWFPActivityByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.WFPActivity>>;