import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestButton from './TestButton';

// 1. 基础渲染测试（覆盖边界场景）
describe('TestButton 组件', () => {
  test('初始渲染：按钮和默认文本存在', () => {
    render(<TestButton />);
    // 高级写法：正则匹配（兼容文本细微变化）
    expect(screen.getByText(/点击我/i)).toBeInTheDocument();
    // 优先用testid（生产环境推荐，避免文字变更导致测试失败）
    expect(screen.getByTestId('status-text')).toHaveTextContent('未点击');
  });

  // 2. 交互测试（模拟真实用户操作）
  test('点击按钮：文本切换为“已点击”', async () => {
    render(<TestButton />);
    const btn = screen.getByRole('button', { name: /点击我/i }); // 按角色查找（更符合无障碍）
    
    fireEvent.click(btn);
    // 异步校验（兼容 setState 延迟）
    await waitFor(() => {
      expect(screen.getByTestId('status-text')).toHaveTextContent('已点击');
    });
  });
});