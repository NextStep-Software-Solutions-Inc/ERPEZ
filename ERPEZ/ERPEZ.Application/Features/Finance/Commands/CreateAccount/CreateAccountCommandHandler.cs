using ERPEZ.Domain.Entities.Finance;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccount;

public class CreateAccountCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateAccountCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal year with ID {request.FiscalYearId} not found.");

        var fundSource = request.FundSourceId.HasValue
            ? await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"Fund source with ID {request.FundSourceId.Value} not found.")
            : null;

        if (string.IsNullOrWhiteSpace(request.Name) && fundSource is null)
        {
            throw new BadRequestException("Provide an account name or specify a fund source so the name can be derived.");
        }

        var existingAccount = await unitOfWork.AccountRepository.FindAsync(
            a => a.OfficeId == request.OfficeId && a.FundSourceId == request.FundSourceId && a.FiscalYearId == request.FiscalYearId,
            cancellationToken);

        if (existingAccount != null)
        {
            throw new ConflictException("An account for the specified office, fund source, and fiscal year already exists.");
        }

        var trimmedName = string.IsNullOrWhiteSpace(request.Name)
            ? fundSource!.Name.Trim()
            : request.Name.Trim();

        var account = new Account
        {
            OfficeId = request.OfficeId,
            FundSourceId = request.FundSourceId,
            FiscalYearId = request.FiscalYearId,
            Name = trimmedName,
            Balance = 0m,
            RunningBalance = 0m
        };

        await unitOfWork.AccountRepository.AddAsync(account, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(account.Id, "Account created successfully.");
    }
}
