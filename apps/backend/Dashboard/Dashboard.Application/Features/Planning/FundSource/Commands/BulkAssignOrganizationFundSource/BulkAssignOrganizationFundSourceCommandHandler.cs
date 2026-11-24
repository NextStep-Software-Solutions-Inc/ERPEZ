using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.BulkAssignOrganizationFundSource;

public class BulkAssignOrganizationFundSourceCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<BulkAssignOrganizationFundSourceCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        BulkAssignOrganizationFundSourceCommand request, 
        CancellationToken cancellationToken)
    {
        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(request.OrganizationId, cancellationToken)
            ?? throw new NotFoundException($"Organization with ID {request.OrganizationId} not found.");

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var existingLinks = await unitOfWork.OrganizationFundSourceRepository.ToListAsync(
                unitOfWork.OrganizationFundSourceRepository.Query(l => l.OrganizationId == request.OrganizationId),
                cancellationToken);

            var requestedIdsSet = request.FundSourceIds.ToHashSet();

            // Deactivate links not in the requested list
            foreach (var link in existingLinks)
            {
                if (!requestedIdsSet.Contains(link.FundSourceId))
                {
                    link.IsActive = false;
                    unitOfWork.OrganizationFundSourceRepository.Update(link);
                }
                else
                {
                    link.IsActive = true;
                    unitOfWork.OrganizationFundSourceRepository.Update(link);
                    requestedIdsSet.Remove(link.FundSourceId);
                }
            }

            // Add new links
            foreach (var newFundSourceId in requestedIdsSet)
            {
                var newLink = new OrganizationFundSource
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = request.OrganizationId,
                    FundSourceId = newFundSourceId,
                    IsActive = true
                };
                await unitOfWork.OrganizationFundSourceRepository.AddAsync(newLink, cancellationToken);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<bool>.Success(true, $"Successfully assigned {request.FundSourceIds.Count} Fund Source(s) to Organization '{organization.Name}'.");
    }
}
