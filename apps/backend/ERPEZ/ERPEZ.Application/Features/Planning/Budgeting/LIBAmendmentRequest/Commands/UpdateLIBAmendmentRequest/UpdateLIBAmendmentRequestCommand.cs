using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.UpdateLIBAmendmentRequest;

public record UpdateLIBAmendmentRequestCommand(Guid Id, UpdateLIBAmendmentRequestRequest Request) : IRequest<ApiResponse<Unit>>;




