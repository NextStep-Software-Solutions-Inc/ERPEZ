using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Queries.GetObjectExpenseClasses;

/// <summary>
/// Handler for GetObjectExpenseClassesQuery that retrieves paginated Object Expense Class mappings from the database.
/// </summary>
public class GetObjectExpenseClassesQueryHandler : IRequestHandler<GetObjectExpenseClassesQuery, PaginatedApiResponse<ObjectExpenseClassResponse>>
{
    private readonly IUnitOfWork unitOfWork;

    public GetObjectExpenseClassesQueryHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<PaginatedApiResponse<ObjectExpenseClassResponse>> Handle(GetObjectExpenseClassesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.ObjectExpenseClass, ObjectExpenseClassResponse>> projection = oec => new ObjectExpenseClassResponse
        {
            Id = oec.Id,
            ObjectId = oec.ObjectId,
            ExpenseClassId = oec.ExpenseClassId,
            Name = oec.Name,
            Description = oec.Description,
            IsActive = oec.IsActive,
            CreatedAt = oec.CreatedAt,
            CreatedBy = oec.CreatedBy,
            UpdatedAt = oec.UpdatedAt,
            UpdatedBy = oec.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.ObjectExpenseClassRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ObjectExpenseClassResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
