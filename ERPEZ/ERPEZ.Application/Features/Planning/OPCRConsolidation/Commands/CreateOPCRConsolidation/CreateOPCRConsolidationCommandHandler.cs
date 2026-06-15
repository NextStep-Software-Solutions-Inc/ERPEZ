using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.CreateOPCRConsolidation;

public class CreateOPCRConsolidationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRConsolidationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateOPCRConsolidationCommand request, CancellationToken cancellationToken)
    {
        var opcrIds = request.Request.OpcrIds;

        var opcrs = await unitOfWork.OPCRRepository.FindAllAsync(
            o => opcrIds.Contains(o.Id), cancellationToken);

        var foundIds = opcrs.Select(o => o.Id).ToHashSet();
        var missingIds = opcrIds.Where(id => !foundIds.Contains(id)).ToList();
        if (missingIds.Count > 0)
            throw new NotFoundException($"OPCR(s) not found: {string.Join(", ", missingIds)}");

        var alreadyConsolidated = opcrs.Where(o => o.OPCRConsolidationId.HasValue).ToList();
        if (alreadyConsolidated.Count > 0)
            throw new BadRequestException(
                $"OPCR(s) already consolidated: {string.Join(", ", alreadyConsolidated.Select(o => o.Id))}");

        var distinctFiscalYears = opcrs.Select(o => o.FiscalYearId).Distinct().ToList();
        if (distinctFiscalYears.Count > 1)
            throw new BadRequestException("All OPCRs must belong to the same fiscal year.");

        var consolidation = new Domain.Entities.Planning.OPCRConsolidation
        {
            Id           = Guid.NewGuid(),
            FiscalYearId = distinctFiscalYears[0],
            Name         = $"Consolidation-{DateTime.UtcNow:yyyyMMddHHmmss}",
            CreatedAt    = DateTime.UtcNow
        };

        await unitOfWork.OPCRConsolidationRepository.AddAsync(consolidation, cancellationToken);

        foreach (var opcr in opcrs)
        {
            opcr.OPCRConsolidationId = consolidation.Id;
            unitOfWork.OPCRRepository.Update(opcr);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(consolidation.Id, "OPCRs consolidated successfully.");
    }
}