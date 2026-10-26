// SlothDigest Main Entrypoint
import { SCENARIOS } from './data/mockScenarios.js';
import { GemmaClient } from './models/gemmaClient.js';
import { SentryAgentTracer } from './tracing/sentryAgentTracing.js';
import { MastraWorkflow } from './agent/mastraWorkflow.js';
import { AmbientSoundscape } from './audio/ambientSoundscape.js';
import { DEV_SUBMISSION_POST } from './data/devPostContent.js';
import confetti from 'canvas-confetti';

// State
let activeScenario = SCENARIOS[0];
let currentRuntimeMode = 'instant';

// Initialize Core Engines
const gemmaClient = new GemmaClient({ mode: currentRuntimeMode });
const sentryTracer = new SentryAgentTracer();
const mastraWorkflow = new MastraWorkflow({ gemmaClient, sentryTracer });
const ambientSoundscape = new AmbientSoundscape();

// DOM Elements
const selectRuntime = document.getElementById('select-runtime');
const btnAmbientToggle = document.getElementById('btn-ambient-toggle');
const ambientIcon = document.getElementById('ambient-icon');
const ambientText = document.getElementById('ambient-text');
const scenariosContainer = document.getElementById('scenarios-container');
const inputChatText = document.getElementById('input-chat-text');
const charCounter = document.getElementById('char-counter');
const badgeActiveScenario = document.getElementById('badge-active-scenario');
const btnRunDigest = document.getElementById('btn-run-digest');
const progressWrapper = document.getElementById('digest-progress-wrapper');
const progressText = document.getElementById('digest-status-text');
const progressPercent = document.getElementById('digest-progress-percent');
const progressBar = document.getElementById('digest-progress-bar');

const digestLine1 = document.getElementById('digest-line-1');
const digestLine2 = document.getElementById('digest-line-2');
const actionsListContainer = document.getElementById('actions-list-container');
const actionCountBadge = document.getElementById('action-count-badge');
const dramaStatusBadge = document.getElementById('drama-status-badge');
const dramaDescriptionText = document.getElementById('drama-description-text');
const metricMinutes = document.getElementById('metric-minutes');
const metricEnergy = document.getElementById('metric-energy');
const metricNoise = document.getElementById('metric-noise');

const btnNarrateDigest = document.getElementById('btn-narrate-digest');
const narrateIcon = document.getElementById('narrate-icon');
const narrateLabel = document.getElementById('narrate-label');

const sentryWaterfallBody = document.getElementById('sentry-waterfall-body');
const sentryDuration = document.getElementById('sentry-duration');
const sentryTokens = document.getElementById('sentry-tokens');
const sentryRawJson = document.getElementById('sentry-raw-json');
const btnExportSentryJson = document.getElementById('btn-export-sentry-json');

const devPostRenderedBody = document.getElementById('dev-post-rendered-body');
const btnCopyDevPost = document.getElementById('btn-copy-dev-post');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigationTabs();
  renderScenarioPills();
  loadScenario(SCENARIOS[0]);
  setupEventListeners();
  renderDevPostPreview();
  renderInitialSentryWaterfall();
});

// Setup Navigation Tabs
function setupNavigationTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.style.display = 'none');

      btn.classList.add('active');
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.style.display = 'block';
    });
  });
}

