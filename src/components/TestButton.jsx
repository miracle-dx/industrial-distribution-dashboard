import { useState } from 'react';

// 最简单的按钮组件：点击切换文字
export default function TestButton() {
  const [text, setText] = useState('未点击');

  return (
    <div>
      <button onClick={() => setText('已点击')}>
        点击我
      </button>
      <p data-testid="status-text">{text}</p>
    </div>
  );
}