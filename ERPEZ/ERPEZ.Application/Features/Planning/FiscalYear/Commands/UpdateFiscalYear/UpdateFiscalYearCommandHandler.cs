using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFiscalYearCommand, ApiResponse<FiscalYearResponse>>
{
    public async Task<ApiResponse<FiscalYearResponse>> Handle(UpdateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetWithAllocationsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        if (fiscalYear.IsLocked) throw new ForbiddenException("Fiscal year is locked.");

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            fiscalYear.Description = request.Description;
            var allocations = request.FunctionAllocations.Select(a => new Domain.Entities.Planning.FunctionAllocation
            {
                FiscalYearId = fiscalYear.Id,
                FunctionType = a.FunctionType,
                Percentage = a.Percentage
            }).ToList();

            if (allocations.Count != 0) fiscalYear.FunctionAllocations = allocations;

            unitOfWork.FiscalYearRepository.Update(fiscalYear);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        var dto = new FiscalYearResponse
        {
            Id = fiscalYear.Id,
            Year = fiscalYear.Year,
            Description = fiscalYear.Description,
            IsLocked = fiscalYear.IsLocked,
            FunctionAllocations = request.FunctionAllocations.Select(a => new FunctionAllocationResponse
            {
                Id = null, // Updated allocations don't have IDs in response
                FunctionType = a.FunctionType,
                Percentage = a.Percentage
            }).ToList()
        };

        return ApiResponse<FiscalYearResponse>.Success(dto, "Fiscal year updated successfully.");
    }
}
