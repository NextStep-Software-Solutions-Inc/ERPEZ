// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChartTheme } from '@/components/ui/chart-tooltip'
import FooterStyle from '@/components/partials/customizer/footer-style'
import SelectTheme from '@/components/partials/customizer/select-theme'
import GlobalProviders from '../GlobalProviders'

vi.mock('@/auth/UnifiedAuthProvider', () => ({
  UnifiedAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/DevRoleSwitcher', () => ({
  DevRoleSwitcher: () => null,
}))

vi.mock('erpez-shared-lib', () => ({
  initConsoleSecurityWarning: vi.fn(),
}))

type MediaQueryListener = (event: MediaQueryListEvent) => void

function createMatchMediaController(initialDark: boolean) {
  let isDark = initialDark
  const listeners = new Set<MediaQueryListener>()

  const matchMediaMock = vi.fn().mockImplementation((query: string) => {
    const isColorSchemeDarkQuery = query.includes('prefers-color-scheme: dark')
    return {
      get matches() {
        return isColorSchemeDarkQuery ? isDark : !isDark
      },
      media: query,
      onchange: null,
      addListener: (cb: MediaQueryListener) => {
        if (isColorSchemeDarkQuery) listeners.add(cb)
      },
      removeListener: (cb: MediaQueryListener) => {
        listeners.delete(cb)
      },
      addEventListener: (event: string, cb: MediaQueryListener) => {
        if (event === 'change' && isColorSchemeDarkQuery) {
          listeners.add(cb)
        }
      },
      removeEventListener: (event: string, cb: MediaQueryListener) => {
        if (event === 'change') {
          listeners.delete(cb)
        }
      },
      dispatchEvent: vi.fn(),
    }
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMediaMock,
  })

  return {
    setSystemDark(nextDark: boolean) {
      isDark = nextDark
      const event = {
        matches: nextDark,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
    },
  }
}

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const chartTheme = useChartTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="chart-is-dark">{String(chartTheme.isDark)}</span>
      <span data-testid="chart-tick-color">{chartTheme.tickColor}</span>
      <span data-testid="chart-cursor-fill">{chartTheme.barCursor.fill}</span>
      <button type="button" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button type="button" onClick={() => setTheme('system')}>
        Set System
      </button>
    </div>
  )
}

describe('System Theme Initial Load, Dynamic OS Toggling & useChartTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('respects OS dark preference upon initial load when no theme is stored (GlobalProviders)', async () => {
    createMatchMediaController(true)

    render(
      <GlobalProviders>
        <ThemeProbe />
      </GlobalProviders>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(screen.getByTestId('chart-is-dark').textContent).toBe('true')
      expect(screen.getByTestId('chart-tick-color').textContent).toBe('#94a3b8')
    })
  })

  it('respects OS light preference upon initial load when no theme is stored (GlobalProviders)', async () => {
    createMatchMediaController(false)

    render(
      <GlobalProviders>
        <ThemeProbe />
      </GlobalProviders>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(screen.getByTestId('chart-is-dark').textContent).toBe('false')
      expect(screen.getByTestId('chart-tick-color').textContent).toBe('#64748b')
    })
  })

  it('dynamically updates DOM class, resolvedTheme, and useChartTheme when OS preference toggles', async () => {
    const controller = createMatchMediaController(false)

    render(
      <GlobalProviders>
        <ThemeProbe />
      </GlobalProviders>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme').textContent).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    // Dynamically toggle OS from Light -> Dark
    act(() => {
      controller.setSystemDark(true)
    })

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
      expect(screen.getByTestId('chart-is-dark').textContent).toBe('true')
      expect(screen.getByTestId('chart-cursor-fill').textContent).toBe('rgba(148, 163, 184, 0.09)')
    })

    // Dynamically toggle OS from Dark -> Light
    act(() => {
      controller.setSystemDark(false)
    })

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(screen.getByTestId('chart-is-dark').textContent).toBe('false')
      expect(screen.getByTestId('chart-cursor-fill').textContent).toBe('rgba(15, 23, 42, 0.045)')
    })
  })

  it('locks to explicit light/dark selection and re-syncs with OS preference when switched back to system', async () => {
    const controller = createMatchMediaController(false)

    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ThemeProbe />
      </ThemeProvider>,
    )

    // Override explicitly to Light
    fireEvent.click(screen.getByText('Set Light'))
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })

    // OS switches to Dark while user explicitly selected Light -> stays Light
    act(() => {
      controller.setSystemDark(true)
    })
    expect(screen.getByTestId('resolved-theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    // User switches back to System -> immediately picks up current OS Dark preference
    fireEvent.click(screen.getByText('Set System'))
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(screen.getByTestId('chart-is-dark').textContent).toBe('true')
    })
  })

  it('switches theme via SelectTheme UI and resolves customizer CSS vars dynamically on OS toggle', async () => {
    const controller = createMatchMediaController(true)

    const { container } = render(
      <GlobalProviders>
        <SelectTheme />
        <FooterStyle />
        <ThemeProbe />
      </GlobalProviders>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark')
    })

    // Click Light button in SelectTheme (first scheme button)
    const schemeButtons = container.querySelectorAll('.grid.grid-cols-3 button')
    expect(schemeButtons.length).toBe(3)
    fireEvent.click(schemeButtons[0]!)

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    // Click System button in SelectTheme (third scheme button) while OS is Dark
    fireEvent.click(schemeButtons[2]!)
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    // Toggle OS to Light -> customizer & probe update to light dynamically
    act(() => {
      controller.setSystemDark(false)
    })
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme').textContent).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })
})
