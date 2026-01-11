#!/usr/bin/env node
/**
 * Memory Manager for n8n Specialist AI System
 * 
 * This script manages the persistent memory system:
 * - Query knowledge base (patterns, examples, conventions)
 * - Update current context
 * - Add new learnings
 * - Maintain session history
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Base paths
const AI_ASSISTANT_DIR = join(__dirname, '..');
const MEMORY_DIR = join(AI_ASSISTANT_DIR, 'memory');
const KNOWLEDGE_BASE_DIR = join(AI_ASSISTANT_DIR, 'knowledge-base');

// File paths
const CONTEXT_FILE = join(MEMORY_DIR, 'context.json');
const LEARNINGS_FILE = join(MEMORY_DIR, 'learnings.json');
const DECISIONS_FILE = join(MEMORY_DIR, 'decisions.json');
const HISTORY_FILE = join(MEMORY_DIR, 'session_history.jsonl');
const ARCHITECTURE_FILE = join(KNOWLEDGE_BASE_DIR, 'documentation', 'architecture.json');
const PATTERNS_FILE = join(KNOWLEDGE_BASE_DIR, 'documentation', 'patterns.json');
const CONVENTIONS_FILE = join(KNOWLEDGE_BASE_DIR, 'documentation', 'conventions.json');

// Types
interface Context {
	current_session: {
		started_at: string;
		session_id: string;
		working_on: string;
		branch: string | null;
		files_touched: string[];
		todos: any[];
	};
	recent_implementations: any[];
	active_learnings: {
		new_patterns_discovered: any[];
		gotchas_found: any[];
	};
	statistics: {
		total_implementations: number;
		successful_implementations: number;
		patterns_learned: number;
		sessions_completed: number;
		code_examples_added: number;
		documentation_files: number;
	};
}

interface Pattern {
	id: string;
	name: string;
	category: string;
	description?: string;
	rules?: string[];
	steps?: string[];
	key_packages?: string[];
	source: string;
	confidence: string;
	last_updated: string;
	usage_count: number;
	examples?: string[];
}

interface Learnings {
	patterns: Pattern[];
	gotchas: any[];
	conventions: any[];
	implementation_templates: any[];
}

// Utility functions
function readJSON<T>(filepath: string): T {
	if (!existsSync(filepath)) {
		throw new Error(`File not found: ${filepath}`);
	}
	const content = readFileSync(filepath, 'utf-8');
	return JSON.parse(content) as T;
}

function writeJSON(filepath: string, data: any): void {
	writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function appendJSONL(filepath: string, data: any): void {
	const line = JSON.stringify(data) + '\n';
	writeFileSync(filepath, line, { flag: 'a', encoding: 'utf-8' });
}

// Memory Manager Class
class MemoryManager {
	// Query operations
	
	/**
	 * Search for patterns by keyword or category
	 */
	queryPatterns(keyword?: string, category?: string): Pattern[] {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		let patterns = learnings.patterns;
		
		if (keyword) {
			const lowerKeyword = keyword.toLowerCase();
			patterns = patterns.filter(p => 
				p.name.toLowerCase().includes(lowerKeyword) ||
				p.description?.toLowerCase().includes(lowerKeyword) ||
				p.category.toLowerCase().includes(lowerKeyword)
			);
		}
		
		if (category) {
			patterns = patterns.filter(p => p.category === category);
		}
		
		return patterns;
	}
	
	/**
	 * Get pattern by ID
	 */
	getPattern(patternId: string): Pattern | null {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		return learnings.patterns.find(p => p.id === patternId) || null;
	}
	
	/**
	 * Query conventions by area
	 */
	queryConventions(area?: string): any[] {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		if (area) {
			return learnings.conventions.filter(c => c.area === area);
		}
		return learnings.conventions;
	}
	
	/**
	 * Get gotchas by category or severity
	 */
	queryGotchas(category?: string, minSeverity?: string): any[] {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		let gotchas = learnings.gotchas;
		
		if (category) {
			gotchas = gotchas.filter(g => g.category === category);
		}
		
		if (minSeverity === 'high') {
			gotchas = gotchas.filter(g => g.severity === 'high');
		}
		
		return gotchas;
	}
	
	/**
	 * Get current context
	 */
	getContext(): Context {
		return readJSON<Context>(CONTEXT_FILE);
	}
	
	/**
	 * Search for relevant knowledge based on query
	 */
	search(query: string): {
		patterns: Pattern[];
		conventions: any[];
		gotchas: any[];
	} {
		const lowerQuery = query.toLowerCase();
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		
		// Search patterns
		const patterns = learnings.patterns.filter(p =>
			p.name.toLowerCase().includes(lowerQuery) ||
			p.description?.toLowerCase().includes(lowerQuery) ||
			p.category.toLowerCase().includes(lowerQuery)
		);
		
		// Search conventions
		const conventions = learnings.conventions.filter((c: any) =>
			c.area.toLowerCase().includes(lowerQuery) ||
			c.rule.toLowerCase().includes(lowerQuery)
		);
		
		// Search gotchas
		const gotchas = learnings.gotchas.filter((g: any) =>
			g.description.toLowerCase().includes(lowerQuery) ||
			g.category.toLowerCase().includes(lowerQuery)
		);
		
		return { patterns, conventions, gotchas };
	}
	
	// Update operations
	
	/**
	 * Update current session context
	 */
	updateSession(updates: Partial<Context['current_session']>): void {
		const context = readJSON<Context>(CONTEXT_FILE);
		context.current_session = {
			...context.current_session,
			...updates,
		};
		writeJSON(CONTEXT_FILE, context);
		
		// Log to history
		appendJSONL(HISTORY_FILE, {
			timestamp: new Date().toISOString(),
			type: 'session_update',
			updates,
		});
	}
	
	/**
	 * Add file to current session's touched files
	 */
	addTouchedFile(filepath: string): void {
		const context = readJSON<Context>(CONTEXT_FILE);
		if (!context.current_session.files_touched.includes(filepath)) {
			context.current_session.files_touched.push(filepath);
			writeJSON(CONTEXT_FILE, context);
		}
	}
	
	/**
	 * Update statistics
	 */
	updateStats(updates: Partial<Context['statistics']>): void {
		const context = readJSON<Context>(CONTEXT_FILE);
		context.statistics = {
			...context.statistics,
			...updates,
		};
		writeJSON(CONTEXT_FILE, context);
	}
	
	/**
	 * Add a new learning (pattern)
	 */
	addPattern(pattern: Omit<Pattern, 'usage_count' | 'last_updated'>): void {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		
		const newPattern: Pattern = {
			...pattern,
			usage_count: 0,
			last_updated: new Date().toISOString().split('T')[0],
		};
		
		learnings.patterns.push(newPattern);
		writeJSON(LEARNINGS_FILE, learnings);
		
		// Update context stats
		const context = readJSON<Context>(CONTEXT_FILE);
		context.statistics.patterns_learned++;
		writeJSON(CONTEXT_FILE, context);
		
		// Log to history
		appendJSONL(HISTORY_FILE, {
			timestamp: new Date().toISOString(),
			type: 'pattern_added',
			pattern_id: pattern.id,
			pattern_name: pattern.name,
		});
	}
	
	/**
	 * Increment pattern usage count
	 */
	usePattern(patternId: string): void {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		const pattern = learnings.patterns.find(p => p.id === patternId);
		
		if (pattern) {
			pattern.usage_count++;
			pattern.last_updated = new Date().toISOString().split('T')[0];
			writeJSON(LEARNINGS_FILE, learnings);
		}
	}
	
	/**
	 * Add a gotcha (common mistake)
	 */
	addGotcha(gotcha: any): void {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		learnings.gotchas.push({
			...gotcha,
			occurrences: 1,
			last_encountered: new Date().toISOString().split('T')[0],
		});
		writeJSON(LEARNINGS_FILE, learnings);
		
		// Log to history
		appendJSONL(HISTORY_FILE, {
			timestamp: new Date().toISOString(),
			type: 'gotcha_added',
			gotcha_id: gotcha.id,
		});
	}
	
	/**
	 * Record a completed implementation
	 */
	recordImplementation(implementation: {
		feature: string;
		patterns_used: string[];
		files_changed: string[];
		success: boolean;
	}): void {
		const context = readJSON<Context>(CONTEXT_FILE);
		
		// Add to recent implementations
		context.recent_implementations.unshift({
			date: new Date().toISOString().split('T')[0],
			...implementation,
		});
		
		// Keep only last 10
		context.recent_implementations = context.recent_implementations.slice(0, 10);
		
		// Update stats
		context.statistics.total_implementations++;
		if (implementation.success) {
			context.statistics.successful_implementations++;
		}
		
		writeJSON(CONTEXT_FILE, context);
		
		// Increment usage count for patterns used
		implementation.patterns_used.forEach(patternId => {
			this.usePattern(patternId);
		});
		
		// Log to history
		appendJSONL(HISTORY_FILE, {
			timestamp: new Date().toISOString(),
			type: 'implementation_completed',
			...implementation,
		});
	}
	
	// Display operations
	
	/**
	 * Display current context summary
	 */
	displayContext(): void {
		const context = readJSON<Context>(CONTEXT_FILE);
		
		console.log('\n📊 Current Context\n');
		console.log('Session:', context.current_session.session_id);
		console.log('Working on:', context.current_session.working_on);
		console.log('Branch:', context.current_session.branch || 'N/A');
		console.log('Files touched:', context.current_session.files_touched.length);
		console.log('\n📈 Statistics\n');
		console.log('Total implementations:', context.statistics.total_implementations);
		console.log('Successful:', context.statistics.successful_implementations);
		console.log('Patterns learned:', context.statistics.patterns_learned);
		console.log('Code examples:', context.statistics.code_examples_added);
		console.log('\n');
	}
	
	/**
	 * Display learnings summary
	 */
	displayLearnings(): void {
		const learnings = readJSON<Learnings>(LEARNINGS_FILE);
		
		console.log('\n🎓 Learnings Summary\n');
		console.log(`Patterns: ${learnings.patterns.length}`);
		console.log(`Gotchas: ${learnings.gotchas.length}`);
		console.log(`Conventions: ${learnings.conventions.length}`);
		console.log(`Templates: ${learnings.implementation_templates.length}`);
		
		console.log('\n📚 Most Used Patterns:\n');
		const topPatterns = [...learnings.patterns]
			.sort((a, b) => b.usage_count - a.usage_count)
			.slice(0, 5);
		
		topPatterns.forEach((p, i) => {
			console.log(`${i + 1}. ${p.name} (used ${p.usage_count} times)`);
		});
		console.log('\n');
	}
}

