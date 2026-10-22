using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetailById;

public class GetLineItemBudgetDetailByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLineItemBudgetDetailByIdQuery, ApiResponse<LineItemBudgetDetailResponse>>
{
    public async Task<ApiResponse<LineItemBudgetDetailResponse>> Handle(GetLineItemBudgetDetailByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetDetailRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {query.Id} not found.");

        var item = new LineItemBudgetDetailResponse
        {
            Id = entity.Id,
            LineItemBudgetId = entity.LineItemBudgetId,
            LineItemBudgetActivityId = entity.LineItemBudgetActivityId,
            WFPObjectiveActivityExpenditureId = entity.WFPObjectiveActivityExpenditureId,
            ObjectId = entity.ObjectId,
            Description = entity.Description,
            TimelineType = entity.TimelineType,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            Budget = entity.Budget,
            UnitQuantity = entity.UnitQuantity,
            UnitCost = entity.UnitCost,
            LineItemBudget = entity.LineItemBudget == null ? null : new LineItemBudgetDetailLIBResponse
            {
                Id = entity.LineItemBudget.Id,
                LIBNumber = entity.LineItemBudget.LIBNumber,
                Name = entity.LineItemBudget.Name ?? string.Empty
            },
            LineItemBudgetActivity = entity.LineItemBudgetActivity == null ? null : new LineItemBudgetDetailActivityResponse
            {
                Id = entity.LineItemBudgetActivity.Id,
                Name = entity.LineItemBudgetActivity.Name
            },
            Object = entity.Object == null ? null : new LineItemBudgetDetailObjectResponse
            {
                Id = entity.Object.Id,
                Name = entity.Object.Name,
                Code = entity.Object.Code,
                ParentId = entity.Object.ParentId,
                ParentObject = entity.Object.ParentObject == null ? null : new LineItemBudgetDetailObjectParentResponse
                {
                    Id = entity.Object.ParentObject.Id,
                    Name = entity.Object.ParentObject.Name,
                    Code = entity.Object.ParentObject.Code
                }
            },
            WFPObjectiveActivityExpenditure = entity.WFPObjectiveActivityExpenditure == null ? null : new LineItemBudgetDetailWFPExpenditureResponse
            {
                Id = entity.WFPObjectiveActivityExpenditure.Id,
                ItemDescription = entity.WFPObjectiveActivityExpenditure.ItemDescription,
                Quantity = entity.WFPObjectiveActivityExpenditure.Quantity,
                UnitCost = entity.WFPObjectiveActivityExpenditure.UnitCost
            },
            ExpenseClass = ResolveExpenseClass(entity.Object)
        };

        return ApiResponse<LineItemBudgetDetailResponse>.Success(item);
    }

    private static LineItemBudgetDetailExpenseClassResponse? ResolveExpenseClass(Domain.Entities.Planning.Object? obj)
    {
        if (obj == null) return null;

        // 1. Direct active ExpenseClass on Object
        var directEc = obj.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive && oc.ExpenseClass != null && oc.ExpenseClass.IsActive)?.ExpenseClass;
        if (directEc != null)
        {
            return new LineItemBudgetDetailExpenseClassResponse
            {
                Id = directEc.Id,
                Name = directEc.Name,
                Code = directEc.Code,
                Type = directEc.Type.ToString()
            };
        }

        // 2. Parent's active ExpenseClass
        var parentEc = obj.ParentObject?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive && oc.ExpenseClass != null && oc.ExpenseClass.IsActive)?.ExpenseClass;
        if (parentEc != null)
        {
            return new LineItemBudgetDetailExpenseClassResponse
            {
                Id = parentEc.Id,
                Name = parentEc.Name,
                Code = parentEc.Code,
                Type = parentEc.Type.ToString()
            };
        }

        // 3. Parent object itself as Expense Class (if parent is not the root "Expenses" container)
        if (obj.ParentObject != null && !IsRootExpensesNode(obj.ParentObject.Code, obj.ParentObject.Name))
        {
            return new LineItemBudgetDetailExpenseClassResponse
            {
                Id = obj.ParentObject.Id,
                Name = obj.ParentObject.Name,
                Code = obj.ParentObject.Code,
                Type = MapExpenseClassType(obj.ParentObject.Code, obj.ParentObject.Name)
            };
        }

        // 4. Code prefix resolution from Philippine UACS code (PS: 501, MOOE: 502, FE: 503, CO: 506)
        var cleanCode = (obj.Code ?? string.Empty).Replace("-", "").Replace(":", "").Trim();
        var lowerName = (obj.Name ?? string.Empty).ToLowerInvariant();

        if (cleanCode.StartsWith("501", StringComparison.OrdinalIgnoreCase) || cleanCode.StartsWith("51", StringComparison.OrdinalIgnoreCase) || lowerName.Contains("personnel services"))
        {
            return new LineItemBudgetDetailExpenseClassResponse { Id = Guid.Empty, Name = "Personnel Services", Code = "50100000", Type = "PS" };
        }
        if (cleanCode.StartsWith("502", StringComparison.OrdinalIgnoreCase) || cleanCode.StartsWith("52", StringComparison.OrdinalIgnoreCase) || lowerName.Contains("maintenance and other operating") || lowerName.Contains("mooe"))
        {
            return new LineItemBudgetDetailExpenseClassResponse { Id = Guid.Empty, Name = "Maintenance and Other Operating Expenses", Code = "50200000", Type = "MOOE" };
        }
        if (cleanCode.StartsWith("503", StringComparison.OrdinalIgnoreCase) || cleanCode.StartsWith("53", StringComparison.OrdinalIgnoreCase) || lowerName.Contains("financial expenses"))
        {
            return new LineItemBudgetDetailExpenseClassResponse { Id = Guid.Empty, Name = "Financial Expenses", Code = "50300000", Type = "FE" };
        }
        if (cleanCode.StartsWith("506", StringComparison.OrdinalIgnoreCase) || cleanCode.StartsWith("56", StringComparison.OrdinalIgnoreCase) || cleanCode.StartsWith("106", StringComparison.OrdinalIgnoreCase) || lowerName.Contains("capital outlay") || lowerName.Contains("capital outlays"))
        {
            return new LineItemBudgetDetailExpenseClassResponse { Id = Guid.Empty, Name = "Capital Outlays", Code = "50600000", Type = "CO" };
        }

        return null;
    }

    private static bool IsRootExpensesNode(string? code, string? name)
    {
        if (string.IsNullOrWhiteSpace(code) && string.IsNullOrWhiteSpace(name)) return true;
        return string.Equals(name, "Expenses", StringComparison.OrdinalIgnoreCase) ||
               string.Equals(code, "CLS:Expenses", StringComparison.OrdinalIgnoreCase) ||
               code == "50000000" ||
               (code != null && code.StartsWith("50000000"));
    }

    private static string MapExpenseClassType(string? code, string? name)
    {
        var cleanCode = (code ?? string.Empty).Replace("-", "").Replace(":", "").Trim();
        var lower = (name ?? string.Empty).ToLowerInvariant();
        if (cleanCode.StartsWith("501") || lower.Contains("personnel")) return "PS";
        if (cleanCode.StartsWith("502") || lower.Contains("maintenance") || lower.Contains("operating") || lower.Contains("mooe")) return "MOOE";
        if (cleanCode.StartsWith("503") || lower.Contains("financial")) return "FE";
        if (cleanCode.StartsWith("506") || lower.Contains("capital")) return "CO";
        return string.Empty;
    }
}

