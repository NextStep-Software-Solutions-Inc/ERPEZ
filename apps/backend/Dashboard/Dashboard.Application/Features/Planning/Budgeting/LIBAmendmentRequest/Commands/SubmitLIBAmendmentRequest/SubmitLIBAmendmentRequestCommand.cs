using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.SubmitLIBAmendmentRequest;

public record SubmitLIBAmendmentRequestCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
