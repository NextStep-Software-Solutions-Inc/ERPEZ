using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using FiscalMonthEntity = ERPEZ.Domain.Entities.Planning.FiscalMonth;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public class CreateFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateFiscalYearCommand, ApiResponse<Guid>>
{
    private static readonly string[] monthNames = 
    [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    public async Task<ApiResponse<Guid>> Handle(CreateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var existing = await unitOfWork.FiscalYearRepository.GetByYearAsync(request.Year, cancellationToken);
        if (existing != null) throw new ConflictException("Fiscal year already exists.");

        var fiscalYear = new Domain.Entities.Planning.FiscalYear
        {
            Year = request.Year,
            Description = request.Description,
            Status = "setup"
        };

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await unitOfWork.FiscalYearRepository.AddAsync(fiscalYear, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            // Auto-generate 12 fiscal months
            var fiscalMonths = new List<FiscalMonthEntity>();
            for (int i = 0; i < 12; i++)
            {
                fiscalMonths.Add(new FiscalMonthEntity
                {
                    FiscalYearId = fiscalYear.Id,
                    Name = monthNames[i],
                    MonthIndex = i + 1,
                    IsLocked = false
                });
            }

            foreach (var month in fiscalMonths)
            {
                await unitOfWork.FiscalMonthRepository.AddAsync(month, cancellationToken);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        return ApiResponse<Guid>.Success(fiscalYear.Id, "Fiscal year created successfully.");
    }
}
