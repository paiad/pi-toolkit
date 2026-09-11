import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import {
	DEFAULT_FULLSCREEN_WHEEL_SCROLL_LINES,
	normalizeFullscreenWheelScrollLines,
} from "./fullscreen-scroll.ts";
import type { IconMode } from "./icons.ts";

export type SettingsLanguage = "en" | "zh";
export type CursorStyle = "block" | "bar" | "underline";
export type ThinkingPeekLines = 0 | 1 | 2;

export type { IconMode } from "./icons.ts";

export interface FooterSegments {
	cwd: boolean;
	sessionName: boolean;
	gitBranch: boolean;
	gitStatus: boolean;
	gitCommit: boolean;
	runtime: boolean;
	context: boolean;
	tokens: boolean;
	cost: boolean;
	extensionStatuses: boolean;
}

export interface TelemetryConfig {
	enabled: boolean;
	tps: boolean;
	ttft: boolean;
	duration: boolean;
	tokens: boolean;
	stalls: boolean;
	cost: boolean;
}

export interface ThinkingPeekConfig {
	lines: ThinkingPeekLines;
}

export type ModelNameStyle = "plain" | "rainbow";

/** Gradient knobs for the per-character model-name rainbow. */
export interface RainbowPalette {
	/** Starting hue in degrees (0-360). */
	hueStart: number;
	/** Maximum hue distance across the whole label, in degrees. */
	hueSpan: number;
	/** Hue advance per character, in degrees. */
	huePerChar: number;
	/** Saturation, 0-1. */
	saturation: number;
	/** Lightness, 0-1. */
	lightness: number;
}

export interface ModelNameConfig {
	style: ModelNameStyle;
	rainbow: RainbowPalette;
}

export const DEFAULT_RAINBOW: RainbowPalette = {
	hueStart: 10,
	hueSpan: 220,
	huePerChar: 14,
	saturation: 0.72,
	lightness: 0.72,
};

export interface FullscreenConfig {
	wheelScrollLines: number;
}

export interface OpenTuiConfig {
	enabled: boolean;
	settingsLanguage: SettingsLanguage;
	cursorStyle: CursorStyle;
	fullscreen: FullscreenConfig;
	icons: {
		mode: IconMode;
	};
	footerSegments: FooterSegments;
	modelName: ModelNameConfig;
	telemetry: TelemetryConfig;
	thinkingPeek: ThinkingPeekConfig;
}

export const DEFAULT_CONFIG: OpenTuiConfig = {
	enabled: true,
	settingsLanguage: "en",
	cursorStyle: "block",
	fullscreen: {
		wheelScrollLines: DEFAULT_FULLSCREEN_WHEEL_SCROLL_LINES,
	},
	icons: {
		mode: "auto",
	},
	footerSegments: {
		cwd: true,
		sessionName: false,
		gitBranch: true,
		gitStatus: true,
		gitCommit: false,
		runtime: true,
		context: true,
		tokens: true,
		cost: true,
		extensionStatuses: true,
	},
	telemetry: {
		enabled: true,
		tps: true,
		ttft: true,
		duration: true,
		tokens: true,
		stalls: true,
		cost: true,
	},
	thinkingPeek: {
		lines: 1,
	},
	modelName: {
		style: "rainbow",
		rainbow: { ...DEFAULT_RAINBOW },
	},
};

export function getConfigPath(): string {
	const agentDir = getAgentDir();
	return join(agentDir, "open-tui.json");
}

function normalizeThinkingPeekLines(value: unknown): ThinkingPeekLines {
	return value === 0 || value === 1 || value === 2 ? value : DEFAULT_CONFIG.thinkingPeek.lines;
}

