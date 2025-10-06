using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.DeleteOrganization;

public class DeleteOrganizationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOrganizationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOrganizationCommand request, CancellationToken cancellationToken)
    {
        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Location not found.");

        unitOfWork.OrganizationRepository.Remove(organization);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Organization with ID {request.Id} deleted successfully.");
    }
}
