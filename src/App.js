import './App.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';

function App() {
  const [numMessage, setNumMessage] = useState(0);
  const [token, setToken] = useState();

  const directLine = useMemo(() => token && createDirectLine({ token }), [token]);
  const increment = useCallback(() => setNumMessage(numMessage => numMessage + 1), [setNumMessage]);
  const shouldHideSendBox = useMemo(() => numMessage >= 5, [numMessage]);

  const store = useMemo(() => {
    const store = createStore({}, () => next => action => {
      console.log(action);

      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        increment();
      }

      return next(action);
    });

    return store;
  }, [increment]);

  const styleOptions = useMemo(() => ({ hideSendBox: shouldHideSendBox }), [shouldHideSendBox]);

  useEffect(() => {
    const abortController = new AbortController();

    (async function () {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });

      if (!res.ok) {
        throw new Error('Failed to fetch token.');
      }

      const { token } = await res.json();

      setToken(token);
    })();

    return () => abortController.abort();
  }, [setToken]);

  return (
    <div className="app">
      {!!directLine && <ReactWebChat directLine={directLine} store={store} styleOptions={styleOptions} />}
      <div className="app__counter">You have {Math.max(0, 5 - numMessage)} messages left.</div>
    </div>
  );
}

export default App;
