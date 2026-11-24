using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.CreateUACSCodeCombination;

public class CreateUACSCodeCombinationCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateUACSCodeCombinationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUACSCodeCombinationCommand request, CancellationToken cancellationToken)
    {
        var existing = await unitOfWork.UACSCodeCombinationRepository.FindAsync(
            c => c.CombinationCode == request.CombinationCode, cancellationToken);
        
        if (existing != null)
        {
            throw new ConflictException($"UACS code combination with code '{request.CombinationCode}' already exists.");
        }

        var codeCombination = new Domain.Entities.Planning.UACSCodeCombination
        {
            FundSourceId = request.FundSourceId,
            OrganizationId = request.OrganizationId,
            LocationId = request.LocationId,
            MFOPAPId = request.MFOPAPId,
            ObjectId = request.ObjectId,
            CombinationCode = request.CombinationCode,
            Description = request.Description,
            IsValid = request.IsValid,
            FiscalYearId = request.FiscalYearId,
            EffectiveDate = request.EffectiveDate,
            ExpiryDate = request.ExpiryDate,
            IsActive = request.IsActive
        };

        await unitOfWork.UACSCodeCombinationRepository.AddAsync(codeCombination, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(codeCombination.Id, "UACS code combination created successfully.");
    }
}
