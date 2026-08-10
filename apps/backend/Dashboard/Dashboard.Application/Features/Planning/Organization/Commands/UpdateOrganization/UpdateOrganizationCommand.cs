using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.UpdateOrganization;

public class UpdateOrganizationCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOrganizationRequest UpdateOrganization { get; set; }
}
