using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ReturnLIBAmendmentRequest;

public record ReturnLIBAmendmentRequestCommand(Guid Id, ReturnLIBAmendmentRequestRequest Request) : IRequest<ApiResponse<Unit>>;
