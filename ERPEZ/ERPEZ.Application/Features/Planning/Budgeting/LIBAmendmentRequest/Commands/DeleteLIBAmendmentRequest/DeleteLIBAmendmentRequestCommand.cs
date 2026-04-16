using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.DeleteLIBAmendmentRequest;

public record DeleteLIBAmendmentRequestCommand(Guid Id) : IRequest<ApiResponse<Unit>>;