// CLI Interface
function main() {
	const manager = new MemoryManager();
	const args = process.argv.slice(2);
	const command = args[0];
	
	try {
		switch (command) {
			case 'context':
				manager.displayContext();
				break;
			
			case 'learnings':
				manager.displayLearnings();
				break;
			
			case 'search':
				const query = args[1];
				if (!query) {
					console.error('Error: Please provide a search query');
					process.exit(1);
				}
				const results = manager.search(query);
				console.log('\n🔍 Search Results\n');
				console.log(`Patterns: ${results.patterns.length}`);
				console.log(`Conventions: ${results.conventions.length}`);
				console.log(`Gotchas: ${results.gotchas.length}`);
				console.log('\nDetails:');
				console.log(JSON.stringify(results, null, 2));
				break;
			
			case 'patterns':
				const category = args[1];
				const patterns = manager.queryPatterns(undefined, category);
				console.log('\n📋 Patterns\n');
				patterns.forEach(p => {
					console.log(`- ${p.name} (${p.category})`);
					console.log(`  ${p.description || ''}`);
					console.log(`  Used: ${p.usage_count} times\n`);
				});
				break;
			
			case 'conventions':
				const area = args[1];
				const conventions = manager.queryConventions(area);
				console.log('\n📜 Conventions\n');
				conventions.forEach((c: any) => {
					console.log(`- [${c.area}] ${c.rule}`);
				});
				console.log('\n');
				break;
			
			case 'gotchas':
				const gotchas = manager.queryGotchas();
				console.log('\n⚠️  Gotchas\n');
				gotchas.forEach((g: any) => {
					console.log(`- [${g.severity}] ${g.description}`);
					console.log(`  Solution: ${g.solution}\n`);
				});
				break;
			
			case 'help':
			default:
				console.log(`
n8n Specialist AI - Memory Manager

Usage:
  node memory-manager.ts <command> [args]

Commands:
  context              Display current session context
  learnings            Display learnings summary
  search <query>       Search knowledge base
  patterns [category]  List patterns (optionally by category)
  conventions [area]   List conventions (optionally by area)
  gotchas              List known gotchas
  help                 Show this help message

Examples:
  node memory-manager.ts context
  node memory-manager.ts search "node creation"
  node memory-manager.ts patterns nodes
  node memory-manager.ts conventions error-handling
				`);
		}
	} catch (error) {
		console.error('Error:', error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Export for use as module
export { MemoryManager, Context, Pattern, Learnings };

// Run CLI if executed directly
if (require.main === module) {
	main();
}
