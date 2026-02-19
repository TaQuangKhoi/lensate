import { useState } from 'react';

type Tab = 'recipes' | 'provider' | 'cache' | 'about';

function App() {
  const [tab, setTab] = useState<Tab>('recipes');

  return (
    <main className="options">
      <h1>Lensate Options</h1>
      <p>Manage recipes, AI provider settings, and local translation cache.</p>

      <div className="tabs">
        <button onClick={() => setTab('recipes')}>Recipes</button>
        <button onClick={() => setTab('provider')}>AI Provider</button>
        <button onClick={() => setTab('cache')}>Cache</button>
        <button onClick={() => setTab('about')}>About</button>
      </div>

      <section className="panel">
        {tab === 'recipes' && <p>Use popup import to add recipe JSON and share community presets.</p>}
        {tab === 'provider' && <p>Configure provider/model and encrypted API key from popup controls.</p>}
        {tab === 'cache' && <p>Cache is stored in browser.storage.local and auto-evicted by LRU.</p>}
        {tab === 'about' && <p>Lensate is a generic DOM translation tool with user-configurable rules.</p>}
      </section>
    </main>
  );
}

export default App;
