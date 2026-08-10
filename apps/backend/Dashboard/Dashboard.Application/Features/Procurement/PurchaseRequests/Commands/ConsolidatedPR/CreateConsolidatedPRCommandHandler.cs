using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class CreateConsolidatedPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateConsolidatedPRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateConsolidatedPRCommand request, CancellationToken cancellationToken)
    {
        var cprNumber = $"CPR-{request.Dto.ConsolidationDate.Year}-{DateTime.UtcNow.Ticks % 10000:D4}";

        var existing = await unitOfWork.ConsolidatedPRRepository.FindAsync(
            x => x.CPRNumber == cprNumber && !x.IsDeleted, cancellationToken);

        if (existing is not null)
            throw new ConflictException($"Consolidated PR number '{cprNumber}' already exists.");

        var cpr = new ERPEZ.Domain.Entities.Procurement.ConsolidatedPR
        {
            CPRNumber         = cprNumber,
            Description       = request.Dto.Description,
            Purpose           = request.Dto.Purpose,
            ConsolidationDate = request.Dto.ConsolidationDate,
            TotalAmount       = 0,
            Status            = StatusEnum.Draft
        };

        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(cpr.Id, "Consolidated PR created successfully.");
    }
}