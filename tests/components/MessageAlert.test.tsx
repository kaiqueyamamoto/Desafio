import { screen } from '@testing-library/react';
import { render } from '../helpers/test-utils';
import MessageAlert from '@/components/dashboard/MessageAlert';

describe('MessageAlert', () => {
  it('não deve renderizar quando message é null', () => {
    const { container } = render(<MessageAlert message={null} type="success" />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar mensagem de sucesso', () => {
    render(<MessageAlert message="Operação realizada com sucesso!" type="success" />);
    
    const alert = screen.getByText('Operação realizada com sucesso!');
    expect(alert).toBeInTheDocument();
    expect(alert.closest('div')).toHaveClass('bg-green-50');
  });

  it('deve renderizar mensagem de erro', () => {
    render(<MessageAlert message="Erro ao processar requisição" type="error" />);
    
    const alert = screen.getByText('Erro ao processar requisição');
    expect(alert).toBeInTheDocument();
    expect(alert.closest('div')).toHaveClass('bg-red-50');
  });

  it('deve aplicar classes corretas para tipo success', () => {
    const { container } = render(
      <MessageAlert message="Sucesso!" type="success" />
    );
    
    const alertDiv = container.firstChild as HTMLElement;
    expect(alertDiv).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('deve aplicar classes corretas para tipo error', () => {
    const { container } = render(
      <MessageAlert message="Erro!" type="error" />
    );
    
    const alertDiv = container.firstChild as HTMLElement;
    expect(alertDiv).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });
});
