/**
 * Mock document: 11. Marking of Envelopes
 * Reference: USTP-IFPB02-05-2026-43-25771
 * This renders the official bid envelope marking template as a printable HTML document.
 */
export function MarkingOfEnvelopes() {
  const project = {
    title: 'RE-BIDDING FOR THE PROPOSED CONSTRUCTION OF SMART ACADEMIC BUILDING PHASE 1, USTP-JASAAN CAMPUS CY 2026',
    contractNo: 'USTP-IFPB02-05-2026-43-25771',
    abc: '₱70,000,000.00',
    deadline: 'JUNE 16, 2026, 01:30 P.M.',
    committee: 'USTP – CDO CAMPUS BIDS AND AWARDS COMMITTEE\nUNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES\nC.M. RECTO AVE., LAPASAN, CAGAYAN DE ORO CITY',
  }

  const EnvelopeCard = ({
    label,
    typeLabel,
  }: {
    label: string
    typeLabel: string
  }) => (
    <div
      style={{
        border: '3px solid #1a2a5e',
        borderRadius: 4,
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', borderBottom: '2px solid #1a2a5e' }}>
        <div
          style={{
            flex: 1,
            padding: '10px 14px',
            fontWeight: 'bold',
            fontSize: 13,
            borderRight: '2px solid #1a2a5e',
            backgroundColor: '#d9d9d9',
          }}
        >
          BIDDER'S NAME & ADDRESS
        </div>
        <div
          style={{
            flex: 1,
            padding: '10px 14px',
            fontWeight: 'bold',
            fontSize: 13,
            backgroundColor: '#d9d9d9',
            whiteSpace: 'pre-line',
          }}
        >
          {typeLabel}
        </div>
      </div>

      {/* Committee row */}
      <div
        style={{
          padding: '12px 14px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 12,
          backgroundColor: '#ebebeb',
          borderBottom: '2px solid #1a2a5e',
          whiteSpace: 'pre-line',
          lineHeight: 1.6,
        }}
      >
        {project.committee}
      </div>

      {/* Project title row */}
      <div
        style={{
          padding: '10px 14px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 12,
          backgroundColor: '#ebebeb',
          borderBottom: '2px solid #1a2a5e',
          lineHeight: 1.6,
        }}
      >
        {project.title}
        <br />
        (Contract No. {project.contractNo})
        <br />
        <br />
        ABC: {project.abc}
      </div>

      {/* Do not open row */}
      <div
        style={{
          padding: '14px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 18,
          backgroundColor: '#ffffff',
          letterSpacing: 0.5,
        }}
      >
        DO NOT OPEN BEFORE {project.deadline}
      </div>
    </div>
  )

  const Section = ({ title, subtitle, typeLabel }: { title: string; subtitle: string; typeLabel: string }) => (
    <div style={{ marginBottom: 40 }}>
      <p style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2, fontFamily: 'Arial, sans-serif' }}>{title}</p>
      <p style={{ fontSize: 13, marginBottom: 14, fontFamily: 'Arial, sans-serif', color: '#333' }}>{subtitle}</p>
      <EnvelopeCard label={subtitle} typeLabel={typeLabel} />
    </div>
  )

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px 60px', maxWidth: 720, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      {/* Page title */}
      <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', marginBottom: 32, letterSpacing: 1 }}>
        Marking of Envelopes
      </h1>

      {/* First Bid Envelope */}
      <h2 style={{ fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', marginBottom: 16 }}>First Bid Envelope</h2>

      <Section title="Original – Technical Documents" subtitle="Original – Technical Documents" typeLabel={'ORIGINAL – TECHNICAL\nDOCUMENTS'} />
      <Section title="Copy No. 1 – Technical Documents" subtitle="Copy No. 1 – Technical Documents" typeLabel={'COPY NO. 1 – TECHNICAL\nDOCUMENTS'} />

      {/* Outer envelope for technical */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 13, marginBottom: 14, fontFamily: 'Arial, sans-serif', color: '#333' }}>
          <strong>Outer</strong> – Technical Documents
        </p>
        <EnvelopeCard label="Outer – Technical Documents" typeLabel="TECHNICAL DOCUMENTS" />
      </div>

      <hr style={{ margin: '36px 0', borderColor: '#ccc' }} />

      {/* Second Bid Envelope */}
      <h2 style={{ fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', marginBottom: 16 }}>Second Bid Envelope</h2>

      <Section title="Original – Financial Documents" subtitle="Original – Financial Documents" typeLabel={'ORIGINAL – FINANCIAL\nDOCUMENTS'} />
      <Section title="Copy No. 1 – Financial Documents" subtitle="Copy No. 1 – Financial Documents" typeLabel={'COPY NO. 1– FINANCIAL\nDOCUMENTS'} />

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 13, marginBottom: 14, fontFamily: 'Arial, sans-serif', color: '#333' }}>
          <strong>Outer</strong> – Financial Documents
        </p>
        <EnvelopeCard label="Outer – Financial Documents" typeLabel="FINANCIAL DOCUMENTS" />
      </div>

      <hr style={{ margin: '36px 0', borderColor: '#ccc' }} />

      {/* Outer Envelope */}
      <h2 style={{ fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', marginBottom: 16 }}>Outer Envelope</h2>
      <div style={{ marginBottom: 40 }}>
        <EnvelopeCard label="Outer Envelope" typeLabel="BID" />
      </div>

      <hr style={{ margin: '36px 0', borderColor: '#ccc' }} />

      {/* Reminder */}
      <div style={{ textAlign: 'center', padding: '20px 40px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 'bold', fontSize: 18, textDecoration: 'underline', marginBottom: 16, fontFamily: 'Arial, sans-serif' }}>REMINDER</h2>
        <p style={{ fontSize: 14, lineHeight: 2, fontFamily: 'Arial, sans-serif' }}>
          Each Bidder shall submit<br />
          <strong><u>One (1) Original</u></strong>,{' '}
          <strong><u>One (1) Additional Copy</u></strong> of the first and second components of its bid<br />
          and<br />
          <strong><em><u>One (1) Electronic Copy</u></em></strong> through <em>Flash Drive</em> of the first component of its bid.
        </p>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#999', fontFamily: 'Arial, sans-serif' }}>
        C.M. Recto Avenue, Lapasan, Cagayan de Oro City 9000 Philippines | Tel. Nos. +63 (88) 858 1738 | www.ustp.edu.ph
      </p>
    </div>
  )
}
