import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import EnergyPicker from '../components/EnergyPicker.jsx';
import Icon from '../components/Icon.jsx';
import MoodPicker from '../components/MoodPicker.jsx';
import TagInput from '../components/TagInput.jsx';
import useJournal from '../hooks/useJournal.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { emptyEntry, toDateKey, wordCount } from '../lib/journal.js';

const isBlank = (f) => !f.title.trim() && !f.body.trim() && !f.mood && !f.energy && f.tags.length === 0;

// Keyed by id so moving between entries (or to "new") starts with fresh form state.
export default function JournalEditor() {
  const { id } = useParams();
  return <Editor key={id ?? 'new'} id={id} />;
}

function Editor({ id }) {
  const isNew = !id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { entries, getEntry, saveEntry, deleteEntry } = useJournal();
  const [draft, setDraft] = useLocalStorage('journal-draft', null);
  const existing = isNew ? null : getEntry(id);

  const [form, setForm] = useState(() => {
    if (!isNew) return existing;
    const base = draft ?? emptyEntry();
    const mood = Number(searchParams.get('mood'));
    return mood >= 1 && mood <= 5 ? { ...base, mood } : base;
  });

  const bodyRef = useRef(null);
  const allTags = useMemo(() => [...new Set(entries.flatMap((e) => e.tags))].sort(), [entries]);

  // New entries autosave as a draft so nothing is lost on navigation or refresh.
  useEffect(() => {
    if (isNew) setDraft(isBlank(form) ? null : form);
  }, [isNew, form, setDraft]);

  // Grow the textarea with its content instead of scrolling inside it.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [form?.body]);

  if (!form) {
    return (
      <section className="page">
        <div className="empty-state">
          <p className="empty-title">Entry not found</p>
          <p>It may have been deleted.</p>
          <Link to="/journal" className="btn btn-ghost">Back to journal</Link>
        </div>
      </section>
    );
  }

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSave = Boolean(form.title.trim() || form.body.trim());
  const dirty = !isNew && JSON.stringify(form) !== JSON.stringify(existing);
  const words = wordCount(form.body);

  function save() {
    if (!canSave) return;
    const now = Date.now();
    saveEntry({
      ...form,
      id: form.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      body: form.body.trim(),
      createdAt: form.createdAt ?? now,
      updatedAt: now,
    });
    if (isNew) setDraft(null);
    navigate('/journal', { state: { flash: isNew ? 'Entry saved' : 'Changes saved' } });
  }

  function remove() {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    deleteEntry(id);
    navigate('/journal', { state: { flash: 'Entry deleted' } });
  }

  function discardDraft() {
    if (!isBlank(form) && !window.confirm('Discard this draft?')) return;
    setDraft(null);
    navigate('/journal');
  }

  function back() {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    navigate('/journal', isNew && !isBlank(form) ? { state: { flash: 'Draft kept' } } : undefined);
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  }

  let status = '';
  if (isNew) status = isBlank(form) ? 'New entry' : 'Draft saved';
  else status = dirty ? 'Unsaved changes' : 'Saved';

  return (
    <section className="page editor" onKeyDown={handleKeyDown}>
      <div className="editor-bar">
        <button type="button" className="btn btn-ghost" onClick={back}>
          <Icon name="back" size={16} />
          Journal
        </button>
        <span className={`editor-status${dirty ? ' warn' : ''}`}>{status}</span>
        <div className="editor-actions">
          {isNew ? (
            <button type="button" className="btn btn-ghost" onClick={discardDraft}>Discard</button>
          ) : (
            <button type="button" className="btn btn-ghost btn-danger" onClick={remove} aria-label="Delete entry">
              <Icon name="trash" size={16} />
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={save} disabled={!canSave}>
            {isNew ? 'Save entry' : 'Save'}
          </button>
        </div>
      </div>

      <div className="editor-paper card">
        <input
          type="date"
          className="editor-date"
          value={form.date}
          max={toDateKey(new Date())}
          onChange={(e) => e.target.value && update({ date: e.target.value })}
        />
        <input
          className="editor-title"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Give today a title"
          autoFocus={isNew}
        />

        <div className="editor-fields">
          <div className="field">
            <span className="field-label">Mood</span>
            <MoodPicker value={form.mood} onChange={(mood) => update({ mood })} />
          </div>
          <div className="field-row">
            <div className="field">
              <span className="field-label">Energy</span>
              <EnergyPicker value={form.energy} onChange={(energy) => update({ energy })} />
            </div>
            <div className="field field-grow">
              <span className="field-label">Tags</span>
              <TagInput tags={form.tags} onChange={(tags) => update({ tags })} suggestions={allTags} />
            </div>
          </div>
        </div>

        <textarea
          ref={bodyRef}
          className="editor-body"
          value={form.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="What happened today? What's on your mind?"
          rows={8}
        />

        <div className="editor-foot">
          <span>
            {words} {words === 1 ? 'word' : 'words'}
            {words > 0 && ` · ${Math.max(1, Math.round(words / 200))} min read`}
          </span>
          <span className="kbd-hint">
            <kbd>⌘</kbd> <kbd>Enter</kbd> to save
          </span>
        </div>
      </div>
    </section>
  );
}
