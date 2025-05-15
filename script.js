function addPointType() {
    const container = document.getElementById('pointsContainer');
    const div = document.createElement('div');
    div.innerHTML = `
    <input placeholder="Point Type (e.g., Power)" />
    <input placeholder="Value (e.g., 10)" type="number" />
    <button onclick="this.parentElement.remove()">Remove</button>
  `;
    container.appendChild(div);
}

function addCategory() {
    const container = document.getElementById('categoriesContainer');
    const div = document.createElement('div');
    div.classList.add('category');
    div.innerHTML = `
    <label>Category Name: <input placeholder="e.g., Abilities" /></label>
    <label>Requires Option ID(s) (comma-separated): <input /></label>
    <div class="options"></div>
    <button onclick="addOption(this)">+ Add Option</button>
    <button onclick="this.parentElement.remove()">Remove Category</button>
  `;
    container.appendChild(div);
}

function addOption(button) {
    const optionsDiv = button.parentElement.querySelector('.options');
    const div = document.createElement('div');
    div.classList.add('option');
    div.innerHTML = `
    <label>Label: <input placeholder="e.g., Super Strength" oninput="updateAutoId(this)" /></label>
    <label><em>ID will auto-generate from label</em>: <span class="auto-id"></span></label>
    <label>Cost (JSON): <input placeholder='{"Power": 3}' /></label>
    <label>Image URL: <input /></label>
    <label>Description: <textarea></textarea></label>
    <label>Prerequisites (comma-separated Labels): <input /></label>
    <label>Conflicts With (comma-separated Labels): <input /></label>
    <label>Max Selections: <input type="number" placeholder="1" /></label>
    <button onclick="this.parentElement.remove()">Remove Option</button>
  `;
    optionsDiv.appendChild(div);
}

function updateAutoId(input) {
    const label = input.value.trim();
    const id = toId(label);
    const autoIdSpan = input.parentElement.parentElement.querySelector('.auto-id');
    autoIdSpan.textContent = id;
}

function toId(str) {
    return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^[0-9]+/, '')
        .replace(/^./, s => s.toLowerCase());
}

function exportJson() {
    const result = [];

    // Metadata
    const title = document.getElementById('titleInput').value;
    if (title) result.push({ type: "title", text: title });

    const desc = document.getElementById('descriptionInput').value;
    if (desc) result.push({ type: "description", text: desc });

    const headerImage = document.getElementById('headerImageInput').value;
    if (headerImage) result.push({ type: "headerImage", url: headerImage });

    // Points
    const pointEntries = document.querySelectorAll('#pointsContainer > div');
    const points = {};
    pointEntries.forEach(entry => {
        const [keyInput, valInput] = entry.querySelectorAll('input');
        const key = keyInput.value.trim();
        const val = parseInt(valInput.value, 10);
        if (key && !isNaN(val)) points[key] = val;
    });
    if (Object.keys(points).length) result.push({ type: "points", values: points });

    // Categories
    document.querySelectorAll('.category').forEach(catDiv => {
        const catName = catDiv.querySelector('input').value.trim();
        const requiresInput = catDiv.querySelectorAll('input')[1].value.trim();
        const requires = requiresInput ? requiresInput.split(',').map(s => toId(s.trim())) : [];

        const options = [];
        catDiv.querySelectorAll('.option').forEach(optDiv => {
            const inputs = optDiv.querySelectorAll('input, textarea');
            const label = inputs[0].value.trim();
            const id = toId(label);
            const cost = JSON.parse(inputs[1].value || '{}');
            const img = inputs[2].value.trim();
            const desc = inputs[3].value.trim();

            const prereq = inputs[4].value.trim();
            const conflicts = inputs[5].value.trim();
            const maxSel = inputs[6].value;

            const opt = { id, label, cost, img, description: desc };

            if (prereq) opt.prerequisites = prereq.split(',').map(s => toId(s.trim()));
            if (conflicts) opt.conflictsWith = conflicts.split(',').map(s => toId(s.trim()));
            if (maxSel) opt.maxSelections = parseInt(maxSel, 10);

            options.push(opt);
        });

        const catEntry = { name: catName, options };
        if (requires.length) catEntry.requiresOption = requires;
        result.push(catEntry);
    });

    document.getElementById('outputJson').value = JSON.stringify(result, null, 2);
}
