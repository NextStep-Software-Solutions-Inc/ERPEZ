using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Queries.GetLibRealignmentPdf;

public record GetLibRealignmentPdfQuery(Guid RealignmentId) : IRequest<(byte[] Bytes, string ContentType, string FileName)>;
