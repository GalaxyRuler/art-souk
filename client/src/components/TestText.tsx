export function TestText() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white' }}>
      <h3 style={{ color: 'black' }}>Test 1: Basic Black</h3>
      <h3 style={{ color: '#000000' }}>Test 2: Hex Black</h3>
      <h3 style={{ color: 'rgb(0,0,0)' }}>Test 3: RGB Black</h3>
      <h3 style={{ color: 'black !important' }}>Test 4: Black Important</h3>
      <h3 className="text-black">Test 5: Tailwind Black</h3>
      <h3>Test 6: No style</h3>
    </div>
  );
}