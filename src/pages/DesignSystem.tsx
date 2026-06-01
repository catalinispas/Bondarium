import { useState } from 'react';
import {
  X, Plus, GitBranch, Check, Trash2, Save, BookOpen, Filter,
  Columns, Palette, Download, Sun, Moon, GitCompare,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Pin, PinOff, GripVertical,
} from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-6 mb-5">
      <span className="w-48 text-[10px] text-gray-400 dark:text-gray-500 shrink-0 pt-1 font-mono leading-relaxed">{label}</span>
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  );
}

export function DesignSystem() {
  const [activeChip, setActiveChip] = useState(false);
  const [liveBadge, setLiveBadge] = useState(true);
  const [activeToolBtn, setActiveToolBtn] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Design System</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          All styles extracted directly from the components. Click interactive elements to see state changes.
        </p>

        {/* ── Toolbar buttons (ToolBtn) ── */}
        <Section title="Toolbar Buttons — ToolBtn">
          <Row label="Normal state">
            <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Filter size={14} /> Filter
            </button>
            <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Columns size={14} /> Columns
            </button>
            <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Palette size={14} /> Format
            </button>
          </Row>
          <Row label="Active state (panel open)">
            <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Filter size={14} /> Filter
            </button>
            <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Columns size={14} /> Columns
            </button>
          </Row>
          <Row label="With indicator dot (filter active)">
            <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setActiveToolBtn(v => !v)}>
              <Filter size={14} /> Filter
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
          </Row>
          <Row label="Toggle interactive">
            <button
              onClick={() => setActiveToolBtn(v => !v)}
              className={`relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                ${activeToolBtn
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Palette size={14} /> Format
            </button>
          </Row>
        </Section>

        {/* ── Quick Filter Chips ── */}
        <Section title="Quick Filter Chips — QuickFilterChips">
          <Row label="Inactive: bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600">
            <button className="px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
              Agency Only
            </button>
            <button className="px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
              Non-Agency
            </button>
            <button className="px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
              CMBS
            </button>
          </Row>
          <Row label="Active: bg-blue-600 border-blue-600 text-white">
            <button className="px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors bg-blue-600 border-blue-600 text-white">
              Non-Agency
            </button>
          </Row>
          <Row label="Interactive toggle">
            <button
              onClick={() => setActiveChip(v => !v)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                ${activeChip
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                }`}
            >
              IG Only
            </button>
          </Row>
        </Section>

        {/* ── Live Badge ── */}
        <Section title="Live Badge — LiveBadge">
          <Row label="Live: bg-emerald-50 border-emerald-300 text-emerald-700">
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </button>
          </Row>
          <Row label="Paused: bg-gray-50 border-gray-300 text-gray-500">
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors bg-gray-50 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Paused
            </button>
          </Row>
          <Row label="Interactive toggle">
            <button
              onClick={() => setLiveBadge(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors
                ${liveBadge
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-50 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveBadge ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {liveBadge ? 'Live' : 'Paused'}
            </button>
          </Row>
        </Section>

        {/* ── .btn system ── */}
        <Section title="Named Button Classes — .btn system (index.css)">
          <Row label=".btn .btn-primary">
            <button className="btn btn-primary"><Check size={11} /> Apply</button>
            <button className="btn btn-sm btn-primary"><Check size={10} /> Save</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </Row>
          <Row label=".btn .btn-secondary">
            <button className="btn btn-secondary"><BookOpen size={11} /> Saved Filters</button>
            <button className="btn btn-sm btn-secondary">Small</button>
            <button className="btn btn-secondary" disabled>Disabled</button>
          </Row>
          <Row label=".btn .btn-danger">
            <button className="btn btn-danger"><Trash2 size={11} /> Remove</button>
            <button className="btn btn-sm btn-danger">Small</button>
          </Row>
          <Row label=".btn .btn-ghost">
            <button className="btn btn-ghost"><Save size={11} /> Save view</button>
            <button className="btn btn-ghost"><Download size={11} /> Export</button>
          </Row>
          <Row label=".btn-page (pagination)">
            <button className="btn-page"><ChevronFirst size={14} /></button>
            <button className="btn-page"><ChevronLeft size={14} /></button>
            <button className="btn-page"><ChevronRight size={14} /></button>
            <button className="btn-page" disabled><ChevronLast size={14} /></button>
          </Row>
        </Section>

        {/* ── Text link buttons ── */}
        <Section title="Text Link Buttons">
          <Row label="text-blue-600 hover:text-blue-800 (filter builder: + condition, + Add rule)">
            <button className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800">
              <Plus size={11} /> condition
            </button>
            <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              <Plus size={12} /> Add rule
            </button>
          </Row>
          <Row label="text-purple-600 hover:text-purple-800 (filter builder: group)">
            <button className="flex items-center gap-0.5 text-xs text-purple-600 hover:text-purple-800">
              <GitBranch size={11} /> group
            </button>
          </Row>
          <Row label="deselect: text-gray-500 hover:text-gray-700">
            <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X size={12} className="inline" /> Deselect all
            </button>
          </Row>
          <Row label="nav/util (header bar): text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <div className="bg-slate-900 px-2 py-1 rounded">
              <button className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors">
                Design System
              </button>
            </div>
          </Row>
        </Section>

        {/* ── Icon buttons ── */}
        <Section title="Icon Buttons">
          <Row label="Close/neutral: text-gray-400 hover:text-gray-600">
            <button className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X size={16} /></button>
          </Row>
          <Row label="Delete/danger: text-gray-400 hover:text-red-500">
            <button className="text-gray-400 hover:text-red-500 p-0.5"><Trash2 size={12} /></button>
            <button className="text-gray-400 hover:text-red-500 ml-auto"><Trash2 size={12} /></button>
          </Row>
          <Row label="Dark mode toggle: p-1.5 rounded hover:bg-gray-100 text-gray-500">
            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <Sun size={15} />
            </button>
            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <Moon size={15} />
            </button>
          </Row>
          <Row label="Pin (ColumnManager): 3 states">
            <div className="flex flex-col gap-1 text-[10px] text-gray-400">
              <div className="flex items-center gap-2">
                <button className="p-0.5 rounded text-gray-400 hover:text-blue-600"><Pin size={12} fill="none" /></button>
                <span>Not pinned (visible on row hover only) — outline Pin, gray</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-0.5 rounded text-blue-600"><Pin size={12} fill="currentColor" /></button>
                <span>Pinned, idle — filled Pin, blue, always visible</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-0.5 rounded text-red-400"><PinOff size={12} /></button>
                <span>Pinned, hovering button — PinOff, red → click unpins</span>
              </div>
            </div>
          </Row>
          <Row label="Drag handle: text-gray-400 hover:text-gray-600">
            <span className="cursor-grab text-gray-400 hover:text-gray-600"><GripVertical size={14} /></span>
          </Row>
          <Row label="Save view icon button: btn-primary p-1 rounded">
            <button className="btn-primary p-1 rounded"><Save size={13} /></button>
          </Row>
        </Section>

        {/* ── Special buttons ── */}
        <Section title="Special Buttons">
          <Row label="Compare: bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100">
            <button className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-400">
              <GitCompare size={13} /> Compare (3)
            </button>
          </Row>
          <Row label="Toolbar divider">
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-[10px] text-gray-400">h-4 w-px bg-gray-200</span>
          </Row>
        </Section>

        {/* ── Form Elements ── */}
        <Section title="Form Elements">
          <Row label=".input-sm (index.css)">
            <input className="input-sm w-32" placeholder="value" />
            <input className="input-sm w-52" placeholder="Search CUSIP, description, issuer..." />
          </Row>
          <Row label=".select-sm (index.css)">
            <select className="select-sm"><option>No grouping</option><option>Bond Type</option></select>
            <select className="select-sm w-16 font-semibold"><option>AND</option><option>OR</option></select>
          </Row>
          <Row label="Pagination jump input: w-12 px-1 py-0.5 border border-gray-300 rounded text-center">
            <input className="w-12 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-800 dark:text-gray-200 text-xs" placeholder="pg" />
          </Row>
          <Row label="Color input: w-7 h-6 rounded cursor-pointer border border-gray-300">
            <input type="color" defaultValue="#fecaca" className="w-7 h-6 rounded cursor-pointer border border-gray-300" />
            <input type="color" defaultValue="#7f1d1d" className="w-7 h-6 rounded cursor-pointer border border-gray-300" />
            <span className="text-[10px] text-gray-400">Used in ConditionalFormat</span>
          </Row>
          <Row label="Checkbox: accent-blue-600">
            <input type="checkbox" className="accent-blue-600" defaultChecked />
            <input type="checkbox" className="accent-blue-600" />
          </Row>
        </Section>

        {/* ── Badges ── */}
        <Section title="Badges & Tags">
          <Row label="Filter active badge: bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded">
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-normal">active</span>
          </Row>
          <Row label="Liquidity: px-1 py-0.5 rounded text-[10px] font-medium">
            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">High</span>
            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Medium</span>
            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Low</span>
          </Row>
          <Row label="Saved filters count: px-1 rounded-full bg-gray-200 text-[9px] font-semibold">
            <span className="px-1 rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-semibold text-gray-700 dark:text-gray-300">3</span>
          </Row>
          <Row label="Filter dot indicator: w-2 h-2 bg-blue-500 rounded-full (absolute -top-0.5 -right-0.5)">
            <div className="relative inline-flex">
              <button className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 bg-gray-100">
                <Filter size={14} /> Filter
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
            </div>
          </Row>
        </Section>

        {/* ── Dropdown menus ── */}
        <Section title="Dropdown Menus">
          <Row label="Export menu: bg-white border-gray-200 rounded shadow-lg">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg min-w-[120px]">
              <button className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200">Export CSV</button>
              <button className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">Export Excel (hover)</button>
              <button className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200">Export PDF</button>
            </div>
          </Row>
        </Section>

        {/* ── Table row states ── */}
        <Section title="Table Row States">
          <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden text-xs" style={{ borderCollapse: 'separate' } as React.CSSProperties}>
            <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
              <div className="px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700">CUSIP</div>
              <div className="px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700">Bond Type</div>
              <div className="px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700 text-right">OAS Spread</div>
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">Liquidity</div>
            </div>
            {/* Normal */}
            <div className="grid grid-cols-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800">310001176</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800">Agency CMO</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800 text-right">30.6 bp</div>
              <div className="px-3 py-1.5"><span className="px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">High</span></div>
            </div>
            {/* Hover */}
            <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800">460001027</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800">CMBS</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800 text-right" style={{ backgroundColor: '#fecaca', color: '#7f1d1d' }}>1393.1 bp</div>
              <div className="px-3 py-1.5"><span className="px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">Medium</span></div>
            </div>
            {/* Selected */}
            <div className="grid grid-cols-4 bg-blue-50 dark:bg-blue-950/30 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800">460001283</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800">CMBS</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800 text-right">150.2 bp</div>
              <div className="px-3 py-1.5"><span className="px-1 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">Low</span></div>
            </div>
            {/* Compare diff */}
            <div className="grid grid-cols-4 bg-amber-50 dark:bg-amber-950/20 text-gray-800 dark:text-gray-200">
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium">Rating</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800 font-semibold text-amber-800 dark:text-amber-300">AAA</div>
              <div className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-800 font-semibold text-amber-800 dark:text-amber-300">BBB</div>
              <div className="px-3 py-1.5 font-semibold text-amber-800 dark:text-amber-300">AA</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 space-y-0.5">
            <div>Row 1 — normal: <code className="font-mono">bg-white</code></div>
            <div>Row 2 — hover: <code className="font-mono">bg-gray-50 dark:bg-gray-800/50</code> · cond. format cell: inline backgroundColor</div>
            <div>Row 3 — selected: <code className="font-mono">bg-blue-50 dark:bg-blue-950/30</code></div>
            <div>Row 4 — compare diff: <code className="font-mono">bg-amber-50 dark:bg-amber-950/20</code> · text: <code className="font-mono">text-amber-800</code></div>
          </div>
        </Section>

        {/* ── Panels ── */}
        <Section title="Panels & Drawers">
          <div className="flex gap-4 flex-wrap">
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-mono">Inline panel (filter, format)</div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-md p-3 w-56 text-xs text-gray-500">
                border border-gray-200 rounded-lg shadow-md
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-mono">Column manager drawer</div>
              <div className="border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl w-48 p-3 text-xs text-gray-500">
                fixed right-0 w-72 shadow-xl border-l
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-mono">Modal (compare, saved filters)</div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 w-56 text-xs text-gray-500">
                rounded-xl shadow-2xl
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-mono">Row detail panel</div>
              <div className="bg-slate-50 dark:bg-gray-800/80 px-4 py-2.5 text-xs text-gray-500 w-56">
                bg-slate-50 px-4 py-2.5 (no border)
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-mono">Group row</div>
              <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 w-48">
                ▾ USD <span className="font-normal text-slate-500">(348)</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-mono">Conditional format rule row</div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs text-gray-500 w-56">
                bg-gray-50 rounded p-2
              </div>
            </div>
          </div>
        </Section>

        {/* ── Filter builder group borders ── */}
        <Section title="Filter Builder — Group Nesting Colors">
          <div className="space-y-2">
            <div className="border-l-2 border-blue-300 pl-3 text-xs text-gray-600 dark:text-gray-400">
              Depth 0 — <code className="font-mono">border-blue-300</code>
              <div className="border-l-2 border-purple-300 pl-3 mt-1">
                Depth 1 — <code className="font-mono">border-purple-300</code>
                <div className="border-l-2 border-amber-300 pl-3 mt-1">
                  Depth 2 — <code className="font-mono">border-amber-300</code>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Portfolio ── */}
        <Section title="Portfolio Feature">
          <Row label="Add to Portfolio button (toolbar/row detail) — emerald, same pattern as Compare (amber)">
            <button className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400">
              Add to Portfolio (3)
            </button>
            <button className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400">
              Add to Portfolio
            </button>
          </Row>
          <Row label="Portfolio view toggle — pill switch (same as any boolean toggle)">
            <div className="flex items-center gap-3">
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600 transition-colors">
                <span className="inline-block h-3.5 w-3.5 transform translate-x-4 rounded-full bg-white shadow" />
              </button>
              <span className="text-xs text-gray-500">ON</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors">
                <span className="inline-block h-3.5 w-3.5 transform translate-x-0.5 rounded-full bg-white shadow" />
              </button>
              <span className="text-xs text-gray-500">OFF</span>
            </div>
          </Row>
          <Row label="Portfolio column headers — bg-emerald-50 (tinted, not default bg-gray-50)">
            <div className="flex border border-gray-200 dark:border-gray-700 rounded overflow-hidden text-xs">
              <div className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold border-r border-gray-200 dark:border-gray-700 text-right w-20">Notional</div>
              <div className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold border-r border-gray-200 dark:border-gray-700 text-right w-20">Book Price</div>
              <div className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold text-right w-20">P&amp;L ($)</div>
            </div>
          </Row>
          <Row label="Position row in Portfolio Drawer — reuses bg-gray-50 list item pattern">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 w-72">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">310001176</span>
                <button className="text-gray-400 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100"><Trash2 size={11} /></button>
              </div>
              <span className="text-[10px] text-gray-500 block leading-tight">Fannie CMO 2029 TAC A 0.40%</span>
              <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                <span>Notional: $1.00M</span>
                <span>Book: 97.500</span>
                <span>Mkt: 97.152</span>
                <span className="text-red-500">P&amp;L: -$3.5K (-0.36%)</span>
              </div>
            </div>
          </Row>
          <Row label="Portfolio summary strip — grid-cols-2, text-[9px] label + text-[11px] value">
            <div className="border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-2 w-72">
              {[
                { label: 'Total Mkt Value', val: '$2.43M', color: '' },
                { label: 'Total P&L', val: '-$12.5K', color: 'text-red-500' },
                { label: 'WA Spread', val: '185.3 bp', color: '' },
                { label: 'WA OAS Dur', val: '4.21 yr', color: '' },
                { label: 'Total DV01', val: '$1,024', color: '' },
                { label: 'P&L %', val: '-0.51%', color: 'text-red-500' },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className={`text-[11px] font-semibold ${color || 'text-gray-700 dark:text-gray-300'}`}>{val}</div>
                </div>
              ))}
            </div>
          </Row>
          <Row label="Scenario P&L row — input-sm + colored result">
            <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-[10px] text-gray-500 whitespace-nowrap">Spread shock</span>
              <input type="number" className="input-sm w-16 text-center" defaultValue={50} />
              <span className="text-[10px] text-gray-500">bp →</span>
              <span className="text-[11px] font-semibold text-red-500">-$51.2K</span>
            </div>
          </Row>
          <Row label="Allocation bar — stacked horizontal, color-coded per bond type">
            <div className="w-72 space-y-2">
              <div className="h-2 w-full rounded overflow-hidden flex">
                {[['#3b82f6',40],['#10b981',25],['#f59e0b',20],['#ef4444',15]].map(([c,w],i) => (
                  <div key={i} style={{width:`${w}%`, backgroundColor: c as string}} />
                ))}
              </div>
              <div className="space-y-1">
                {[['#3b82f6','Agency CMO','40%'],['#10b981','CMBS','25%'],['#f59e0b','ABS','20%'],['#ef4444','CDO/CLO','15%']].map(([c,l,p]) => (
                  <div key={l} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{backgroundColor: c as string}} />
                    <span className="flex-1">{l}</span>
                    <span className="font-mono">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Row>
        </Section>

        {/* ── Toolbar container ── */}
        <Section title="Containers">
          <div className="space-y-1 text-[10px] text-gray-400 font-mono">
            <div>Toolbar bar: <code className="text-blue-600">bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700</code></div>
            <div>App header: <code className="text-blue-600">bg-slate-900 dark:bg-slate-950 border-b border-slate-700</code></div>
            <div>Summary footer cell: <code className="text-blue-600">bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300</code></div>
            <div>Pagination bar: <code className="text-blue-600">bg-white dark:bg-gray-900 border-t border-gray-200</code></div>
            <div>Column manager search area: <code className="text-blue-600">border-b border-gray-100 dark:border-gray-800</code></div>
          </div>
        </Section>
      </div>
    </div>
  );
}
