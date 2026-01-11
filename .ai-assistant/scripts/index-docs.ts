#!/usr/bin/env node
/**
 * Documentation Indexer for n8n Specialist AI System
 * 
 * This script indexes documentation files from the n8n repository:
 * - AGENTS.md, CLAUDE.md
 * - Package READMEs
 * - Backend module guides
 * - Testing guides
 * 
 * It extracts key information and stores it in structured format
 * for efficient retrieval by the RAG system.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

// Paths
const REPO_ROOT = join(__dirname, '..', '..');
const AI_ASSISTANT_DIR = join(__dirname, '..');
const KNOWLEDGE_BASE_DIR = join(AI_ASSISTANT_DIR, 'knowledge-base', 'documentation');

// Documentation files to index
const DOC_FILES = [
	'AGENTS.md',
	'CLAUDE.md',
	'packages/cli/BREAKING-CHANGES.md',
	'packages/nodes-base/AGENTS.md',
	'packages/nodes-base/CLAUDE.md',
	'packages/nodes-base/TESTING.MD',
	'packages/nodes-base/TESTING_PROMPT.md',
	'packages/frontend/AGENTS.md',
	'packages/frontend/CLAUDE.md',
	'scripts/backend-module/backend-module-guide.md',
];

interface DocumentIndex {
	filepath: string;
	title: string;
	category: string;
	size: number;
	lines: number;
	last_indexed: string;
	sections: {
		heading: string;
		level: number;
		line_start: number;
		line_end: number;
		content_preview: string;
	}[];
	keywords: string[];
}

interface IndexResult {
	indexed_at: string;
	total_documents: number;
	total_sections: number;
	documents: DocumentIndex[];
}

class DocumentationIndexer {
	private result: IndexResult = {
		indexed_at: new Date().toISOString(),
		total_documents: 0,
		total_sections: 0,
		documents: [],
	};
	
	/**
	 * Parse markdown file and extract sections
	 */
	private parseMarkdown(filepath: string, content: string): DocumentIndex {
		const lines = content.split('\n');
		const sections: DocumentIndex['sections'] = [];
		let currentSection: { heading: string; level: number; line_start: number } | null = null;
		
		lines.forEach((line, index) => {
			const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
			
			if (headingMatch) {
				// Close previous section
				if (currentSection) {
					const sectionLines = lines.slice(currentSection.line_start, index);
					sections.push({
						...currentSection,
						line_end: index - 1,
						content_preview: sectionLines.slice(0, 3).join('\n').substring(0, 200),
					});
				}
				
				// Start new section
				currentSection = {
					heading: headingMatch[2],
					level: headingMatch[1].length,
					line_start: index,
				};
			}
		});
		
		// Close last section
		if (currentSection) {
			const sectionLines = lines.slice(currentSection.line_start);
			sections.push({
				...currentSection,
				line_end: lines.length - 1,
				content_preview: sectionLines.slice(0, 3).join('\n').substring(0, 200),
			});
		}
		
		// Extract keywords (simple approach: look for capitalized words, tech terms)
		const keywords = new Set<string>();
		const techTerms = ['TypeScript', 'Vue', 'Node.js', 'pnpm', 'Jest', 'Vitest', 'Playwright', 'DI', 'API', 'REST', 'GraphQL'];
		
		content.split(/\s+/).forEach(word => {
			// Add tech terms
			if (techTerms.some(term => word.includes(term))) {
				keywords.add(word);
			}
			// Add capitalized words (likely important terms)
			if (/^[A-Z][a-z]+/.test(word) && word.length > 3) {
				keywords.add(word);
			}
		});
		
		// Determine category from filepath
		let category = 'general';
		if (filepath.includes('nodes-base')) category = 'nodes';
		else if (filepath.includes('cli')) category = 'backend';
		else if (filepath.includes('frontend') || filepath.includes('editor-ui')) category = 'frontend';
		else if (filepath.includes('testing') || filepath.includes('TESTING')) category = 'testing';
		else if (filepath.includes('backend-module')) category = 'backend';
		
		// Extract title (first h1 or filename)
		const titleMatch = content.match(/^#\s+(.+)$/m);
		const title = titleMatch ? titleMatch[1] : filepath.split('/').pop() || filepath;
		
		return {
			filepath: relative(REPO_ROOT, filepath),
			title,
			category,
			size: content.length,
			lines: lines.length,
			last_indexed: new Date().toISOString(),
			sections,
			keywords: Array.from(keywords).slice(0, 20), // Top 20 keywords
		};
	}
	
	/**
	 * Index a single documentation file
	 */
	private indexFile(filepath: string): DocumentIndex | null {
		const fullPath = join(REPO_ROOT, filepath);
		
		if (!existsSync(fullPath)) {
			console.warn(`⚠️  File not found: ${filepath}`);
			return null;
		}
		
		try {
			const content = readFileSync(fullPath, 'utf-8');
			const index = this.parseMarkdown(fullPath, content);
			
			console.log(`✓ Indexed: ${filepath} (${index.sections.length} sections)`);
			
			return index;
		} catch (error) {
			console.error(`✗ Error indexing ${filepath}:`, error);
			return null;
		}
	}
	
	/**
	 * Index all documentation files
	 */
	public indexAll(): IndexResult {
		console.log('📚 Starting documentation indexing...\n');
		
		DOC_FILES.forEach(filepath => {
			const index = this.indexFile(filepath);
			if (index) {
				this.result.documents.push(index);
				this.result.total_sections += index.sections.length;
			}
		});
		
		this.result.total_documents = this.result.documents.length;
		
		console.log(`\n✅ Indexing complete!`);
		console.log(`   Documents: ${this.result.total_documents}`);
		console.log(`   Sections: ${this.result.total_sections}`);
		
		return this.result;
	}
	
	/**
	 * Save index to file
	 */
	public saveIndex(outputPath: string): void {
		writeFileSync(outputPath, JSON.stringify(this.result, null, 2) + '\n', 'utf-8');
		console.log(`\n💾 Index saved to: ${relative(REPO_ROOT, outputPath)}`);
	}
	
	/**
	 * Search indexed documents
	 */
	public static searchIndex(indexPath: string, query: string): {
		documents: DocumentIndex[];
		sections: Array<{ document: string; section: any }>;
	} {
		const index: IndexResult = JSON.parse(readFileSync(indexPath, 'utf-8'));
		const lowerQuery = query.toLowerCase();
		
		// Search in document titles and keywords
		const matchingDocs = index.documents.filter(doc =>
			doc.title.toLowerCase().includes(lowerQuery) ||
			doc.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
			doc.category.toLowerCase().includes(lowerQuery)
		);
		
		// Search in section headings
		const matchingSections: Array<{ document: string; section: any }> = [];
		index.documents.forEach(doc => {
			doc.sections.forEach(section => {
				if (section.heading.toLowerCase().includes(lowerQuery) ||
					section.content_preview.toLowerCase().includes(lowerQuery)) {
					matchingSections.push({
						document: doc.filepath,
						section,
					});
				}
			});
		});
		
		return {
			documents: matchingDocs,
			sections: matchingSections,
		};
	}
}

