using ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Queries.GetExpenseClasses;

/// <summary>
/// Handler for GetExpenseClassesQuery that retrieves paginated Expense Classes from the database.
/// </summary>
public class GetExpenseClassesQueryHandler : IRequestHandler<GetExpenseClassesQuery, PaginatedApiResponse<ExpenseClassResponse>>
{
    private readonly IUnitOfWork unitOfWork;

    public GetExpenseClassesQueryHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<PaginatedApiResponse<ExpenseClassResponse>> Handle(GetExpenseClassesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.ExpenseClass, ExpenseClassResponse>> projection = ec => new ExpenseClassResponse
        {
            Id = ec.Id,
            Name = ec.Name,
            Code = ec.Code,
            Description = ec.Description,
            Type = ec.Type,
            IsActive = ec.IsActive,
            CreatedAt = ec.CreatedAt,
            CreatedBy = ec.CreatedBy,
            UpdatedAt = ec.UpdatedAt,
            UpdatedBy = ec.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.ExpenseClassRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ExpenseClassResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
