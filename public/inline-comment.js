// public/inline-comment.js

document.addEventListener('mouseup', function () {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        showContextMenu(selectedText);
    } else {
        hideContextMenu();
    }
});

function showContextMenu(selectedText) {
    // Implement your context menu logic here
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'block';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.selectedText = selectedText; // Store the selected text
}

function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'none';
}
