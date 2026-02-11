using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.CreateUOM;

public class CreateUOMCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateUOMCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUOMCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicates
        var existing = await unitOfWork.UOMRepository.FindAsync(
            x => (x.Name == request.Name || x.Code == request.Code) && !x.IsDeleted,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"UOM with name '{request.Name}' or code '{request.Code}' already exists.");

        // Validate parent if provided
        if (request.ParentId.HasValue)
        {
            var parent = await unitOfWork.UOMRepository.GetByIdAsync(request.ParentId.Value, cancellationToken)
                ?? throw new NotFoundException("Parent UOM not found.");
        }

        var entity = new Domain.Entities.Planning.UOM
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            ConversionFactor = request.ConversionFactor,
            ParentId = request.ParentId
        };

        await unitOfWork.UOMRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "UOM created successfully.");
    }
}
