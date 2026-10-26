// Sentry Agent Tracing Implementation
// Provides OpenTelemetry & Sentry-compliant tracing, spans, token analytics, and waterfall visualization

export class SentryAgentTracer {
  constructor() {
    this.currentTrace = null;
    this.tracesHistory = [];
    this.breadcrumbs = [];
    this.dsn = 'https://o000000.ingest.sentry.io/4507000000000000';
    this.environment = 'production-local-edge';
  }

  startTrace(traceName, metadata = {}) {
    const traceId = this._generateId(32);
    const spanId = this._generateId(16);
    const startTime = performance.now();
    const timestamp = new Date().toISOString();

    this.currentTrace = {
      traceId,
      spanId,
      name: traceName,
      status: 'in_progress',
      startTime,
      timestamp,
      endTime: null,
      durationMs: 0,
      metadata: {
        agentFramework: 'Mastra v0.8.2',
        model: metadata.model || 'Gemma 2 (2B-IT)',
        runtime: metadata.runtime || 'Client-Side Local Inference',
        scenario: metadata.scenario || 'Custom Chat Stream',
        tags: {
          'ai.pipeline': 'sloth-digest-v1',
          'ai.model.provider': 'google-deepmind-gemma',
          'ai.model.family': 'gemma-2',
          'ai.temperature': 0.3,
          'open_source.license': 'Gemma Terms of Use (Open-Weights)',
          'theme.hacktoberfest': 'Slow and Steady / Sloth Day',
          'privacy.egress_bytes': 0 // Absolute zero data leakage!
        }
      },
      spans: [],
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUSD: 0.0000 // Zero cloud API cost!
      },
      impactMetrics: {
        linesProcessed: 0,
        linesSuppressed: 0,
        noiseRatioPercent: 0,
        minutesSaved: 0,
        energyConservedPercent: 0
      }
    };

    this.addBreadcrumb({
      category: 'agent.lifecycle',
      message: `Started Sentry Agent Transaction: ${traceName}`,
      level: 'info'
    });

    return this.currentTrace;
  }

  startSpan(op, description, tags = {}) {
    if (!this.currentTrace) return null;

    const spanId = this._generateId(16);
    const startTime = performance.now();
    const span = {
      spanId,
      parentSpanId: this.currentTrace.spanId,
      op,
      description,
      startTime,
      endTime: null,
      durationMs: 0,
      status: 'in_progress',
      tags: { ...tags }
    };

    this.currentTrace.spans.push(span);
    return span;
  }

  endSpan(span, status = 'ok', additionalTags = {}) {
    if (!span) return;
    span.endTime = performance.now();
    span.durationMs = Math.max(1, Math.round(span.endTime - span.startTime));
    span.status = status;
    span.tags = { ...span.tags, ...additionalTags };

    this.addBreadcrumb({
      category: 'span',
      message: `Span finished: ${span.op} (${span.durationMs}ms) - [${status}]`,
      level: 'debug'
    });
  }

  finishTrace({ tokens, impact } = {}) {
    if (!this.currentTrace) return null;

    this.currentTrace.endTime = performance.now();
    this.currentTrace.durationMs = Math.round(this.currentTrace.endTime - this.currentTrace.startTime);
    this.currentTrace.status = 'ok';

    if (tokens) {
      this.currentTrace.tokenUsage = {
        promptTokens: tokens.promptTokens || 0,
        completionTokens: tokens.completionTokens || 0,
        totalTokens: (tokens.promptTokens || 0) + (tokens.completionTokens || 0),
        estimatedCostUSD: 0.0000 // Emphasize open-source savings
      };
    }

    if (impact) {
      this.currentTrace.impactMetrics = { ...this.currentTrace.impactMetrics, ...impact };
    }

    this.addBreadcrumb({
      category: 'agent.lifecycle',
      message: `Completed Sentry Agent Transaction: ${this.currentTrace.name} in ${this.currentTrace.durationMs}ms`,
      level: 'info'
    });

    const finishedTrace = { ...this.currentTrace };
    this.tracesHistory.unshift(finishedTrace);
    return finishedTrace;
  }

  addBreadcrumb({ category, message, level = 'info' }) {
    const crumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level
    };
    this.breadcrumbs.push(crumb);
    if (this.breadcrumbs.length > 50) this.breadcrumbs.shift();
  }

  /**
   * Generates a Sentry-compatible Envelope JSON payload
   */
  exportSentryEnvelope() {
    if (!this.currentTrace) return null;

    const envelopeHeader = {
      event_id: this.currentTrace.traceId,
      sent_at: new Date().toISOString(),
      sdk: {
        name: 'sentry.javascript.agent_tracing',
        version: '8.34.0'
      }
    };

    const itemHeader = {
      type: 'transaction',
      content_type: 'application/json'
    };

    const itemPayload = {
      event_id: this.currentTrace.traceId,
      type: 'transaction',
      transaction: this.currentTrace.name,
      start_timestamp: this.currentTrace.startTime / 1000,
      timestamp: (this.currentTrace.endTime || performance.now()) / 1000,
      contexts: {
        trace: {
          trace_id: this.currentTrace.traceId,
          span_id: this.currentTrace.spanId,
          op: 'agent.pipeline',
          status: this.currentTrace.status
        },
        ai_pipeline: {
          harness: this.currentTrace.metadata.agentFramework,
          model: this.currentTrace.metadata.model,
          prompt_tokens: this.currentTrace.tokenUsage.promptTokens,
          completion_tokens: this.currentTrace.tokenUsage.completionTokens,
          cost_usd: 0.0,
          privacy_local_only: true
        }
      },
      spans: this.currentTrace.spans.map(s => ({
        span_id: s.spanId,
        parent_span_id: s.parentSpanId,
        op: s.op,
        description: s.description,
        start_timestamp: s.startTime / 1000,
        timestamp: s.endTime ? s.endTime / 1000 : undefined,
        status: s.status,
        tags: s.tags
      })),
      breadcrumbs: this.breadcrumbs
    };

    return JSON.stringify([envelopeHeader, itemHeader, itemPayload], null, 2);
  }

  _generateId(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}
