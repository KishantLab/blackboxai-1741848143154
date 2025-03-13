class CodeEditor {
    constructor() {
        this.editor = null;
        this.currentLanguage = 'javascript';
        this.currentTheme = 'vs-dark';
        this.supportedLanguages = [
            'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
            'html', 'css', 'json', 'markdown', 'php', 'ruby', 'sql'
        ];
    }

    async initialize() {
        try {
            // Create editor instance
            this.editor = monaco.editor.create(document.getElementById('editorContainer'), {
                value: '// Welcome to Tablet Code Editor\n// Start coding here...',
                language: this.currentLanguage,
                theme: this.currentTheme,
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                roundedSelection: false,
                padding: { top: 10, bottom: 10 },
                tabSize: 2,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                contextmenu: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                formatOnType: true,
                formatOnPaste: true,
                renderWhitespace: 'selection',
                scrollbar: {
                    useShadows: false,
                    verticalHasArrows: true,
                    horizontalHasArrows: true,
                    vertical: 'visible',
                    horizontal: 'visible',
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                }
            });

            // Register basic language completions
            this.setupLanguageSupport();
            this.setupTouchSupport();

            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.editor) {
                    this.editor.layout();
                }
            });

            return true;
        } catch (error) {
            console.error('Editor initialization error:', error);
            return false;
        }
    }

    setupLanguageSupport() {
        // Register basic language completions
        this.supportedLanguages.forEach(language => {
            monaco.languages.registerCompletionItemProvider(language, {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };

                    // Basic snippets for demonstration
                    const suggestions = [
                        {
                            label: 'function',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Function snippet',
                            range: range
                        },
                        {
                            label: 'class',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'class ${1:name} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Class snippet',
                            range: range
                        },
                        {
                            label: 'console.log',
                            kind: monaco.languages.CompletionItemKind.Method,
                            insertText: 'console.log(${1:value});',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Log to console',
                            range: range
                        }
                    ];

                    return { suggestions };
                }
            });
        });
    }

    setupTouchSupport() {
        const editorElement = document.getElementById('editorContainer');
        
        // Handle touch scrolling
        let touchStartY = 0;
        editorElement.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        editorElement.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            
            const scrollPosition = this.editor.getScrollTop();
            this.editor.setScrollTop(scrollPosition + deltaY);
            
            touchStartY = touchY;
        });

        // Prevent zoom gesture
        editorElement.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }

    // Public methods
    setLanguage(language) {
        if (this.supportedLanguages.includes(language)) {
            const model = this.editor.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, language);
                this.currentLanguage = language;
            }
        }
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme === 'light' ? 'vs' : 'vs-dark';
            monaco.editor.setTheme(this.currentTheme);
        }
    }

    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    setValue(content) {
        if (this.editor) {
            this.editor.setValue(content || '');
        }
    }

    format() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
        }
    }
}

// Export the editor class
window.CodeEditor = CodeEditor;
