class TerminalHandler {
    constructor() {
        this.term = null;
        this.fitAddon = null;
        this.socket = null;
        this.isConnected = false;
        this.commandHistory = [];
        this.historyIndex = 0;
    }

    async initialize() {
        // Load required addons
        await this.loadAddons();
        
        this.term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            theme: {
                background: '#000000',
                foreground: '#ffffff',
                cursor: '#ffffff',
                selection: 'rgba(255, 255, 255, 0.3)',
                black: '#000000',
                red: '#e06c75',
                green: '#98c379',
                yellow: '#d19a66',
                blue: '#61afef',
                magenta: '#c678dd',
                cyan: '#56b6c2',
                white: '#abb2bf'
            },
            scrollback: 1000,
            rows: 20
        });

        // Open terminal in container
        const terminalElement = document.getElementById('terminal');
        this.term.open(terminalElement);

        // Initialize terminal size
        this.fitAddon.fit();

        // Setup event listeners
        this.setupEventListeners();
        
        // Write welcome message
        this.writeWelcomeMessage();
    }

    async loadAddons() {
        // Initialize FitAddon
        this.fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(this.fitAddon);
    }

    setupEventListeners() {
        // Handle terminal input
        let currentLine = '';
        let cursorPosition = 0;

        this.term.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.keyCode === 13) { // Enter
                this.handleCommand(currentLine);
                currentLine = '';
                cursorPosition = 0;
                this.term.write('\r\n$ ');
            } else if (domEvent.keyCode === 8) { // Backspace
                if (cursorPosition > 0) {
                    currentLine = currentLine.slice(0, -1);
                    cursorPosition--;
                    this.term.write('\b \b');
                }
            } else if (printable) {
                currentLine += key;
                cursorPosition++;
                this.term.write(key);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.fitAddon.fit();
        });

        // Handle terminal container toggle
        const terminalBtn = document.getElementById('terminalBtn');
        const terminalContainer = document.getElementById('terminalContainer');
        
        terminalBtn.addEventListener('click', () => {
            terminalContainer.classList.toggle('hidden');
            if (!terminalContainer.classList.contains('hidden')) {
                setTimeout(() => {
                    this.fitAddon.fit();
                }, 0);
            }
        });
    }

    writeWelcomeMessage() {
        const welcomeMessage = [
            '\x1b[1;32m╔════════════════════════════════════════╗',
            '║  Welcome to Tablet Code Editor Terminal  ║',
            '║  Type "help" for available commands     ║',
            '╚════════════════════════════════════════╝\x1b[0m',
            ''
        ].join('\r\n');

        this.term.writeln(welcomeMessage);
        this.term.write('$ ');
    }

    async handleCommand(command) {
        command = command.trim();
        
        if (!command) return;

        // Add command to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        // Handle built-in commands
        switch (command) {
            case 'clear':
                this.term.clear();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'ssh':
                await this.showSSHPrompt();
                break;
            default:
                if (this.isConnected && this.socket) {
                    // Send command to SSH session
                    this.socket.send(JSON.stringify({ type: 'command', data: command }));
                } else {
                    this.term.writeln(`\r\nCommand not found: ${command}`);
                }
        }
    }

    showHelp() {
        const helpText = [
            '\r\nAvailable Commands:',
            '  clear     Clear the terminal screen',
            '  help      Show this help message',
            '  ssh       Connect to remote server via SSH',
            ''
        ].join('\r\n');

        this.term.writeln(helpText);
    }

    async showSSHPrompt() {
        if (this.isConnected) {
            this.term.writeln('\r\nAlready connected to SSH. Type "exit" to disconnect.');
            return;
        }

        this.term.writeln('\r\nSSH Connection (Coming Soon)');
        this.term.writeln('This feature will allow secure SSH connections to remote servers.');
        this.term.writeln('Features will include:');
        this.term.writeln('- Secure key-based authentication');
        this.term.writeln('- Connection management');
        this.term.writeln('- Multiple session support');
        this.term.writeln('- Command history');
        this.term.writeln('- Auto-completion');
    }

    // Public methods
    clear() {
        this.term.clear();
    }

    write(text) {
        this.term.write(text);
    }

    writeln(text) {
        this.term.writeln(text);
    }
}

// Export the terminal handler class
window.TerminalHandler = TerminalHandler;
