using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.CreatePMT;

public class CreatePMTCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePMTCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePMTCommand request, CancellationToken cancellationToken)
    {
        // Validate Organization exists
        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(
            request.OrganizationId,
            cancellationToken
        );

        if (organization == null)
            throw new NotFoundException($"Organization with ID '{request.OrganizationId}' not found.");

        // Check if PMT already exists for this organization and year
        var existingPMT = await unitOfWork.PMTRepository.ExistsForOrganizationAndYearAsync(
            request.OrganizationId,
            request.ActiveYear,
            cancellationToken
        );

        if (existingPMT)
            throw new ConflictException($"PMT already exists for Organization '{organization.Name}' in year {request.ActiveYear}.");

        // Create entity
        var pmt = new Domain.Entities.Planning.PMT
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            ActiveYear = request.ActiveYear,
            IsManualWorkflow = request.IsManualWorkflow
        };

        await unitOfWork.PMTRepository.AddAsync(pmt, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(pmt.Id);
    }
}
