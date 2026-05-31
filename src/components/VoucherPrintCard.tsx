'use client'

import { QRCodeSVG } from 'qrcode.react'
import type { Voucher } from '@/types'
import type { PrintOptions } from './PrintOptionsModal'

const PALETTE = [
  '#059669', '#1e40af', '#dc2626', '#d97706',
  '#7c3aed', '#0891b2', '#16a34a', '#ea580c',
]

function profileColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

function lighten(hex: string, f: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const n = (c: number) => Math.min(255, Math.round(c + (255 - c) * f)).toString(16).padStart(2, '0')
  return `#${n(r)}${n(g)}${n(b)}`
}

interface Props {
  voucher: Voucher
  index: number
  hotspotName: string
  currency: string
  options: PrintOptions
  routerHost?: string
}

export default function VoucherPrintCard({ voucher, index, hotspotName, currency, options, routerHost }: Props) {
  const { design, style } = options
  const color    = profileColor(voucher.profile)
  const colorL   = lighten(color, 0.3)
  const colorVL  = lighten(color, 0.9)
  const colorMid = lighten(color, 0.7)
  const seq      = String(index + 1).padStart(3, '0')
  const isD3     = design === 3
  const showCreds = style === 'user'
  const qrUrl    = `http://${routerHost ?? '192.168.88.1'}/login?username=${encodeURIComponent(voucher.code)}&password=${encodeURIComponent(voucher.code)}`
  const ff       = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  const meta     = `${voucher.timeLimitLabel}  ·  ${voucher.amount ? `${currency}${voucher.amount}` : 'Free'}`

  /* ── Credentials card ─────────────────────────────── */
  /* ── QR Code + Credentials card (35×35mm) ──────────── */
  if (showCreds && isD3) {
    return (
      <div style={{
        width: '35mm', height: '35mm', background: '#fff',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', pageBreakInside: 'avoid', breakInside: 'avoid',
        border: `1px solid ${color}`, margin: 0, padding: 0, boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(90deg, ${color}, ${colorL})`,
          color: '#fff', padding: '2px 5px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: ff,
        }}>
          <span style={{ fontSize: '7px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '68%' }}>
            {hotspotName || 'WiFi Hotspot'}
          </span>
          <span style={{ fontSize: '5.5px', fontWeight: 600, opacity: 0.85, flexShrink: 0 }}>Wi-Fi Credentials</span>
        </div>

        {/* Body */}
        <div style={{
          flex: '1 1 0', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-evenly',
          padding: '3px 4px', gap: '2px', fontFamily: ff,
        }}>

          {/* QR code */}
          <div style={{
            border: `1px solid ${colorMid}`, borderRadius: '2px',
            padding: '2px', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QRCodeSVG value={qrUrl} size={52} level="L" />
          </div>

          {/* Scan hint */}
          <div style={{ fontSize: '5px', color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Scan to connect
          </div>

          {/* Credentials table */}
          <div style={{
            width: '100%', background: colorVL,
            border: `1px solid ${colorMid}`, borderRadius: '2px',
            padding: '2px 3px', display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            {[['Username', voucher.code], ['Password', voucher.code]].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '5.5px', color: '#9ca3af', width: '34px', flexShrink: 0 }}>{label}</span>
                <span style={{ width: '1px', height: '8px', background: colorMid, flexShrink: 0 }} />
                <span style={{ fontSize: '7px', fontWeight: 700, fontFamily: 'monospace', color: '#111827', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: colorVL, borderTop: `1px solid ${colorMid}`,
          padding: '1px 4px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontFamily: ff,
        }}>
          <span style={{ fontSize: '5.5px', color: '#9ca3af' }}>{meta}</span>
          <span style={{ fontSize: '5.5px', color, fontWeight: 700 }}>#{seq}</span>
        </div>
      </div>
    )
  }

  /* ── Classic Credentials card (35×22mm) ─────────────── */
  if (showCreds) {
    return (
      <div style={{
        width: '35mm', height: '22mm', background: '#fff',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', pageBreakInside: 'avoid', breakInside: 'avoid',
        border: `1px solid ${color}`, margin: 0, padding: 0, boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(90deg, ${color}, ${colorL})`,
          color: '#fff', padding: '1.5px 5px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: ff,
        }}>
          <span style={{ fontSize: '7px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
            {hotspotName || 'WiFi Hotspot'}
          </span>
          <span style={{ fontSize: '5.5px', fontWeight: 600, opacity: 0.85, flexShrink: 0 }}>Wi-Fi Access</span>
        </div>

        {/* Credential box */}
        <div style={{
          flex: '1 1 0', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '2px 4px', gap: '1px', fontFamily: ff,
        }}>
          <div style={{ fontSize: '5px', fontWeight: 700, textTransform: 'uppercase', color, letterSpacing: '0.06em', marginBottom: '1px' }}>
            Credentials
          </div>
          <div style={{
            background: colorVL, border: `1px solid ${colorMid}`, borderRadius: '2px',
            padding: '2px 3px', display: 'flex', flexDirection: 'column', gap: '1.5px',
          }}>
            {[['Username', voucher.code], ['Password', voucher.code]].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '5.5px', color: '#9ca3af', width: '34px', flexShrink: 0 }}>{label}</span>
                <span style={{ width: '1px', height: '8px', background: colorMid, flexShrink: 0 }} />
                <span style={{ fontSize: '7.5px', fontWeight: 700, fontFamily: 'monospace', color: '#111827', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background:  colorVL,
          borderTop:   `1px solid ${colorMid}`,
          padding:     '1px 4px',
          display:     'flex',
          justifyContent: 'space-between',
          alignItems:  'center',
          fontFamily:  ff,
        }}>
          <span style={{ fontSize: '5.5px', color: '#9ca3af' }}>{meta}</span>
          <span style={{ fontSize: '5.5px', color, fontWeight: 700 }}>#{seq}</span>
        </div>
      </div>
    )
  }

  /* ── Standard voucher card ────────────────────────── */
  return (
    <div style={{
      width:           '35mm',
      height:          isD3 ? '35mm' : '22mm',
      background:      '#fff',
      display:         'flex',
      flexDirection:   'column',
      overflow:        'hidden',
      pageBreakInside: 'avoid',
      breakInside:     'avoid',
      border:          `1px solid ${color}`,
      margin: 0, padding: 0, boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        background:   `linear-gradient(90deg, ${color}, ${colorL})`,
        color:        '#fff',
        fontSize:     '7px',
        fontWeight:   700,
        textAlign:    'center',
        padding:      '1px 4px',
        fontFamily:   ff,
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
      }}>
        {hotspotName || 'WiFi Hotspot'}
      </div>

      {/* Body */}
      <div style={{
        flex:           '1 1 0',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-evenly',
        alignItems:     'center',
        padding:        '1px 3px',
        textAlign:      'center',
        fontFamily:     ff,
      }}>
        {/* Title */}
        <div style={{ fontSize: '6px', fontWeight: 600, textTransform: 'uppercase', color, letterSpacing: '0.04em' }}>
          Wi-Fi Voucher
        </div>

        {/* QR Code — Design 3 only */}
        {isD3 && (
          <div style={{
            border: `1px dashed ${color}`,
            padding: '1px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <QRCodeSVG value={qrUrl} size={44} level="L" />
          </div>
        )}

        {/* Voucher Code */}
        <div style={{
          fontSize:      isD3 ? '8px' : '10px',
          fontWeight:    'bold',
          color:         '#000',
          border:        `1px dashed ${color}`,
          background:    colorVL,
          padding:       '1px 4px',
          fontFamily:    'monospace',
          letterSpacing: '0.08em',
        }}>
          {voucher.code}
        </div>

        {/* Meta */}
        <div style={{ fontSize: '6px', color: '#6b7280', whiteSpace: 'nowrap' }}>
          {voucher.timeLimitLabel}&nbsp;&nbsp;|&nbsp;&nbsp;
          {voucher.amount ? `${currency}${voucher.amount}` : 'Free'}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background:  colorVL,
        color,
        borderTop:   `1px solid ${colorMid}`,
        fontSize:    '6px',
        textAlign:   'center',
        padding:     '1px',
        fontWeight:  700,
        fontFamily:  ff,
      }}>
        #{seq}
      </div>
    </div>
  )
}