// Render Scenario Selection Pills
function renderScenarioPills() {
  scenariosContainer.innerHTML = '';

  SCENARIOS.forEach((scenario, index) => {
    const pill = document.createElement('div');
    pill.className = `scenario-pill ${index === 0 ? 'active' : ''}`;
    pill.setAttribute('data-id', scenario.id);

    pill.innerHTML = `
      <div>
        <div class="scenario-info-title">${scenario.title}</div>
        <div class="scenario-info-sub">${scenario.subtitle}</div>
      </div>
      <span class="scenario-meta-badge">${scenario.messageCount} msgs</span>
    `;

    pill.addEventListener('click', () => {
      document.querySelectorAll('.scenario-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      loadScenario(scenario);
    });

    scenariosContainer.appendChild(pill);
  });
}

// Load Selected Scenario
function loadScenario(scenario) {
  activeScenario = scenario;
  badgeActiveScenario.textContent = scenario.category;
  inputChatText.value = scenario.rawMessages;
  charCounter.textContent = `${scenario.rawMessages.length.toLocaleString()} chars`;

  // Render preloaded summary values
  applyScenarioSummary(scenario.summary);
}

// Apply Summary to UI Cards
function applyScenarioSummary(summary) {
  digestLine1.textContent = summary.twoLineDigest[0];
  digestLine2.textContent = summary.twoLineDigest[1];

  // Actions
  actionsListContainer.innerHTML = '';
  actionCountBadge.textContent = `${summary.actionsForUser.length} item${summary.actionsForUser.length === 1 ? '' : 's'}`;

  summary.actionsForUser.forEach(item => {
    const card = document.createElement('div');
    card.className = 'action-item-card';
    const urgencyClass = item.urgency === 'High' ? 'urgency-med' : item.urgency === 'Medium' ? 'urgency-med' : item.urgency === 'Low' ? 'urgency-low' : 'urgency-none';
    
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: var(--emerald-primary);">•</span>
        <span class="action-text">${item.task}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; color: var(--text-dim);">${item.effort}</span>
        <span class="action-urgency-badge ${urgencyClass}">${item.urgency}</span>
      </div>
    `;
    actionsListContainer.appendChild(card);
  });

  // Drama Filter
  dramaStatusBadge.textContent = `${summary.dramaAnalysis.detectedFlamewars} Flamewar${summary.dramaAnalysis.detectedFlamewars === 1 ? '' : 's'} Quarantined`;
  dramaDescriptionText.textContent = `${summary.dramaAnalysis.dramaDescription} (${summary.dramaAnalysis.suppressionVerdict})`;

  // Metrics
  metricMinutes.textContent = `${summary.metrics.doomscrollMinutesSaved} min`;
  metricEnergy.textContent = `${summary.metrics.brainEnergyConserved}`;
  metricNoise.textContent = `${summary.metrics.noiseRatio}`;
}

// Setup Event Listeners
function setupEventListeners() {
  // Chat textarea live character count
  inputChatText.addEventListener('input', () => {
    charCounter.textContent = `${inputChatText.value.length.toLocaleString()} chars`;
  });

  // Runtime selector
  selectRuntime.addEventListener('change', (e) => {
    currentRuntimeMode = e.target.value;
    gemmaClient.setMode(currentRuntimeMode);
    
    const badge = document.getElementById('badge-privacy');
    if (currentRuntimeMode === 'ollama') {
      badge.innerHTML = `<span>⚡ Local Ollama (:11434)</span>`;
      badge.style.color = '#38bdf8';
    } else if (currentRuntimeMode === 'webgpu') {
      badge.innerHTML = `<span>🚀 Client WebGPU</span>`;
      badge.style.color = '#a855f7';
    } else {
      badge.innerHTML = `<span>🔒 100% On-Device</span>`;
      badge.style.color = '#10b981';
    }
  });

  // Ambient Soundscape Toggle
  btnAmbientToggle.addEventListener('click', () => {
    const isNowPlaying = ambientSoundscape.toggleAmbient();
    if (isNowPlaying) {
      btnAmbientToggle.classList.add('active');
      ambientIcon.textContent = '🔊';
      ambientText.textContent = 'Rain & Zen Active';
    } else {
      btnAmbientToggle.classList.remove('active');
      ambientIcon.textContent = '🌧️';
      ambientText.textContent = 'Ambient Soundscape';
    }
  });

  // Run Sloth Digest Action
  btnRunDigest.addEventListener('click', executeDigest);

  // Audio Narrator
  btnNarrateDigest.addEventListener('click', () => {
    if (ambientSoundscape.isNarrating) {
      ambientSoundscape.stopNarrating();
      narrateIcon.textContent = '▶️';
      narrateLabel.textContent = 'Narrate to Me';
    } else {
      narrateIcon.textContent = '⏸️';
      narrateLabel.textContent = 'Speaking...';
      const textToSpeak = `Here is your Sloth Briefing. First: ${digestLine1.textContent}. Second: ${digestLine2.textContent}. Go back to sleep.`;
      ambientSoundscape.narrateText(textToSpeak, () => {
        narrateIcon.textContent = '▶️';
        narrateLabel.textContent = 'Narrate to Me';
      });
    }
  });

  // Export Sentry JSON Envelope
  btnExportSentryJson.addEventListener('click', () => {
    const envelope = sentryTracer.exportSentryEnvelope();
    if (!envelope) return;

    const blob = new Blob([envelope], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentry-agent-trace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Copy DEV Markdown Post
  btnCopyDevPost.addEventListener('click', () => {
    navigator.clipboard.writeText(DEV_SUBMISSION_POST.markdownBody).then(() => {
      const originalText = btnCopyDevPost.innerHTML;
      btnCopyDevPost.innerHTML = '<span>✓</span> Copied to Clipboard!';
      setTimeout(() => {
        btnCopyDevPost.innerHTML = originalText;
      }, 2500);
    });
  });
}

// Execute Digest Pipeline
async function executeDigest() {
  btnRunDigest.disabled = true;
  btnRunDigest.style.opacity = '0.6';
  progressWrapper.style.display = 'block';

  // Animate progress bar
  updateProgress(10, 'Initializing Mastra Agent Workflow...');

  // Reset visual steps
  const stepNodes = document.querySelectorAll('.step-node');
  stepNodes.forEach(node => {
    node.classList.remove('active', 'completed');
  });

  try {
    const rawMessages = inputChatText.value || activeScenario.rawMessages;

    const result = await mastraWorkflow.runWorkflow({
      scenarioId: activeScenario.id,
      rawMessages,
      onStepChange: ({ stepIndex, status, message }) => {
        const percent = Math.min(95, 20 + stepIndex * 18);
        updateProgress(percent, message);

        stepNodes.forEach((node, idx) => {
          if (idx < stepIndex) {
            node.classList.add('completed');
            node.classList.remove('active');
          } else if (idx === stepIndex) {
            node.classList.add('active');
          }
        });
      },
      onToken: (word, fullText) => {
        // Stream text into line 1 and line 2
        const parts = fullText.split('2.');
        if (parts[0]) {
          digestLine1.textContent = parts[0].replace('🦥 SLOTH BRIEFING:', '').replace('1.', '').trim();
        }
        if (parts[1]) {
          const line2Text = parts[1].split('📋')[0].trim();
          digestLine2.textContent = line2Text;
        }
      }
    });

    updateProgress(100, 'Sloth Digest Complete!');
    stepNodes.forEach(node => node.classList.add('completed'));

    // Apply Impact Metrics
    metricMinutes.textContent = `${result.impact.minutesSaved} min`;
    metricEnergy.textContent = `${result.impact.energyConservedPercent}%`;
    metricNoise.textContent = `${result.impact.noiseRatioPercent}%`;

    // Update Sentry View
    updateSentryView(result.trace);

    // Celebrate with Confetti for High Laziness Score!
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#10b981', '#f59e0b', '#34d399', '#ffffff']
    });

  } catch (err) {
    console.error('Error during digest execution:', err);
    updateProgress(100, `Execution halted: ${err.message}`);
  } finally {
    setTimeout(() => {
      progressWrapper.style.display = 'none';
      btnRunDigest.disabled = false;
      btnRunDigest.style.opacity = '1';
    }, 1800);
  }
}

function updateProgress(percent, text) {
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${Math.round(percent)}%`;
  progressText.textContent = text;
}

// Initial Sentry Waterfall Setup
function renderInitialSentryWaterfall() {
  const dummySpans = [
    { op: 'mastra.ingest', desc: 'Normalize message lines & timestamps', durationMs: 140, status: 'ok', fill: 'fill-cyan', width: 18 },
    { op: 'tool.noise_prune', desc: 'Mastra NoisePrunerTool (Discard +1s, reactions)', durationMs: 220, status: 'ok', fill: 'fill-amber', width: 30 },
    { op: 'tool.drama_suppress', desc: 'Mastra DramaSuppressionFilter (Isolate flamewars)', durationMs: 240, status: 'ok', fill: 'fill-purple', width: 34 },
    { op: 'llm.gemma2.inference', desc: 'Local Gemma 2 Open-Weight Streaming Generation', durationMs: 680, status: 'ok', fill: 'fill-emerald', width: 88 },
    { op: 'agent.impact_calc', desc: 'Calculate energy conserved % & doomscroll mins', durationMs: 150, status: 'ok', fill: 'fill-cyan', width: 20 }
  ];

  sentryWaterfallBody.innerHTML = '';
  dummySpans.forEach(span => {
    const tr = document.createElement('tr');
    tr.className = 'waterfall-row';
    tr.innerHTML = `
      <td>
        <span style="color: var(--emerald-light); font-weight: 600;">${span.op}</span>
        <div style="font-size: 11px; color: var(--text-dim);">${span.desc}</div>
      </td>
      <td>
        <div class="span-bar-container">
          <div class="span-bar-fill ${span.fill}" style="width: ${span.width}%;"></div>
        </div>
      </td>
      <td style="color: #ffffff; font-weight: 600;">${span.durationMs} ms</td>
      <td>
        <span style="color: var(--emerald-light); background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 4px;">${span.status}</span>
      </td>
    `;
    sentryWaterfallBody.appendChild(tr);
  });

  sentryDuration.textContent = '720 ms';
  sentryTokens.textContent = '894 / 168 tokens';
  sentryRawJson.textContent = JSON.stringify({
    trace_id: "4c9e88b201f948a39d1b0981e779ef88",
    transaction: "agent.chat_digest",
    environment: "production-local-edge",
    spans_count: 5,
    harness: "Mastra v0.8.2",
    model: "Gemma 2 (2B-IT Open-Weights)",
    privacy_mode: "100% On-Device / Zero-Egress",
    cloud_cost_usd: 0.00
  }, null, 2);
}

// Update Sentry View with Live Finished Trace
function updateSentryView(trace) {
  if (!trace) return;

  sentryDuration.textContent = `${trace.durationMs} ms`;
  sentryTokens.textContent = `${trace.tokenUsage.promptTokens} / ${trace.tokenUsage.completionTokens} tokens`;

  sentryWaterfallBody.innerHTML = '';
  const maxDuration = Math.max(...trace.spans.map(s => s.durationMs || 100));

  const colors = ['fill-cyan', 'fill-amber', 'fill-purple', 'fill-emerald', 'fill-cyan'];

  trace.spans.forEach((span, idx) => {
    const width = Math.min(100, Math.max(12, Math.round((span.durationMs / maxDuration) * 95)));
    const color = colors[idx % colors.length];

    const tr = document.createElement('tr');
    tr.className = 'waterfall-row';
    tr.innerHTML = `
      <td>
        <span style="color: var(--emerald-light); font-weight: 600;">${span.op}</span>
        <div style="font-size: 11px; color: var(--text-dim);">${span.description}</div>
      </td>
      <td>
        <div class="span-bar-container">
          <div class="span-bar-fill ${color}" style="width: ${width}%;"></div>
        </div>
      </td>
      <td style="color: #ffffff; font-weight: 600;">${span.durationMs} ms</td>
      <td>
        <span style="color: var(--emerald-light); background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 4px;">${span.status}</span>
      </td>
    `;
    sentryWaterfallBody.appendChild(tr);
  });

  sentryRawJson.textContent = sentryTracer.exportSentryEnvelope();
}

// Render Markdown DEV Post Preview
function renderDevPostPreview() {
  const rawMd = DEV_SUBMISSION_POST.markdownBody;
  
  // Clean parser for key markdown elements
  let html = rawMd
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code style="font-family: var(--font-mono); color: var(--emerald-light); background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">$1</code>')
    .replace(/\n\n/gim, '</p><p>');

  devPostRenderedBody.innerHTML = `<p>${html}</p>`;
}
