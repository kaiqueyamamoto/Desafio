import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../helpers/test-utils';
import StatusCounters from '@/components/dashboard/StatusCounters';
import { TaskStatus, Task } from '@/types';

describe('StatusCounters', () => {
  const mockOnFilterChange = jest.fn();

  const createMockTask = (id: number, status: TaskStatus): Task => ({
    id,
    user_id: 1,
    title: `Tarefa ${id}`,
    description: null,
    status,
    created_at: new Date(),
    updated_at: new Date(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar contadores para cada status', () => {
    const tasks: Task[] = [
      createMockTask(1, TaskStatus.PENDING),
      createMockTask(2, TaskStatus.PENDING),
      createMockTask(3, TaskStatus.IN_PROGRESS),
      createMockTask(4, TaskStatus.COMPLETED),
    ];

    render(<StatusCounters tasks={tasks} onFilterChange={mockOnFilterChange} />);

    // Verificar contadores usando getAllByText para números que aparecem múltiplas vezes
    const pendentesText = screen.getByText('Pendentes').closest('div')?.querySelector('.text-2xl');
    const inProgressText = screen.getByText('Em Progresso').closest('div')?.querySelector('.text-2xl');
    const completedText = screen.getByText('Concluídas').closest('div')?.querySelector('.text-2xl');
    
    expect(pendentesText).toHaveTextContent('2');
    expect(inProgressText).toHaveTextContent('1');
    expect(completedText).toHaveTextContent('1');
  });

  it('deve mostrar zero quando não há tarefas', () => {
    render(<StatusCounters tasks={[]} onFilterChange={mockOnFilterChange} />);

    const pendentesText = screen.getByText('Pendentes').closest('div')?.querySelector('.text-2xl');
    const inProgressText = screen.getByText('Em Progresso').closest('div')?.querySelector('.text-2xl');
    const completedText = screen.getByText('Concluídas').closest('div')?.querySelector('.text-2xl');
    
    expect(pendentesText).toHaveTextContent('0');
    expect(inProgressText).toHaveTextContent('0');
    expect(completedText).toHaveTextContent('0');
  });

  it('deve chamar onFilterChange quando botão "Ver todas" é clicado', async () => {
    const user = userEvent.setup();
    const tasks: Task[] = [createMockTask(1, TaskStatus.PENDING)];

    render(<StatusCounters tasks={tasks} onFilterChange={mockOnFilterChange} />);

    const verTodasButton = screen.getAllByText('Ver todas')[0]; // Botão de Pendentes
    await user.click(verTodasButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(TaskStatus.PENDING);
  });

  it('deve calcular contadores corretamente', () => {
    const tasks: Task[] = [
      createMockTask(1, TaskStatus.PENDING),
      createMockTask(2, TaskStatus.PENDING),
      createMockTask(3, TaskStatus.IN_PROGRESS),
      createMockTask(4, TaskStatus.IN_PROGRESS),
      createMockTask(5, TaskStatus.IN_PROGRESS),
      createMockTask(6, TaskStatus.COMPLETED),
    ];

    render(<StatusCounters tasks={tasks} onFilterChange={mockOnFilterChange} />);

    // Verificar que os números corretos aparecem
    const pendentesText = screen.getByText('Pendentes').closest('div')?.querySelector('.text-2xl');
    const inProgressText = screen.getByText('Em Progresso').closest('div')?.querySelector('.text-2xl');
    const completedText = screen.getByText('Concluídas').closest('div')?.querySelector('.text-2xl');
    
    expect(pendentesText).toHaveTextContent('2');
    expect(inProgressText).toHaveTextContent('3');
    expect(completedText).toHaveTextContent('1');
  });

  it('deve renderizar labels corretos', () => {
    const tasks: Task[] = [];
    render(<StatusCounters tasks={tasks} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Em Progresso')).toBeInTheDocument();
    expect(screen.getByText('Concluídas')).toBeInTheDocument();
  });
});
