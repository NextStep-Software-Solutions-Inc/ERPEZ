using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ApproveLIBAmendmentRequest;

public record ApproveLIBAmendmentRequestCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
