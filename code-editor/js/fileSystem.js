class FileSystem {
    constructor() {
        this.currentPath = '/';
        this.fileTree = document.getElementById('fileTree');
        this.files = new Map();
        this.activeFile = null;
    }

    initialize() {
        this.setupEventListeners();
        this.createDefaultWorkspace();
        this.renderFileTree();
    }

    setupEventListeners() {
        // New File Button
        const newFileBtn = document.querySelector('#sidebar button');
        newFileBtn.addEventListener('click', () => this.createNewFile());

        // Context Menu for File Tree
        this.fileTree.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const target = e.target.closest('.file-item');
            if (target) {
                this.showContextMenu(e.pageX, e.pageY, target.dataset.path);
            }
        });
    }

    createDefaultWorkspace() {
        // Initialize with some default files
        this.files.set('index.html', {
            type: 'file',
            content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n  <h1>Welcome!</h1>\n</body>\n</html>',
            language: 'html'
        });

        this.files.set('styles.css', {
            type: 'file',
            content: '/* Your styles here */\n\nbody {\n  margin: 0;\n  padding: 20px;\n  font-family: Arial, sans-serif;\n}',
            language: 'css'
        });

        this.files.set('script.js', {
            type: 'file',
            content: '// Your JavaScript code here\n\nconsole.log("Hello, World!");',
            language: 'javascript'
        });
    }

    renderFileTree() {
        this.fileTree.innerHTML = '';
        
        // Sort files by name and type (directories first)
        const sortedFiles = Array.from(this.files.entries())
            .sort(([aName, a], [bName, b]) => {
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                return aName.localeCompare(bName);
            });

        for (const [path, file] of sortedFiles) {
            const item = this.createFileTreeItem(path, file);
            this.fileTree.appendChild(item);
        }
    }

    createFileTreeItem(path, file) {
        const item = document.createElement('div');
        item.className = 'file-item flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer text-gray-300';
        item.dataset.path = path;

        // Icon
        const icon = document.createElement('i');
        icon.className = this.getFileIcon(file.type, path);
        icon.style.marginRight = '8px';
        item.appendChild(icon);

        // Name
        const name = document.createElement('span');
        name.textContent = path;
        item.appendChild(name);

        // Click handler
        item.addEventListener('click', () => this.openFile(path));

        return item;
    }

    getFileIcon(type, path) {
        if (type === 'directory') {
            return 'fas fa-folder text-yellow-400';
        }

        // File icons based on extension
        const extension = path.split('.').pop().toLowerCase();
        switch (extension) {
            case 'html':
                return 'fab fa-html5 text-orange-500';
            case 'css':
                return 'fab fa-css3-alt text-blue-500';
            case 'js':
                return 'fab fa-js text-yellow-400';
            case 'json':
                return 'fas fa-code text-green-400';
            case 'md':
                return 'fas fa-file-alt text-blue-300';
            default:
                return 'fas fa-file text-gray-400';
        }
    }

    async createNewFile() {
        const fileName = await this.showPrompt('Enter file name:');
        if (!fileName) return;

        if (this.files.has(fileName)) {
            this.showError('File already exists!');
            return;
        }

        const extension = fileName.split('.').pop().toLowerCase();
        let defaultContent = '';
        let language = 'text';

        // Set default content based on file type
        switch (extension) {
            case 'html':
                defaultContent = '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Page</title>\n</head>\n<body>\n\n</body>\n</html>';
                language = 'html';
                break;
            case 'css':
                defaultContent = '/* Styles for ' + fileName + ' */';
                language = 'css';
                break;
            case 'js':
                defaultContent = '// JavaScript code for ' + fileName;
                language = 'javascript';
                break;
        }

        this.files.set(fileName, {
            type: 'file',
            content: defaultContent,
            language: language
        });

        this.renderFileTree();
        this.openFile(fileName);
    }

    async openFile(path) {
        const file = this.files.get(path);
        if (!file) return;

        this.activeFile = path;

        // Update editor content and language
        if (window.editor) {
            window.editor.setLanguage(file.language);
            window.editor.setValue(file.content);
        }

        // Update active file visual indication
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('bg-gray-700', item.dataset.path === path);
        });
    }

    saveCurrentFile() {
        if (!this.activeFile || !window.editor) return;

        const content = window.editor.getValue();
        const file = this.files.get(this.activeFile);
        if (file) {
            file.content = content;
        }
    }

    showContextMenu(x, y, path) {
        // Remove any existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'context-menu absolute bg-gray-800 border border-gray-700 rounded shadow-lg z-50';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        const menuItems = [
            { label: 'Rename', icon: 'fas fa-pencil-alt', action: () => this.renameFile(path) },
            { label: 'Delete', icon: 'fas fa-trash', action: () => this.deleteFile(path) },
            { label: 'Download', icon: 'fas fa-download', action: () => this.downloadFile(path) }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center';
            
            const icon = document.createElement('i');
            icon.className = item.icon + ' mr-2';
            menuItem.appendChild(icon);

            const label = document.createElement('span');
            label.textContent = item.label;
            menuItem.appendChild(label);

            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });

            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // Close menu on click outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }

    async renameFile(path) {
        const newName = await this.showPrompt('Enter new name:', path);
        if (!newName || newName === path) return;

        if (this.files.has(newName)) {
            this.showError('File already exists!');
            return;
        }

        const file = this.files.get(path);
        this.files.delete(path);
        this.files.set(newName, file);

        if (this.activeFile === path) {
            this.activeFile = newName;
        }

        this.renderFileTree();
    }

    async deleteFile(path) {
        if (await this.showConfirm(`Delete ${path}?`)) {
            this.files.delete(path);
            if (this.activeFile === path) {
                this.activeFile = null;
                if (window.editor) {
                    window.editor.setValue('');
                }
            }
            this.renderFileTree();
        }
    }

    downloadFile(path) {
        const file = this.files.get(path);
        if (!file) return;

        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = path;
        a.click();
        URL.revokeObjectURL(url);
    }

    // UI Helpers
    async showPrompt(message, defaultValue = '') {
        return new Promise(resolve => {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
            dialog.innerHTML = `
                <div class="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h3 class="text-lg font-semibold mb-4">${message}</h3>
                    <input type="text" class="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded" value="${defaultValue}">
                    <div class="flex justify-end space-x-2">
                        <button class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                        <button class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">OK</button>
                    </div>
                </div>
            `;

            const input = dialog.querySelector('input');
            const [cancelBtn, okBtn] = dialog.querySelectorAll('button');

            cancelBtn.onclick = () => {
                dialog.remove();
                resolve(null);
            };

            okBtn.onclick = () => {
                dialog.remove();
                resolve(input.value.trim());
            };

            input.onkeyup = (e) => {
                if (e.key === 'Enter') okBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            };

            document.body.appendChild(dialog);
            input.select();
        });
    }

    async showConfirm(message) {
        return new Promise(resolve => {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
            dialog.innerHTML = `
                <div class="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h3 class="text-lg font-semibold mb-4">${message}</h3>
                    <div class="flex justify-end space-x-2">
                        <button class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                        <button class="px-4 py-2 bg-red-600 rounded hover:bg-red-500">Delete</button>
                    </div>
                </div>
            `;

            const [cancelBtn, confirmBtn] = dialog.querySelectorAll('button');

            cancelBtn.onclick = () => {
                dialog.remove();
                resolve(false);
            };

            confirmBtn.onclick = () => {
                dialog.remove();
                resolve(true);
            };

            document.body.appendChild(dialog);
        });
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Export the file system class
window.FileSystem = FileSystem;
