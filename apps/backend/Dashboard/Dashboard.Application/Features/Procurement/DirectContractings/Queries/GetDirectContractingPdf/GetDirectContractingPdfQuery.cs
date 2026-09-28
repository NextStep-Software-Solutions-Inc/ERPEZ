using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingPdf;

public record DirectContractingPdfFileResult(byte[] FileBytes, string FileName, string ContentType);

public record GetDirectContractingPdfQuery(Guid DirectContractingId) : IRequest<ApiResponse<DirectContractingPdfFileResult>>;
