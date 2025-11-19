using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizationById;

public record GetOrganizationByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.Organization>>;
