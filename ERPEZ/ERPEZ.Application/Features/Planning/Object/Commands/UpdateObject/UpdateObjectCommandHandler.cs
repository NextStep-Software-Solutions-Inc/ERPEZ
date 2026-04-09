using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;

public class UpdateObjectCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateObjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateObjectCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateObject;

        if (dto.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(dto.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({dto.FiscalYearId.Value}) does not exist.");
        }

        if (dto.ExpenseClassId.HasValue)
        {
            _ = await unitOfWork.ExpenseClassRepository.GetByIdAsync(dto.ExpenseClassId.Value, cancellationToken) ?? throw new NotFoundException($"Expense Class with the specified ID ({dto.ExpenseClassId.Value}) does not exist.");
        }

        var reqObject = await unitOfWork.ObjectRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Object not found.");

        var newName = dto.Name ?? reqObject.Name;
        var newCode = dto.Code ?? reqObject.Code;
        var newFiscalYearId = dto.FiscalYearId ?? reqObject.FiscalYearId;

        var duplicate = await unitOfWork.ObjectRepository.FindAsync(o =>
            o.Id != request.Id &&
            o.ParentId == reqObject.ParentId &&
            o.Name == newName &&
            o.Code == newCode &&
            o.FiscalYearId == newFiscalYearId,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Object already exists.");

        reqObject.Code = newCode;
        reqObject.Name = newName;
        reqObject.IsActive = dto.IsActive ?? reqObject.IsActive;
        reqObject.FiscalYearId = newFiscalYearId;

        unitOfWork.ObjectRepository.Update(reqObject);

        // Update or create ObjectExpenseClass relationship if ExpenseClassId is provided
        if (dto.ExpenseClassId.HasValue)
        {
            // Find existing ObjectExpenseClass for this Object
            var existingObjectExpenseClass = await unitOfWork.ObjectExpenseClassRepository
                .FindAsync(oec => oec.ObjectId == request.Id && oec.IsActive, cancellationToken);

            if (existingObjectExpenseClass != null)
            {
                // Update existing relationship
                existingObjectExpenseClass.ExpenseClassId = dto.ExpenseClassId.Value;
                unitOfWork.ObjectExpenseClassRepository.Update(existingObjectExpenseClass);
            }
            else
            {
                // Create new relationship
                var objectExpenseClass = new Domain.Entities.Planning.ObjectExpenseClass
                {
                    ObjectId = request.Id,
                    ExpenseClassId = dto.ExpenseClassId.Value,
                    Name = $"{reqObject.Name} Classification",
                    Description = "Auto-created during object update",
                    IsActive = true
                };

                await unitOfWork.ObjectExpenseClassRepository.AddAsync(objectExpenseClass, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Object updated successfully.");
    }
}
