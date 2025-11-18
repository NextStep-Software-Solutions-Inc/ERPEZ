using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;

public class UpdateFundSourceCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFundSourceCommand, ApiResponse<FundSourceResponse>>
{
    public async Task<ApiResponse<FundSourceResponse>> Handle(UpdateFundSourceCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateFundSource;

        if (dto.ParentId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.GetByIdAsync(dto.ParentId.Value, cancellationToken) ?? throw new NotFoundException("Parent Fund Source with the specified ID does not exist.");
        }

        var fundSourceType = Enum.Parse<FundSourceTypeEnum>(dto.Type);
        var fundSource = await unitOfWork.FundSourceRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Fund Source not found.");

        // Check for duplicate name and type combination (excluding current fund source)
        if (dto.Name != null)
        {
            var existingFundSource = await unitOfWork.FundSourceRepository.FindAsync(fs => fs.Name == dto.Name && fs.Type == fundSourceType && fs.Id != request.Id,
                cancellationToken);
            if (existingFundSource != null)
                throw new ConflictException("Fund Source with the same name and type already exists.");
        }

        fundSource.ParentId = dto!.ParentId ?? fundSource.ParentId;
        fundSource.Name = dto!.Name ?? fundSource.Name;
        fundSource.Code = dto!.Code ?? fundSource.Code;
        fundSource.Type = fundSourceType;
        fundSource.IsActive = dto!.IsActive ?? fundSource.IsActive;

        unitOfWork.FundSourceRepository.Update(fundSource);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new FundSourceResponse()
        {
            Id = fundSource.Id,
            ParentId = fundSource.ParentId,
            Name = fundSource.Name,
            Code = fundSource.Code,
            TotalDUAllocatedFunds = fundSource.ReceivedFunds
                .SelectMany(rf => rf.DUFundAllocations)
                .Sum(dufa => dufa.Amount),
            TotalReceivedFunds = fundSource.ReceivedFunds.Sum(rf => rf.Amount),
            Type = fundSource.Type.ToString(),
            IsActive = fundSource.IsActive,
            CreatedBy = fundSource.CreatedBy,
            CreatedAt = fundSource.CreatedAt
        };

        return ApiResponse<FundSourceResponse>.Success(result, "Fund Source updated successfully.");
    }
}
