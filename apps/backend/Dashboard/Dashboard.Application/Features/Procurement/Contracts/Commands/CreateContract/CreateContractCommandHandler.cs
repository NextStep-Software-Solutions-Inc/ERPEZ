using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.CreateContract;

public class CreateContractCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<CreateContractCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateContractCommand request, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == request.NoticeOfAwardId && !n.IsDeleted, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Guid>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.Approved)
        {
            return ApiResponse<Guid>.Fail($"Notice of Award is in status '{noa.Status}'. Only 'Approved' Notice of Award can be contracted.");
        }

        var hasActiveContract = await unitOfWork.ContractRepository.ExistsActiveForNoaAsync(request.NoticeOfAwardId, cancellationToken);
        if (hasActiveContract)
        {
            return ApiResponse<Guid>.Fail("An active contract already exists for this Notice of Award.");
        }

        string contractNumber;
        if (!string.IsNullOrWhiteSpace(request.ContractNumber))
        {
            contractNumber = request.ContractNumber.Trim();
            var existingWithNumber = await unitOfWork.ContractRepository.FindAsync(
                c => c.ContractNumber == contractNumber && c.Status != ContractStatus.Cancelled && !c.IsDeleted,
                cancellationToken
            );
            if (existingWithNumber != null)
            {
                return ApiResponse<Guid>.Fail($"Contract number '{contractNumber}' is already in use.");
            }
        }
        else
        {
            var currentYear = DateTime.UtcNow.Year;
            var startOfYear = new DateTime(currentYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfYear = new DateTime(currentYear + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var yearContracts = await unitOfWork.ContractRepository.ToListAsync(
                unitOfWork.ContractRepository.Query(c => c.CreatedAt >= startOfYear && c.CreatedAt < endOfYear),
                cancellationToken
            );
            contractNumber = $"CONTRACT-{currentYear}-{(yearContracts.Count + 1):D3}";
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = contractNumber,
            NoticeOfAwardId = noa.Id,
            ContractDate = request.ContractDate != default ? request.ContractDate : DateOnly.FromDateTime(DateTime.UtcNow),
            Description = request.Description ?? string.Empty,
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = actorName,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = actorName
        };

        await unitOfWork.ContractRepository.AddAsync(contract, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(contract.Id, "Contract draft created successfully.");
    }
}
