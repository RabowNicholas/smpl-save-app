import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressTracker } from '@/ui/components/ProgressTracker'
import { CategoryProgress, OverallProgress } from '@/core/types'

const mockCategoryProgress: CategoryProgress[] = [
  {
    categoryId: 'streaming',
    status: 'completed',
    selectedServices: [
      { id: 'netflix', name: 'Netflix', logoUrl: '', categoryId: 'streaming', isFeatured: true },
      { id: 'hulu', name: 'Hulu', logoUrl: '', categoryId: 'streaming', isFeatured: false },
    ],
    totalServices: 2,
  },
  {
    categoryId: 'groceries',
    status: 'in-progress',
    selectedServices: [
      { id: 'walmart', name: 'Walmart', logoUrl: '', categoryId: 'groceries', isFeatured: true },
    ],
    totalServices: 3,
  },
  {
    categoryId: 'internet',
    status: 'incomplete',
    selectedServices: [],
    totalServices: 4,
  },
]

const mockOverallProgress: OverallProgress = {
  completionPercentage: 33.33,
  categoriesCompleted: 1,
  totalCategories: 3,
  servicesSelected: 3,
  totalServices: 9,
}

const mockCategories = [
  { id: 'streaming', name: 'Streaming & Entertainment', icon: '🎬', displayOrder: 1 },
  { id: 'groceries', name: 'Groceries', icon: '🛒', displayOrder: 2 },
  { id: 'internet', name: 'Internet / Phone', icon: '📡', displayOrder: 3 },
]

describe('ProgressTracker', () => {
  const mockOnCategoryClick = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Overall Progress Display', () => {
    it('should display overall completion percentage', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      expect(screen.getByText('33%')).toBeInTheDocument()
      // Check for the specific "Complete" text in the progress circle
      const progressCircle = screen.getByTestId('progress-circle')
      expect(progressCircle).toBeInTheDocument()
      expect(screen.getAllByText('Complete')).toHaveLength(2) // One in circle, one in category
    })

    it('should display progress statistics', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      expect(screen.getByText('1 of 3 categories completed')).toBeInTheDocument()
      expect(screen.getByText('3 of 9 services selected')).toBeInTheDocument()
    })

    it('should display circular progress indicator', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const progressCircle = screen.getByTestId('progress-circle')
      expect(progressCircle).toBeInTheDocument()
      expect(progressCircle).toHaveAttribute('data-progress', '33.33')
    })
  })

  describe('Category Progress Display', () => {
    it('should render all categories with correct status', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      expect(screen.getByTestId('category-streaming')).toBeInTheDocument()
      expect(screen.getByTestId('category-groceries')).toBeInTheDocument()
      expect(screen.getByTestId('category-internet')).toBeInTheDocument()
    })

    it('should show completed status with checkmark', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const streamingCategory = screen.getByTestId('category-streaming')
      expect(streamingCategory).toHaveClass('completed')
      expect(screen.getByTestId('check-icon-streaming')).toBeInTheDocument()
    })

    it('should show in-progress status with partial progress', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const groceriesCategory = screen.getByTestId('category-groceries')
      expect(groceriesCategory).toHaveClass('in-progress')
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('should show incomplete status', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const internetCategory = screen.getByTestId('category-internet')
      expect(internetCategory).toHaveClass('incomplete')
      expect(screen.getByText('0 of 4')).toBeInTheDocument()
    })

    it('should display category icons and names', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      expect(screen.getByText('🎬')).toBeInTheDocument()
      expect(screen.getByText('Streaming & Entertainment')).toBeInTheDocument()
      expect(screen.getByText('🛒')).toBeInTheDocument()
      expect(screen.getByText('Groceries')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onCategoryClick when category is clicked', async () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const groceriesCategory = screen.getByTestId('category-groceries')
      await user.click(groceriesCategory)

      expect(mockOnCategoryClick).toHaveBeenCalledWith('groceries')
    })

    it('should support keyboard navigation', async () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const internetCategory = screen.getByTestId('category-internet')
      internetCategory.focus()
      await user.keyboard('{Enter}')

      expect(mockOnCategoryClick).toHaveBeenCalledWith('internet')
    })

    it('should not call onCategoryClick for completed categories when disabled', async () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
          disableCompletedCategories={true}
        />
      )

      const streamingCategory = screen.getByTestId('category-streaming')
      await user.click(streamingCategory)

      expect(mockOnCategoryClick).not.toHaveBeenCalled()
    })
  })

  describe('Visual States', () => {
    it('should show loading state', () => {
      render(
        <ProgressTracker
          categoryProgress={[]}
          overallProgress={{
            completionPercentage: 0,
            categoriesCompleted: 0,
            totalCategories: 0,
            servicesSelected: 0,
            totalServices: 0,
          }}
          categories={[]}
          onCategoryClick={mockOnCategoryClick}
          loading={true}
        />
      )

      expect(screen.getByText('Loading progress...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show empty state when no categories', () => {
      render(
        <ProgressTracker
          categoryProgress={[]}
          overallProgress={{
            completionPercentage: 100,
            categoriesCompleted: 0,
            totalCategories: 0,
            servicesSelected: 0,
            totalServices: 0,
          }}
          categories={[]}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      expect(screen.getByText('No categories available')).toBeInTheDocument()
    })

    it('should show celebration when 100% complete', () => {
      const completeProgress = {
        ...mockOverallProgress,
        completionPercentage: 100,
        categoriesCompleted: 3,
      }

      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={completeProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      expect(screen.getByText('🎉')).toBeInTheDocument()
      expect(screen.getByText('All done!')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render compact view when specified', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
          compact={true}
        />
      )

      const container = screen.getByTestId('progress-tracker')
      expect(container).toHaveClass('compact')
    })

    it('should hide stats in compact mode', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
          compact={true}
        />
      )

      expect(screen.queryByText('1 of 3 categories completed')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '33.33')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')

      const categoryList = screen.getByRole('list')
      expect(categoryList).toHaveAttribute('aria-label', 'Category progress')
    })

    it('should have descriptive labels for categories', () => {
      render(
        <ProgressTracker
          categoryProgress={mockCategoryProgress}
          overallProgress={mockOverallProgress}
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
          loading={false}
        />
      )

      const streamingCategory = screen.getByTestId('category-streaming')
      expect(streamingCategory).toHaveAttribute('aria-label', 'Streaming & Entertainment: completed, 2 of 2 services selected')
    })
  })
})