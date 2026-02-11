using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.CreateUNSPSCCode;

public class CreateUNSPSCCodeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateUNSPSCCodeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUNSPSCCodeCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicates
        var existing = await unitOfWork.UNSPSCCodeRepository.FindAsync(
            x => x.Code == request.Code && !x.IsDeleted,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"UNSPSC code '{request.Code}' already exists.");

        // Validate parent if not Level 1
        if (request.Level > 1)
        {
            if (!request.ParentId.HasValue)
                throw new ValidationException($"Parent is required for Level {request.Level} codes.");

            var parent = await unitOfWork.UNSPSCCodeRepository.GetByIdAsync(request.ParentId.Value, cancellationToken)
                ?? throw new NotFoundException("Parent UNSPSC code not found.");

            // Validate parent level
            if (parent.Level != request.Level - 1)
                throw new ValidationException($"Parent must be Level {request.Level - 1} for a Level {request.Level} code.");
        }
        else if (request.ParentId.HasValue)
        {
            throw new ValidationException("Level 1 codes cannot have a parent.");
        }

        var entity = new Domain.Entities.Planning.UNSPSCCode
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Level = request.Level,
            ParentId = request.ParentId
        };

        await unitOfWork.UNSPSCCodeRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "UNSPSC code created successfully.");
    }
}