// CLI
function main() {
	const args = process.argv.slice(2);
	const command = args[0];
	
	const indexPath = join(KNOWLEDGE_BASE_DIR, 'docs-index.json');
	
	if (command === 'search') {
		const query = args.slice(1).join(' ');
		if (!query) {
			console.error('Error: Please provide a search query');
			process.exit(1);
		}
		
		if (!existsSync(indexPath)) {
			console.error('Error: Index not found. Run without arguments to create index first.');
			process.exit(1);
		}
		
		const results = DocumentationIndexer.searchIndex(indexPath, query);
		console.log(`\n🔍 Search results for: "${query}"\n`);
		console.log(`Documents: ${results.documents.length}`);
		console.log(`Sections: ${results.sections.length}\n`);
		
		if (results.documents.length > 0) {
			console.log('📄 Matching Documents:');
			results.documents.forEach(doc => {
				console.log(`  - ${doc.title} (${doc.filepath})`);
			});
			console.log('');
		}
		
		if (results.sections.length > 0) {
			console.log('📋 Matching Sections:');
			results.sections.slice(0, 10).forEach(({ document, section }) => {
				console.log(`  - ${section.heading}`);
				console.log(`    in ${document} (lines ${section.line_start}-${section.line_end})`);
			});
			if (results.sections.length > 10) {
				console.log(`  ... and ${results.sections.length - 10} more`);
			}
		}
	} else {
		// Index mode
		const indexer = new DocumentationIndexer();
		const result = indexer.indexAll();
		indexer.saveIndex(indexPath);
		
		console.log('\n📊 Index Statistics:');
		console.log(`   Total size: ${(result.documents.reduce((sum, d) => sum + d.size, 0) / 1024).toFixed(2)} KB`);
		console.log(`   Avg sections per doc: ${(result.total_sections / result.total_documents).toFixed(1)}`);
		
		// Category breakdown
		const categories = new Map<string, number>();
		result.documents.forEach(doc => {
			categories.set(doc.category, (categories.get(doc.category) || 0) + 1);
		});
		
		console.log('\n📚 By Category:');
		categories.forEach((count, category) => {
			console.log(`   ${category}: ${count} documents`);
		});
	}
}

// Export for use as module
export { DocumentationIndexer, DocumentIndex, IndexResult };

// Run CLI if executed directly
if (require.main === module) {
	main();
}
