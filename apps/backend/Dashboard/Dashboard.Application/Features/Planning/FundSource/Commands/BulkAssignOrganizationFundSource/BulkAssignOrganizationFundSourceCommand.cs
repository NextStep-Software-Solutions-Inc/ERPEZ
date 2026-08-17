using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.BulkAssignOrganizationFundSource;

public record BulkAssignOrganizationFundSourceCommand(
    Guid OrganizationId,
    List<Guid> FundSourceIds
) : IRequest<ApiResponse<bool>>;