function normalizeNumber(value: unknown, min: number, max: number, fallback: number): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	return Math.min(max, Math.max(min, value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeModelName(value: unknown): ModelNameConfig {
	const defaults = DEFAULT_CONFIG.modelName;
	if (!isPlainObject(value)) return structuredClone(defaults);
	const rawRainbow = isPlainObject(value.rainbow) ? value.rainbow : {};
	return {
		style: value.style === "plain" || value.style === "rainbow" ? value.style : defaults.style,
		rainbow: {
			hueStart: normalizeNumber(rawRainbow.hueStart, 0, 360, defaults.rainbow.hueStart),
			hueSpan: normalizeNumber(rawRainbow.hueSpan, 0, 360, defaults.rainbow.hueSpan),
			huePerChar: normalizeNumber(rawRainbow.huePerChar, 0, 90, defaults.rainbow.huePerChar),
			saturation: normalizeNumber(rawRainbow.saturation, 0, 1, defaults.rainbow.saturation),
			lightness: normalizeNumber(rawRainbow.lightness, 0, 1, defaults.rainbow.lightness),
		},
	};
}

function deepMerge<T>(base: T, override: unknown): T {
	if (typeof base !== "object" || base === null || Array.isArray(base)) {
		return (override as T) ?? base;
	}
	if (typeof override !== "object" || override === null || Array.isArray(override)) {
		return base;
	}
	const result = { ...(base as Record<string, unknown>) };
	const overrideRec = override as Record<string, unknown>;
	for (const key of Object.keys(overrideRec)) {
		const baseVal = (base as Record<string, unknown>)[key];
		const overVal = overrideRec[key];
		if (typeof baseVal === "object" && baseVal !== null && !Array.isArray(baseVal)
			&& typeof overVal === "object" && overVal !== null && !Array.isArray(overVal)) {
			result[key] = deepMerge(baseVal, overVal);
		} else if (overVal !== undefined) {
			result[key] = overVal;
		}
	}
	return result as T;
}

export function ensureConfigExists(): void {
	const path = getConfigPath();
	if (existsSync(path)) return;
	try {
		const agentDir = getAgentDir();
		if (!existsSync(agentDir)) mkdirSync(agentDir, { recursive: true });
		writeFileSync(path, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n", "utf8");
	} catch {
		// ponytail: silent fallback — config creation is best-effort
	}
}

export function loadConfig(notify?: (msg: string, level: "warning" | "info") => void): OpenTuiConfig {
	const path = getConfigPath();
	if (!existsSync(path)) {
		ensureConfigExists();
		return structuredClone(DEFAULT_CONFIG);
	}

	try {
		const raw = readFileSync(path, "utf8");
		const parsed: unknown = JSON.parse(raw);
		const config = deepMerge(DEFAULT_CONFIG, parsed);
		if (config.settingsLanguage !== "en" && config.settingsLanguage !== "zh") {
			config.settingsLanguage = DEFAULT_CONFIG.settingsLanguage;
		}
		if (config.cursorStyle !== "block" && config.cursorStyle !== "bar" && config.cursorStyle !== "underline") {
			config.cursorStyle = DEFAULT_CONFIG.cursorStyle;
		}
		config.fullscreen.wheelScrollLines = normalizeFullscreenWheelScrollLines(
			config.fullscreen.wheelScrollLines,
			DEFAULT_CONFIG.fullscreen.wheelScrollLines,
		);
		if (typeof config.thinkingPeek !== "object" || config.thinkingPeek === null || Array.isArray(config.thinkingPeek)) {
			config.thinkingPeek = structuredClone(DEFAULT_CONFIG.thinkingPeek);
		} else {
			config.thinkingPeek.lines = normalizeThinkingPeekLines(config.thinkingPeek.lines);
		}
		config.modelName = normalizeModelName(config.modelName);
		return config;
	} catch (err) {
		notify?.(`open-tui config parse error: ${err instanceof Error ? err.message : String(err)}`, "warning");
		return structuredClone(DEFAULT_CONFIG);
	}
}

export function saveConfig(config: OpenTuiConfig): void {
	const path = getConfigPath();
	try {
		const agentDir = getAgentDir();
		if (!existsSync(agentDir)) mkdirSync(agentDir, { recursive: true });
		writeFileSync(path, JSON.stringify(config, null, 2) + "\n", "utf8");
	} catch {
		// ponytail: silent fallback — config save is best-effort
	}
}
