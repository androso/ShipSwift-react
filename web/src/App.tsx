import { useState } from 'react'
import { SWGradientDivider, SWStepper, SWShimmer } from './components'
import './App.css'

function App() {
  const [quantity, setQuantity] = useState(1)

  return (
    <main className="app">
      <header className="app__header">
        <h1>ShipSwift</h1>
        <p className="app__subtitle">
          React + TypeScript port &mdash; component library migration in progress
        </p>
      </header>

      <SWGradientDivider color="var(--accent)" opacity={0.7} height={2} />

      <section className="showcase">
        <article className="card">
          <h2>SWStepper</h2>
          <p>Compact numeric stepper; decrement is disabled at the minimum.</p>
          <div className="card__demo">
            <div className="row">
              <span>Quantity</span>
              <SWStepper value={quantity} onChange={setQuantity} />
            </div>
          </div>
        </article>

        <article className="card">
          <h2>SWGradientDivider</h2>
          <p>Center-fade gradient rule (clear → color → clear).</p>
          <div className="card__demo card__demo--stack">
            <SWGradientDivider />
            <SWGradientDivider color="mediumpurple" opacity={0.6} />
            <SWGradientDivider color="mediumaquamarine" height={2} />
          </div>
        </article>

        <article className="card">
          <h2>SWShimmer</h2>
          <p>Sweeps a light band across its content on a loop.</p>
          <div className="card__demo">
            <SWShimmer>
              <button type="button" className="cta">
                Upgrade Now
              </button>
            </SWShimmer>
            <SWShimmer>
              <div className="skeleton" />
            </SWShimmer>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
