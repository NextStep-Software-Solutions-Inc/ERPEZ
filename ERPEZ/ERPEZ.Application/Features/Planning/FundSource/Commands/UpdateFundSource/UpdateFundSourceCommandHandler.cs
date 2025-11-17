using ERPEZ.Application.Features.Planning.FundSource.Dtos;
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

        if (dto == null)
        {
            throw new BadRequestException("UpdateFundSource data must be provided.");
        }
        if (dto.ParentId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.GetByIdAsync(dto.ParentId.Value, cancellationToken) ?? throw new NotFoundException("Parent Fund Source with the specified ID does not exist.");
        }

        var fundSource = await unitOfWork.FundSourceRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Fund Source not found.");
        // Check if another fund source (with a different ID) exists with the same name and type
        var existingFundSource = await unitOfWork.FundSourceRepository
            .FindAsync(x => x.Name == dto.Name && x.Type == dto.Type && x.Id != fundSource.Id, cancellationToken);
        if (existingFundSource != null)
        {
            throw new ConflictException("Fund Source already exist.");
        }

        fundSource.ParentId = dto?.ParentId ?? fundSource.ParentId;
        fundSource.Name = dto?.Name ?? fundSource.Name;
        fundSource.Code = dto?.Code ?? fundSource.Code;
        fundSource.Type = dto?.Type ?? fundSource.Type;
        fundSource.IsActive = dto?.IsActive ?? fundSource.IsActive;

        unitOfWork.FundSourceRepository.Update(fundSource);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new FundSourceResponse()
        {
            Id = fundSource.Id,
            ParentId = fundSource.ParentId,
            Name = fundSource.Name,
            Code = fundSource.Code,
            Type = fundSource.Type,
            IsActive = fundSource.IsActive,
            CreatedBy = fundSource.CreatedBy,
            CreatedAt = fundSource.CreatedAt
        };

        return ApiResponse<FundSourceResponse>.Success(result, "Fund Source updated successfully.");
    }
}
