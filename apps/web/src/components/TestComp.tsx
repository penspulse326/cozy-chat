import { Button } from '@mantine/core';

export function TestComp() {
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <Button>primary</Button>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
      >
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <Button key={index} color={`moss-green.${index}`}>
              moss-green.{index}
            </Button>
          ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
      >
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <Button key={index} color={`deep-teal.${index}`}>
              deep-teal.{index}
            </Button>
          ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
      >
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <Button key={index} color={`navy-steel.${index}`}>
              navy-steel.{index}
            </Button>
          ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
      >
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <Button key={index} color={`soft-lime.${index}`}>
              soft-lime.{index}
            </Button>
          ))}
      </div>
    </div>
  );
}
