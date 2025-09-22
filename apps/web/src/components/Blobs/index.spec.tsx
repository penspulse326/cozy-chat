import { render, screen } from '@/tests';
import { describe, expect, it } from 'vitest';
import Blobs from './index';

describe('Blobs', () => {
  it('應該渲染一個包含 8 個子元素的容器', () => {
    render(<Blobs />);

    const container = screen.getByTestId('blobs-container');
    expect(container).toBeInTheDocument();
    expect(container.children.length).toBe(8);
  });
});
