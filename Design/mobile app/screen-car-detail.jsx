// Car detail screen

function CarDetailScreen({ car, onBack, onUpdateCar, onCloseVisit, onOpenReceipt, onShowToast }) {
  const t = window.__T;
  const [statusSheetOpen, setStatusSheetOpen] = React.useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);
  const [photoTab, setPhotoTab] = React.useState('avant');
  const [photoViewer, setPhotoViewer] = React.useState(null);
  const [editingTaskId, setEditingTaskId] = React.useState(null);
  const [newTaskOpen, setNewTaskOpen] = React.useState(false);
  const [newTaskText, setNewTaskText] = React.useState('');
  const [newLineOpen, setNewLineOpen] = React.useState(false);
  const [newLine, setNewLine] = React.useState({ desc: '', qty: 1, unit: 0 });

  const taskTotal = car.tasks.reduce((s, t) => s + (t.price || 0), 0);
  const lineTotal = car.lineItems.reduce((s, l) => s + l.qty * l.unit, 0);
  const grandTotal = taskTotal + lineTotal;
  const tasksDone = car.tasks.filter(t => t.done).length;

  const updateTask = (id, patch) => {
    onUpdateCar({ ...car, tasks: car.tasks.map(t => t.id === id ? { ...t, ...patch } : t) });
  };
  const deleteTask = (id) => {
    onUpdateCar({ ...car, tasks: car.tasks.filter(t => t.id !== id) });
    setEditingTaskId(null);
  };
  const addTask = () => {
    if (!newTaskText.trim()) { setNewTaskOpen(false); return; }
    const newTask = { id: 't' + Date.now(), text: newTaskText, done: false, price: null };
    onUpdateCar({ ...car, tasks: [...car.tasks, newTask] });
    setNewTaskText(''); setNewTaskOpen(false);
    onShowToast('Tâche ajoutée');
  };
  const updateLine = (id, patch) => {
    onUpdateCar({ ...car, lineItems: car.lineItems.map(l => l.id === id ? { ...l, ...patch } : l) });
  };
  const deleteLine = (id) => {
    onUpdateCar({ ...car, lineItems: car.lineItems.filter(l => l.id !== id) });
  };
  const addLine = () => {
    if (!newLine.desc.trim()) { setNewLineOpen(false); return; }
    const newL = { id: 'l' + Date.now(), ...newLine, qty: Number(newLine.qty) || 1, unit: Number(newLine.unit) || 0 };
    onUpdateCar({ ...car, lineItems: [...car.lineItems, newL] });
    setNewLine({ desc: '', qty: 1, unit: 0 }); setNewLineOpen(false);
    onShowToast('Ligne ajoutée');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.bg, position: 'relative' }}>
      {/* Sticky header */}
      <div style={{
        padding: '8px 8px 14px', borderBottom: `1px solid ${t.borderSoft}`,
        background: t.bg, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{
            width: 44, height: 44, border: 0, background: 'transparent', color: t.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <IconArrowLeft size={24} />
          </button>
          <button style={{
            width: 44, height: 44, border: 0, background: 'transparent', color: t.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <IconMore size={22} />
          </button>
        </div>
        <div style={{ padding: '0 16px' }}>
          <Plate value={car.plate} size="xl" />
          <div style={{ fontSize: 14, color: t.fgMuted, marginTop: 12 }} dir="auto">
            {car.make} · {car.model} · {car.color} · {car.year}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 10,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: t.accentSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent,
            }}>
              <IconPhone size={14} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 14.5, fontWeight: 500 }} dir="auto">{car.customer.name}</span>
            <span style={{ fontSize: 13, color: t.fgMuted }}>· {car.customer.phone}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 200 }}>
        {/* Status row */}
        <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: t.fgMuted, fontWeight: 500 }}>Statut</span>
          <button onClick={() => setStatusSheetOpen(true)} style={{
            background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {car.status ? (
              <StatusChip status={car.status} size="md" />
            ) : (
              <span style={{
                fontSize: 13, padding: '5px 12px', border: `1px dashed ${t.border}`,
                borderRadius: 999, color: t.fgMuted,
              }}>Aucun</span>
            )}
            <IconChevronDown size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Résumé */}
        <Section label="Résumé">
          <textarea
            defaultValue={car.summary}
            onBlur={(e) => onUpdateCar({ ...car, summary: e.target.value })}
            placeholder="Décrivez ce qu'il faut faire ou ce qui a été fait…"
            dir="auto"
            style={{
              width: '100%', minHeight: 80, padding: '12px 14px',
              border: `1px solid ${t.border}`, borderRadius: 12,
              background: t.surface, color: t.fg, fontFamily: 'inherit',
              fontSize: 14.5, lineHeight: 1.5, resize: 'none', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </Section>

        {/* Tâches */}
        <Section label={`Tâches (${tasksDone}/${car.tasks.length})`}>
          <div style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
            {car.tasks.map((task, i) => (
              <TaskRow key={task.id} task={task}
                       isLast={i === car.tasks.length - 1 && !newTaskOpen}
                       onToggle={() => updateTask(task.id, { done: !task.done })}
                       onClick={() => setEditingTaskId(task.id)} />
            ))}
            {newTaskOpen ? (
              <div style={{ padding: '12px 14px', display: 'flex', gap: 8, borderTop: car.tasks.length ? `1px solid ${t.borderSoft}` : 0 }}>
                <input
                  autoFocus value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') { setNewTaskOpen(false); setNewTaskText(''); } }}
                  onBlur={addTask}
                  placeholder="Nouvelle tâche…"
                  style={{
                    flex: 1, border: 0, outline: 'none', background: 'transparent',
                    fontFamily: 'inherit', fontSize: 14.5, color: t.fg,
                  }}
                />
              </div>
            ) : (
              <button onClick={() => setNewTaskOpen(true)} style={{
                width: '100%', padding: '12px 14px', textAlign: 'left',
                border: 0, borderTop: car.tasks.length ? `1px solid ${t.borderSoft}` : 0,
                background: 'transparent', color: t.accent,
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <IconPlus size={16} strokeWidth={2} />
                Ajouter une tâche
              </button>
            )}
          </div>
        </Section>

        {/* Photos */}
        <Section label="Photos">
          <div style={{ display: 'flex', gap: 24, padding: '0 0 12px', borderBottom: `1px solid ${t.borderSoft}` }}>
            {['avant', 'apres'].map((tab) => (
              <button key={tab} onClick={() => setPhotoTab(tab)} style={{
                background: 'transparent', border: 0, padding: '0 0 10px',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                color: photoTab === tab ? t.fg : t.fgMuted, cursor: 'pointer',
                borderBottom: `2px solid ${photoTab === tab ? t.accent : 'transparent'}`,
                marginBottom: -1,
              }}>
                {tab === 'avant' ? 'Avant' : 'Après'}
              </button>
            ))}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14,
          }}>
            {[0, 1, 2].map(i => (
              <PhotoTile key={i} index={i} tab={photoTab} onClick={() => setPhotoViewer(i)} hasPhoto={i < (photoTab === 'avant' ? 2 : 1)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button style={{
              flex: 1, padding: '11px 14px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, borderRadius: 10,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.fg, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
            }}>
              <IconCamera size={18} strokeWidth={1.7} />
              Prendre
            </button>
            <button style={{
              flex: 1, padding: '11px 14px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, borderRadius: 10,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.fg, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
            }}>
              <IconImage size={18} strokeWidth={1.7} />
              Importer
            </button>
          </div>
        </Section>

        {/* Line items */}
        <Section label="Reçu — pièces et fournitures">
          <div style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
            {car.lineItems.map((line, i) => (
              <LineRow key={line.id} line={line}
                       isLast={i === car.lineItems.length - 1 && !newLineOpen}
                       onDelete={() => deleteLine(line.id)} />
            ))}
            {newLineOpen ? (
              <div style={{ padding: '12px 14px', borderTop: car.lineItems.length ? `1px solid ${t.borderSoft}` : 0 }}>
                <input autoFocus value={newLine.desc}
                       onChange={(e) => setNewLine({ ...newLine, desc: e.target.value })}
                       placeholder="Description"
                       style={{
                         width: '100%', border: 0, outline: 'none', background: 'transparent',
                         fontFamily: 'inherit', fontSize: 14.5, color: t.fg, marginBottom: 8,
                       }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ width: 64 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: t.fgMuted, textTransform: 'uppercase', marginBottom: 4 }}>Qté</div>
                    <input value={newLine.qty} onChange={(e) => setNewLine({ ...newLine, qty: e.target.value })}
                           type="number"
                           style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: `1px solid ${t.border}`, borderRadius: 8, background: t.bg, color: t.fg, fontFamily: 'inherit', fontSize: 13 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: t.fgMuted, textTransform: 'uppercase', marginBottom: 4 }}>Prix unitaire (TND)</div>
                    <input value={newLine.unit} onChange={(e) => setNewLine({ ...newLine, unit: e.target.value })}
                           type="number"
                           style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: `1px solid ${t.border}`, borderRadius: 8, background: t.bg, color: t.fg, fontFamily: 'inherit', fontSize: 13 }} />
                  </div>
                  <button onClick={addLine} style={{
                    padding: '6px 14px', height: 30, background: t.accent, color: t.onAccent,
                    border: 0, borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>OK</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setNewLineOpen(true)} style={{
                width: '100%', padding: '12px 14px', textAlign: 'left',
                border: 0, borderTop: car.lineItems.length ? `1px solid ${t.borderSoft}` : 0,
                background: 'transparent', color: t.accent,
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <IconPlus size={16} strokeWidth={2} />
                Ajouter une ligne
              </button>
            )}
          </div>
        </Section>

        <div style={{ height: 24 }} />
      </div>

      {/* Sticky bottom: total + actions */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: t.bg, borderTop: `1px solid ${t.border}`,
        padding: '14px 20px 16px', boxShadow: '0 -10px 30px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: t.fgMuted, fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{grandTotal}</span>
            <span style={{ fontSize: 13, color: t.fgMuted, marginLeft: 4, fontWeight: 500 }}>TND</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onOpenReceipt} style={{
            flex: 1, padding: '13px 16px', borderRadius: 12,
            background: t.surface, border: `1px solid ${t.border}`,
            color: t.fg, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
          }}>Voir le reçu</button>
          <button onClick={() => setConfirmCloseOpen(true)} style={{
            flex: 1, padding: '13px 16px', borderRadius: 12,
            background: t.accent, color: t.onAccent, border: 0,
            fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
          }}>Terminer</button>
        </div>
      </div>

      {/* Status sheet */}
      <BottomSheet open={statusSheetOpen} onClose={() => setStatusSheetOpen(false)} title="Statut" height="auto">
        <div style={{ padding: '8px 0 20px' }}>
          {STATUS_OPTIONS.map((opt) => {
            const active = car.status === opt.value;
            const meta = opt.value && STATUS_META[opt.value];
            return (
              <button key={String(opt.value)} onClick={() => {
                onUpdateCar({ ...car, status: opt.value });
                setStatusSheetOpen(false);
              }} style={{
                width: '100%', padding: '14px 24px', textAlign: 'left',
                background: 'transparent', border: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                color: t.fg, fontFamily: 'inherit', fontSize: 15.5,
              }}>
                {meta ? (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${t.fgMuted}`, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1 }}>{opt.label}</span>
                {active && <IconCheck size={18} style={{ color: t.accent }} />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Task edit sheet */}
      <BottomSheet open={!!editingTaskId} onClose={() => setEditingTaskId(null)} title="Modifier la tâche" height="auto">
        {editingTaskId && (
          <TaskEditForm
            task={car.tasks.find(t => t.id === editingTaskId)}
            onSave={(patch) => { updateTask(editingTaskId, patch); setEditingTaskId(null); }}
            onDelete={() => deleteTask(editingTaskId)}
          />
        )}
      </BottomSheet>

      {/* Confirm close */}
      <BottomSheet open={confirmCloseOpen} onClose={() => setConfirmCloseOpen(false)} height="auto">
        <div style={{ padding: '8px 24px 24px' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Terminer cette visite ?</div>
          <div style={{ fontSize: 14, color: t.fgMuted, lineHeight: 1.5, marginBottom: 20 }}>
            Le reçu sera enregistré et la voiture sortira de la liste active.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirmCloseOpen(false)} style={{
              flex: 1, padding: '13px 16px', borderRadius: 12,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.fg, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
            }}>Annuler</button>
            <button onClick={() => { setConfirmCloseOpen(false); onCloseVisit(); }} style={{
              flex: 1, padding: '13px 16px', borderRadius: 12,
              background: t.accent, color: t.onAccent, border: 0,
              fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
            }}>Confirmer</button>
          </div>
        </div>
      </BottomSheet>

      {/* Photo viewer */}
      {photoViewer !== null && (
        <PhotoViewer index={photoViewer} tab={photoTab} onClose={() => setPhotoViewer(null)} />
      )}
    </div>
  );
}

function Section({ label, children }) {
  const t = window.__T;
  return (
    <div style={{ padding: '14px 20px 6px' }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted,
        textTransform: 'uppercase', marginBottom: 10,
      }}>{label}</div>
      {children}
    </div>
  );
}

function TaskRow({ task, isLast, onToggle, onClick }) {
  const t = window.__T;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 14px',
      borderBottom: isLast ? 0 : `1px solid ${t.borderSoft}`,
    }}>
      <button onClick={onToggle} style={{
        width: 22, height: 22, marginTop: 1, flexShrink: 0,
        borderRadius: 6, border: `1.5px solid ${task.done ? t.accent : t.border}`,
        background: task.done ? t.accent : 'transparent',
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.onAccent,
      }}>
        {task.done && <IconCheck size={14} strokeWidth={2.5} />}
      </button>
      <div onClick={onClick} style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, lineHeight: 1.4, color: task.done ? t.fgMuted : t.fg,
          textDecoration: task.done ? 'line-through' : 'none',
        }} dir="auto">
          {task.text}
        </div>
        {task.notes && (
          <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 3, lineHeight: 1.4 }} dir="auto">
            {task.notes}
          </div>
        )}
      </div>
      <div style={{ fontSize: 13.5, color: task.done ? t.fgMuted : t.fg, fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap', marginTop: 1 }}>
        {task.price != null ? `${task.price} TND` : '—'}
      </div>
    </div>
  );
}

function LineRow({ line, isLast, onDelete }) {
  const t = window.__T;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 14px',
      borderBottom: isLast ? 0 : `1px solid ${t.borderSoft}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, color: t.fg, lineHeight: 1.4 }} dir="auto">
          {line.desc}
        </div>
        <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 3, fontFamily: '"JetBrains Mono", monospace' }}>
          {line.qty} × {line.unit}
        </div>
      </div>
      <div style={{ fontSize: 14, color: t.fg, fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap', marginTop: 1 }}>
        {line.qty * line.unit} TND
      </div>
      <button onClick={onDelete} style={{
        background: 'transparent', border: 0, color: t.fgMuted, padding: 4, cursor: 'pointer', marginTop: -2,
      }}>
        <IconTrash size={16} strokeWidth={1.7} />
      </button>
    </div>
  );
}

function PhotoTile({ index, tab, onClick, hasPhoto }) {
  const t = window.__T;
  // Generate stable pseudo-image: gradient with car icon
  const hues = [200, 35, 145, 0, 280];
  const hue = hues[(index * 31 + (tab === 'avant' ? 0 : 5)) % hues.length];
  if (!hasPhoto) {
    return (
      <div style={{
        aspectRatio: '1', borderRadius: 10, background: t.thumbBg,
        border: `1px dashed ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.fgMuted,
      }}>
        <IconImage size={20} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div onClick={onClick} style={{
      aspectRatio: '1', borderRadius: 10, cursor: 'pointer',
      background: `linear-gradient(135deg, hsl(${hue} 25% 75%), hsl(${hue + 30} 30% 55%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.9)', position: 'relative',
    }}>
      <IconCar size={28} strokeWidth={1.4} />
      <div style={{
        position: 'absolute', top: 6, right: 6, padding: '2px 6px',
        borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff',
        fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>{tab === 'avant' ? 'AV' : 'AP'}</div>
    </div>
  );
}

function TaskEditForm({ task, onSave, onDelete }) {
  const t = window.__T;
  const [text, setText] = React.useState(task.text);
  const [notes, setNotes] = React.useState(task.notes || '');
  const [price, setPrice] = React.useState(task.price ?? '');
  return (
    <div style={{ padding: '8px 24px 24px' }}>
      <Field label="Description">
        <input value={text} onChange={(e) => setText(e.target.value)} dir="auto" style={fieldInputStyle(t)} />
      </Field>
      <Field label="Notes">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} dir="auto"
                  style={{ ...fieldInputStyle(t), minHeight: 60, resize: 'none' }} />
      </Field>
      <Field label="Prix (TND)">
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={fieldInputStyle(t)} />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onDelete} style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'transparent', border: `1px solid ${t.border}`,
          color: '#dc2626', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          <IconTrash size={16} />
        </button>
        <button onClick={() => onSave({ text, notes, price: price === '' ? null : Number(price) })} style={{
          flex: 1, padding: '12px 16px', borderRadius: 10,
          background: t.accent, color: t.onAccent, border: 0,
          fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Enregistrer</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  const t = window.__T;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: t.fgMuted, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function fieldInputStyle(t) {
  return {
    width: '100%', padding: '10px 12px',
    border: `1px solid ${t.border}`, borderRadius: 10,
    background: t.surface, color: t.fg, fontFamily: 'inherit',
    fontSize: 14.5, outline: 'none', boxSizing: 'border-box',
  };
}

function PhotoViewer({ index, tab, onClose }) {
  const hues = [200, 35, 145, 0, 280];
  const hue = hues[(index * 31 + (tab === 'avant' ? 0 : 5)) % hues.length];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, width: 40, height: 40,
        borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 0,
        color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconX size={22} />
      </button>
      <div style={{
        width: '85%', aspectRatio: '3/4', borderRadius: 16,
        background: `linear-gradient(135deg, hsl(${hue} 25% 75%), hsl(${hue + 30} 30% 55%))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)',
      }}>
        <IconCar size={80} strokeWidth={1.2} />
      </div>
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 10,
      }}>
        <button style={{
          padding: '10px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.15)',
          border: 0, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>{tab === 'avant' ? 'Marquer Après' : 'Marquer Avant'}</button>
        <button style={{
          padding: '10px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.15)',
          border: 0, color: '#fff', cursor: 'pointer',
        }}>
          <IconTrash size={18} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CarDetailScreen });
