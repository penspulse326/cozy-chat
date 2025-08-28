import { render, screen } from '@/tests';
import { describe, expect, it } from 'vitest';
import Blobs from './index';

describe('Blobs', () => {
  // 這個元件的子元件 Blob 內部有複雜的 useEffect 和 ref 操作，
  // 直接測試渲染結果比 mock 更可靠。

  it('應該渲染一個包含 8 個子元素的容器', () => {
    render(<Blobs />);

    const container = screen.getByTestId('blobs-container');
    expect(container).toBeInTheDocument();

    // BLOB_COUNT 在元件中被定義為 8
    // 每個 Blob 子元件渲染一個 <div>
    // 一個更簡單的方法是直接檢查 children.length
    expect(container.children.length).toBe(8);
  });
});