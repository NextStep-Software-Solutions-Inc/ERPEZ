using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.UpdatePMT;

public class UpdatePMTCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePMTCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePMTCommand request, CancellationToken cancellationToken)
    {
        var pmt = await unitOfWork.PMTRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );

        if (pmt == null)
            throw new NotFoundException($"PMT with ID '{request.Id}' not found.");

        // Validate Organization if provided
        if (request.UpdatePMT.OrganizationId.HasValue)
        {
            var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(
                request.UpdatePMT.OrganizationId.Value,
                cancellationToken
            );

            if (organization == null)
                throw new NotFoundException($"Organization with ID '{request.UpdatePMT.OrganizationId}' not found.");

            // Check if PMT already exists for new organization and year combination
            var targetYear = request.UpdatePMT.ActiveYear ?? pmt.ActiveYear;
            if (request.UpdatePMT.OrganizationId.Value != pmt.OrganizationId)
            {
                var existingPMT = await unitOfWork.PMTRepository.ExistsForOrganizationAndYearAsync(
                    request.UpdatePMT.OrganizationId.Value,
                    targetYear,
                    cancellationToken
                );

                if (existingPMT)
                    throw new ConflictException($"PMT already exists for this Organization in year {targetYear}.");
            }

            pmt.OrganizationId = request.UpdatePMT.OrganizationId.Value;
        }

        // Validate ActiveYear change
        if (request.UpdatePMT.ActiveYear.HasValue && request.UpdatePMT.ActiveYear.Value != pmt.ActiveYear)
        {
            // Check if PMT already exists for organization and new year
            var existingPMT = await unitOfWork.PMTRepository.ExistsForOrganizationAndYearAsync(
                pmt.OrganizationId,
                request.UpdatePMT.ActiveYear.Value,
                cancellationToken
            );

            if (existingPMT)
                throw new ConflictException($"PMT already exists for this Organization in year {request.UpdatePMT.ActiveYear.Value}.");

            pmt.ActiveYear = request.UpdatePMT.ActiveYear.Value;
        }

        // Update fields
        if (request.UpdatePMT.IsManualWorkflow.HasValue)
            pmt.IsManualWorkflow = request.UpdatePMT.IsManualWorkflow.Value;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
