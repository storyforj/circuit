import { render, h } from 'preact';

const app = (
  <div>
    <h1>Circuit</h1>
    <p>A generic node and wire design tool that exports code.</p>
  </div>
);
render(app, document.getElementById('app') as HTMLElement);
