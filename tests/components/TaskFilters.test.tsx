import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../helpers/test-utils';
import TaskFilters from '@/components/dashboard/TaskFilters';
import { TaskStatus } from '@/types';

describe('TaskFilters', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todos os filtros', () => {
    render(
      <TaskFilters statusFilter="all" onFilterChange={mockOnFilterChange} />
    );

    expect(screen.getByRole('button', { name: /todas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pendentes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /em progresso/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /concluídas/i })).toBeInTheDocument();
  });

  it('deve destacar filtro ativo', () => {
    render(
      <TaskFilters statusFilter={TaskStatus.PENDING} onFilterChange={mockOnFilterChange} />
    );

    const pendingButton = screen.getByRole('button', { name: /pendentes/i });
    expect(pendingButton).toHaveClass('bg-indigo-600');
  });

  it('deve chamar onFilterChange quando filtro é clicado', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilters statusFilter="all" onFilterChange={mockOnFilterChange} />
    );

    const pendingButton = screen.getByRole('button', { name: /pendentes/i });
    await user.click(pendingButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(TaskStatus.PENDING);
  });

  it('deve aplicar estilo correto para filtro "all" ativo', () => {
    render(
      <TaskFilters statusFilter="all" onFilterChange={mockOnFilterChange} />
    );

    const allButton = screen.getByRole('button', { name: /todas/i });
    expect(allButton).toHaveClass('bg-indigo-600');
  });

  it('deve aplicar estilo correto para filtros inativos', () => {
    render(
      <TaskFilters statusFilter={TaskStatus.PENDING} onFilterChange={mockOnFilterChange} />
    );

    const inProgressButton = screen.getByRole('button', { name: /em progresso/i });
    expect(inProgressButton).toHaveClass('bg-gray-100');
    expect(inProgressButton).not.toHaveClass('bg-indigo-600');
  });
});
