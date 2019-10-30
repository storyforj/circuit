import { render, h } from 'preact';
import { Provider } from 'redux-zero/preact';

import { store } from './data/store';

render((
  <Provider store={store as any}>{(
    <div>
      <h1>Circuit</h1>
      <p>A generic node and wire design tool that exports code.</p>
    </div>
  ) as any}</Provider>
), document.getElementById('app') as HTMLElement);
