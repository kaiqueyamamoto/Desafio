import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../helpers/test-utils';
import TaskForm from '@/components/dashboard/TaskForm';
import { useCreateTask } from '@/lib/hooks/use-tasks';

// Mock dos hooks
jest.mock('@/lib/hooks/use-tasks');

const mockUseCreateTask = useCreateTask as jest.MockedFunction<typeof useCreateTask>;

describe('TaskForm', () => {
  const mockOnTitleChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateTask.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      status: 'idle',
    } as any);
  });

  it('deve renderizar o formulário de criação de tarefa', () => {
    render(
      <TaskForm
        title=""
        description=""
        onTitleChange={mockOnTitleChange}
        onDescriptionChange={mockOnDescriptionChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite o título da tarefa/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite a descrição da tarefa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar tarefa/i })).toBeInTheDocument();
  });

  it('deve atualizar título quando digitado', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        title=""
        description=""
        onTitleChange={mockOnTitleChange}
        onDescriptionChange={mockOnDescriptionChange}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = screen.getByPlaceholderText(/digite o título da tarefa/i);
    await user.type(titleInput, 'Nova Tarefa');

    // Verificar que a função foi chamada (pode ser chamada múltiplas vezes durante a digitação)
    expect(mockOnTitleChange).toHaveBeenCalled();
    // Verificar que foi chamada com o valor final
    expect(mockOnTitleChange).toHaveBeenLastCalledWith('Nova Tarefa');
  });

  it('deve atualizar descrição quando digitado', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        title=""
        description=""
        onTitleChange={mockOnTitleChange}
        onDescriptionChange={mockOnDescriptionChange}
        onSubmit={mockOnSubmit}
      />
    );

    const descriptionInput = screen.getByPlaceholderText(/digite a descrição da tarefa/i);
    await user.type(descriptionInput, 'Descrição da tarefa');

    expect(mockOnDescriptionChange).toHaveBeenCalled();
  });

  it('deve chamar onSubmit quando formulário é enviado', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        title="Nova Tarefa"
        description="Descrição"
        onTitleChange={mockOnTitleChange}
        onDescriptionChange={mockOnDescriptionChange}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /criar tarefa/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('deve desabilitar botão durante o loading', () => {
    mockUseCreateTask.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      status: 'pending',
    } as any);

    render(
      <TaskForm
        title=""
        description=""
        onTitleChange={mockOnTitleChange}
        onDescriptionChange={mockOnDescriptionChange}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /criando/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Criando...')).toBeInTheDocument();
  });

  it('deve mostrar valores iniciais nos campos', () => {
    render(
      <TaskForm
        title="Tarefa Inicial"
        description="Descrição Inicial"
        onTitleChange={mockOnTitleChange}
        onDescriptionChange={mockOnDescriptionChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByDisplayValue('Tarefa Inicial')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descrição Inicial')).toBeInTheDocument();
  });
});
