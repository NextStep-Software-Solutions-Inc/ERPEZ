using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Planning.APP.Commands.RemovePPMPs;

public class RemovePPMPsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RemovePPMPsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(RemovePPMPsCommand request, CancellationToken cancellationToken)
    {
        // Validate APP exists
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var ppmpIds = request.PPMPIds;

        // Load existing links for the requested PPMPs and APP
        var query = unitOfWork.APPPPMPRepository.Query()
            .Where(ap => ap.APPId == request.APPId && ppmpIds.Contains(ap.PPMPId) && !ap.IsDeleted);
        var existingLinks = await unitOfWork.APPPPMPRepository.ToListAsync(query, cancellationToken);

        // Check if any requested PPMPIds are not currently linked
        var linkedPPMPIds = existingLinks.Select(ap => ap.PPMPId).ToHashSet();
        var notLinkedIds = ppmpIds.Except(linkedPPMPIds).ToList();

        if (notLinkedIds.Any())
        {
            throw new NotFoundException($"The following PPMPs are not linked to this APP: {string.Join(", ", notLinkedIds)}");
        }

        // Remove the links
        if (existingLinks.Any())
        {
            unitOfWork.APPPPMPRepository.RemoveRange(existingLinks);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value, $"{existingLinks.Count} PPMPs unselected successfully.");
    }
}
