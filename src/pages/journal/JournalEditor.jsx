import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import EnergyPicker from '../../components/EnergyPicker.jsx';
import Icon from '../../components/Icon.jsx';
import MoodPicker from '../../components/MoodPicker.jsx';
import TagInput from '../../components/TagInput.jsx';
import useJournal from '../../hooks/useJournal.js';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { emptyEntry, toDateKey, wordCount } from '../../lib/journal.js';
import { uid } from '../../lib/id.js';

const isBlank = (f) => !f.title.trim() && !f.body.trim() && !f.mood && !f.energy && f.tags.length === 0;

// Keyed by id so moving between entries (or to "new") starts with fresh form state.
export default function JournalEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  return <Editor key={`${id ?? 'new'}${searchParams.get('mood') ?? ''}`} id={id === 'new' ? undefined : id} />;
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
      <div className="detail-scroll">
        <div className="empty-state">
          <p className="empty-title">Entry not found</p>
          <p>It may have been deleted.</p>
          <Link to="/journal" className="btn btn-secondary">Back to journal</Link>
        </div>
      </div>
    );
  }

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSave = Boolean(form.title.trim() || form.body.trim());
  const dirty = !isNew && JSON.stringify(form) !== JSON.stringify(existing);
  const words = wordCount(form.body);

  function save() {
    if (!canSave) return;
    const now = Date.now();
    const saved = {
      ...form,
      id: form.id ?? uid(),
      title: form.title.trim(),
      body: form.body.trim(),
      createdAt: form.createdAt ?? now,
      updatedAt: now,
    };
    saveEntry(saved);
    if (isNew) {
      setDraft(null);
      navigate(`/journal/${saved.id}`, { replace: true, state: { flash: 'Entry saved' } });
    } else {
      setForm(saved);
      navigate('.', { replace: true, state: { flash: 'Changes saved' } });
    }
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

  function close() {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    navigate('/journal');
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  }

  let status;
  if (isNew) status = isBlank(form) ? 'New entry' : 'Draft saved';
  else if (dirty) status = 'Unsaved changes';
  else status = `Edited ${new Date(form.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;

  return (
    <div className="editor" onKeyDown={handleKeyDown}>
      <div className="editor-toolbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
          <Icon name="back" size={15} />
          <span className="hide-desktop">Journal</span>
          <span className="hide-mobile">Close</span>
        </button>
        <span className={`editor-status${dirty ? ' warn' : ''}`}>{status}</span>
        <div className="editor-actions">
          {isNew ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={discardDraft}>Discard</button>
          ) : (
            <button type="button" className="icon-btn danger" onClick={remove} aria-label="Delete entry" title="Delete entry">
              <Icon name="trash" size={16} />
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!canSave || (!isNew && !dirty)}>
            Save
          </button>
        </div>
      </div>

      <div className="editor-scroll">
        <div className="editor-inner">
          <input
            className="editor-title"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Title"
            autoFocus={isNew}
            aria-label="Title"
          />

          <div className="props">
            <div className="prop">
              <span className="prop-label"><Icon name="calendar" size={15} />Date</span>
              <input
                type="date"
                className="prop-date"
                value={form.date}
                max={toDateKey(new Date())}
                onChange={(e) => e.target.value && update({ date: e.target.value })}
              />
            </div>
            <div className="prop">
              <span className="prop-label"><Icon name="smile" size={15} />Mood</span>
              <MoodPicker value={form.mood} onChange={(mood) => update({ mood })} />
            </div>
            <div className="prop">
              <span className="prop-label"><Icon name="bolt" size={15} />Energy</span>
              <EnergyPicker value={form.energy} onChange={(energy) => update({ energy })} />
            </div>
            <div className="prop">
              <span className="prop-label"><Icon name="tag" size={15} />Tags</span>
              <TagInput tags={form.tags} onChange={(tags) => update({ tags })} suggestions={allTags} />
            </div>
          </div>

          <textarea
            ref={bodyRef}
            className="editor-body"
            value={form.body}
            onChange={(e) => update({ body: e.target.value })}
            placeholder="Start writing…"
            rows={10}
            aria-label="Entry"
          />
        </div>
      </div>

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
  );
}
