import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceSelector } from '@/ui/components/ServiceSelector'
import { Service } from '@/core/types'

// Mock services data
const mockServices: Service[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logoUrl: 'https://example.com/netflix.png',
    categoryId: 'streaming',
    isFeatured: true,
  },
  {
    id: 'hulu',
    name: 'Hulu',
    logoUrl: 'https://example.com/hulu.png',
    categoryId: 'streaming',
    isFeatured: false,
  },
  {
    id: 'disney',
    name: 'Disney+',
    logoUrl: 'https://example.com/disney.png',
    categoryId: 'streaming',
    isFeatured: true,
  },
]

const mockSelectedServices = ['netflix']

describe('ServiceSelector', () => {
  const mockOnServiceToggle = vi.fn()
  const mockOnSearch = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render service cards', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={mockSelectedServices}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.getByText('Hulu')).toBeInTheDocument()
      expect(screen.getByText('Disney+')).toBeInTheDocument()
    })

    it('should show featured services first', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const serviceCards = screen.getAllByTestId(/service-card-/)
      // Featured services first, then alphabetical: Disney+, Netflix (both featured), then Hulu
      expect(serviceCards[0]).toHaveTextContent('Disney+') // featured, alphabetically first
      expect(serviceCards[1]).toHaveTextContent('Netflix') // featured, alphabetically second  
      expect(serviceCards[2]).toHaveTextContent('Hulu') // not featured
    })

    it('should display service logos', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const netflixLogo = screen.getByAltText('Netflix logo')
      expect(netflixLogo).toHaveAttribute('src', 'https://example.com/netflix.png')
    })

    it('should show loading state', () => {
      render(
        <ServiceSelector
          services={[]}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={true}
        />
      )

      expect(screen.getByText('Loading services...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show empty state when no services', () => {
      render(
        <ServiceSelector
          services={[]}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      expect(screen.getByText('No services available')).toBeInTheDocument()
    })
  })

  describe('Service Selection', () => {
    it('should show selected state for selected services', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={mockSelectedServices}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const netflixCard = screen.getByTestId('service-card-netflix')
      expect(netflixCard).toHaveClass('selected')
      expect(screen.getByTestId('check-icon-netflix')).toBeInTheDocument()
    })

    it('should call onServiceToggle when service is clicked', async () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const huluCard = screen.getByTestId('service-card-hulu')
      await user.click(huluCard)

      expect(mockOnServiceToggle).toHaveBeenCalledWith('hulu', true)
    })

    it('should handle deselection when already selected service is clicked', async () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={mockSelectedServices}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const netflixCard = screen.getByTestId('service-card-netflix')
      await user.click(netflixCard)

      expect(mockOnServiceToggle).toHaveBeenCalledWith('netflix', false)
    })

    it('should support keyboard navigation', async () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const netflixCard = screen.getByTestId('service-card-netflix')
      await user.click(netflixCard) // Focus the element
      
      await user.keyboard('{Enter}')
      expect(mockOnServiceToggle).toHaveBeenCalledWith('netflix', true)

      vi.clearAllMocks()
      netflixCard.focus()
      await user.keyboard(' ') // Use space character instead of {Space}
      expect(mockOnServiceToggle).toHaveBeenCalledWith('netflix', true)
    })
  })

  describe('Search Functionality', () => {
    it('should render search input when onSearch is provided', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          onSearch={mockOnSearch}
          loading={false}
        />
      )

      expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument()
    })

    it('should call onSearch when typing in search input', async () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          onSearch={mockOnSearch}
          loading={false}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search services...')
      
      // Type in the input using fireEvent to simulate real user typing
      fireEvent.change(searchInput, { target: { value: 'Net' } })
      
      expect(mockOnSearch).toHaveBeenCalledWith('Net')
    })

    it('should filter services based on search term', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          onSearch={mockOnSearch}
          searchTerm="Net"
          loading={false}
        />
      )

      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.queryByText('Hulu')).not.toBeInTheDocument()
      expect(screen.queryByText('Disney+')).not.toBeInTheDocument()
    })

    it('should show "no results" message when search returns no matches', () => {
      render(
        <ServiceSelector
          services={[]}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          onSearch={mockOnSearch}
          searchTerm="NonExistent"
          loading={false}
        />
      )

      expect(screen.getByText('No services found for "NonExistent"')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={mockSelectedServices}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const serviceList = screen.getByRole('grid')
      expect(serviceList).toHaveAttribute('aria-label', 'Service selection')

      const netflixCard = screen.getByTestId('service-card-netflix')
      expect(netflixCard).toHaveAttribute('role', 'gridcell')
      expect(netflixCard).toHaveAttribute('aria-selected', 'true')
      expect(netflixCard).toHaveAttribute('tabIndex', '0')
    })

    it('should announce selection changes to screen readers', () => {
      render(
        <ServiceSelector
          services={mockServices}
          selectedServices={mockSelectedServices}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      const announcement = screen.getByTestId('sr-announcement')
      expect(announcement).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing service logo gracefully', () => {
      const servicesWithMissingLogo = [
        {
          ...mockServices[0],
          logoUrl: '',
        },
      ]

      render(
        <ServiceSelector
          services={servicesWithMissingLogo}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
        />
      )

      expect(screen.getByTestId('service-card-netflix')).toBeInTheDocument()
      expect(screen.getByTestId('fallback-logo-netflix')).toBeInTheDocument()
    })

    it('should handle error state', () => {
      const mockOnRetry = vi.fn()
      render(
        <ServiceSelector
          services={[]}
          selectedServices={[]}
          onServiceToggle={mockOnServiceToggle}
          loading={false}
          error="Failed to load services"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Failed to load services')).toBeInTheDocument()
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })
  })
})