using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public record SubmitConsolidatedPRCommand(Guid Id) : IRequest<ApiResponse<Unit>>;