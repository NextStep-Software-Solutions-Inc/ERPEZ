using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.CreateTransaction;

public class CreateTransactionCommand : IRequest<ApiResponse<Domain.Entities.Planning.Transaction>>
{
    public Guid FundSourceId { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid LocationId { get; set; }
    public Guid MFOPAPId { get; set; }
    public Guid ObjectId { get; set; }
    public DateTime TransactionDate { get; set; }
    public decimal AllotedAmount { get; set; }
    public decimal? ObligatedAmount { get; set; }
    public decimal? DisbursementAmount { get; set; }
}

