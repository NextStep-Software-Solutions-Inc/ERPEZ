using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFiscalYearCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetWithAllocationsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        if (fiscalYear.Status == "closed")
            throw new ForbiddenException("Cannot update a closed fiscal year.");

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            fiscalYear.Description = request.Description;
            var allocations = request.FunctionAllocations.Select(a => new Domain.Entities.Planning.FunctionAllocation
            {
                FiscalYearId = fiscalYear.Id,
                FunctionType = Enum.Parse<FunctionTypeEnum>(a.FunctionType),
                Percentage = a.Percentage
            }).ToList();

            fiscalYear.FunctionAllocations = allocations;

            unitOfWork.FiscalYearRepository.Update(fiscalYear);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Fiscal year updated successfully.");
    }
}
