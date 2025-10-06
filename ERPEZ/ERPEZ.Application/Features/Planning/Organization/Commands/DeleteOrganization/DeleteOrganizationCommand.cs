using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.DeleteOrganization;

public record class DeleteOrganizationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;