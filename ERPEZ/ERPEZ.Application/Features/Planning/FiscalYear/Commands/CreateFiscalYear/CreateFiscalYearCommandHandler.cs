using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public class CreateFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateFiscalYearCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var existing = await unitOfWork.FiscalYearRepository.GetByYearAsync(request.Year, cancellationToken);
        if (existing != null) throw new ConflictException("Fiscal year already exists.");

        var fiscalYear = new Domain.Entities.Planning.FiscalYear
        {
            Year = request.Year,
            Description = request.Description,
            IsLocked = false
        };

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await unitOfWork.FiscalYearRepository.AddAsync(fiscalYear, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var allocations = request.FunctionAllocations.Select(a => new FunctionAllocation
            {
                FiscalYearId = fiscalYear.Id,
                FunctionType = a.FunctionType,
                Percentage = a.Percentage
            }).ToList();

            fiscalYear.FunctionAllocations = allocations;
            unitOfWork.FiscalYearRepository.Update(fiscalYear);
            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        return ApiResponse<Guid>.Success(fiscalYear.Id, "Fiscal year created successfully.");
    }
}
