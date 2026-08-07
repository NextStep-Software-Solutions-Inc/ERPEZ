/**
 * Generic printable bid document template.
 * Used for all template documents that don't have a custom layout (Scope of Works, CSHP, Bid Form, etc.)
 */

interface Section {
  heading: string
  lines?: string[]
  blank?: number // number of blank lines for bidder to fill
}

interface GenericBidDocumentProps {
  title: string
  documentNumber?: string
  project: {
    title: string
    contractNo: string
    abc: string
    committee: string
  }
  instructions?: string
  sections?: Section[]
}

export function GenericBidDocument({
  title,
  documentNumber,
  project,
  instructions,
  sections = [],
}: GenericBidDocumentProps) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '48px 64px',
        maxWidth: 720,
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        lineHeight: 1.6,
        color: '#111',
      }}
    >
      {/* University header */}
      <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #1a2a5e', paddingBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>
          University of Science and Technology of Southern Philippines – System
        </p>
        <p style={{ fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 }}>BIDS AND AWARDS COMMITTEE</p>
      </div>

      {/* Document title */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {documentNumber && (
          <p style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{documentNumber}</p>
        )}
        <h1
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textDecoration: 'underline',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Project info box */}
      <div
        style={{
          border: '1px solid #1a2a5e',
          borderRadius: 4,
          padding: '12px 16px',
          marginBottom: 24,
          backgroundColor: '#f5f7ff',
        }}
      >
        <p style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>
          {project.committee}
        </p>
        <p style={{ marginBottom: 2 }}>
          <strong>Project:</strong> {project.title}
        </p>
        <p style={{ marginBottom: 2 }}>
          <strong>Contract No.:</strong> {project.contractNo}
        </p>
        <p>
          <strong>ABC:</strong> {project.abc}
        </p>
      </div>

      {/* Instructions */}
      {instructions && (
        <div
          style={{
            marginBottom: 24,
            padding: '10px 14px',
            backgroundColor: '#fffbe6',
            border: '1px solid #e6c800',
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          <strong>NOTE:</strong> {instructions}
        </div>
      )}

      {/* Bidder info block */}
      <div style={{ marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              "Name of Bidder / Supplier:",
              "Address:",
              "Contact Number:",
              "Email Address:",
              "PhilGEPS Registration No.:",
            ].map((label) => (
              <tr key={label}>
                <td
                  style={{
                    padding: '8px 10px',
                    border: '1px solid #ccc',
                    fontWeight: 'bold',
                    width: '40%',
                    backgroundColor: '#f9f9f9',
                    fontSize: 11,
                  }}
                >
                  {label}
                </td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc', width: '60%' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, fontSize: 12 }}>
            {section.heading}
          </p>
          {section.lines?.map((line, j) => (
            <p key={j} style={{ marginBottom: 4, paddingLeft: 12 }}>
              {line}
            </p>
          ))}
          {section.blank &&
            Array.from({ length: section.blank }).map((_, j) => (
              <div
                key={j}
                style={{
                  borderBottom: '1px solid #bbb',
                  height: 28,
                  marginBottom: 8,
                }}
              />
            ))}
        </div>
      ))}

      {/* Signature block */}
      <div style={{ marginTop: 40 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', padding: '0 20px 0 0', verticalAlign: 'bottom' }}>
                <div style={{ borderTop: '1px solid #111', paddingTop: 6, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: 11 }}>Signature over Printed Name</p>
                  <p style={{ fontSize: 10, color: '#555' }}>Authorized Representative of Bidder</p>
                </div>
              </td>
              <td style={{ width: '50%', padding: '0 0 0 20px', verticalAlign: 'bottom' }}>
                <div style={{ borderTop: '1px solid #111', paddingTop: 6, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: 11 }}>Date</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 10, color: '#aaa', marginTop: 48 }}>
        C.M. Recto Avenue, Lapasan, Cagayan de Oro City 9000 Philippines | Tel. Nos. +63 (88) 858 1738 | www.ustp.edu.ph
      </p>
    </div>
  )
}
