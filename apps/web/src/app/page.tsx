import { TestLibComponent } from './test-lib';
import { Button } from '@mantine/core';

export default function Home() {
  return (
    <div>
      <TestLibComponent />
      <Button>Click me</Button>
    </div>
  );
}
