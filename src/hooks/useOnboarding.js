import { useEffect } from 'react';
import useJournal from './useJournal.js';
import useLocalStorage from './useLocalStorage.js';
import useTodos from './useTodos.js';

// 'welcome' is null until the user has been through (or skipped) the welcome tour,
// then 'done'; 'open' replays it. People who already have data never see it.
export default function useOnboarding() {
  const [welcome, setWelcome] = useLocalStorage('welcome', null);
  const { entries } = useJournal();
  const { tasks } = useTodos();
  const hasData = entries.length > 0 || tasks.length > 0;

  useEffect(() => {
    if (welcome === null && hasData) setWelcome('done');
  }, [welcome, hasData, setWelcome]);

  return {
    showWelcome: welcome === 'open' || (welcome === null && !hasData),
    finish: () => setWelcome('done'),
    replay: () => setWelcome('open'),
  };
}
