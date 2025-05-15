let pointTypes = [];
let optionRegistry = [];

function toId(str) {
    return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^[0-9]+/, '')
        .replace(/^./, s => s.toLowerCase());
}

function addPointType() {
    const container = document.getElementById('pointsContainer');
    const div = document.createElement('div');
    div.innerHTML = `
    <input placeholder="Point Type (e.g., Power)" oninput="updatePointTypes()" />
    <input placeholder="Value (e.g., 10)" type="number" />
    <button onclick="this.parentElement.remove(); updatePointTypes()">Remove</button>
  `;
    container.appendChild(div);
}

function updatePointTypes() {
    pointTypes = [...document.querySelectorAll('#pointsContainer > div input:first-child')]
        .map(input => input.value.trim()).filter(Boolean);
}

function addCategory() {
    const container = document.getElementById('categoriesContainer');
    const div = document.createElement('div');
    div.classList.add('category');

    const header = document.createElement('div');
    header.classList.add('category-header');
    header.innerHTML = `
    <label>Category Name: <input placeholder="e.g., Abilities" /></label>
  `;

    const body = document.createElement('div');
    body.classList.add('category-body');
    body.innerHTML = `
    <label>Requires Option(s): <select multiple class="requiresSelect"></select></label>
    <div class="options"></div>
    <button onclick="addOption(this)">+ Add Option</button>
    <button onclick="this.parentElement.parentElement.remove(); refreshAllSelectMenus()">Remove Category</button>
  `;

    header.style.cursor = "pointer";
    header.onclick = () => {
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    div.appendChild(header);
    div.appendChild(body);
    container.appendChild(div);
    refreshAllSelectMenus();
}

function addOption(button) {
    const optionsDiv = button.parentElement.querySelector('.options');
    const wrapper = document.createElement('div');
    wrapper.classList.add('option');

    const header = document.createElement('div');
    header.classList.add('option-header');
    header.innerHTML = `
    <label>Label: <input placeholder="e.g., Super Strength" oninput="updateAutoId(this)" /></label>
    <label><em>ID:</em> <span class="auto-id"></span></label>
  `;
    header.style.cursor = "pointer";

    const body = document.createElement('div');
    body.classList.add('option-body');
    body.innerHTML = `
    <div class="costsContainer"></div>
    <button type="button" onclick="addCostRow(this)">+ Add Cost</button>

    <label>Image URL: <input /></label>
    <label>Description: <textarea></textarea></label>
    <label>Prerequisites: <select multiple class="prereqSelect"></select></label>
    <label>Conflicts With: <select multiple class="conflictSelect"></select></label>
    <label>Max Selections: <input type="number" placeholder="1" /></label>
    <button onclick="this.parentElement.parentElement.remove(); refreshAllSelectMenus()">Remove Option</button>
  `;

    header.onclick = () => {
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    optionsDiv.appendChild(wrapper);

    refreshAllSelectMenus();
    updatePointTypes();
}

function addCostRow(button) {
    const container = button.previousElementSibling;
    const costRow = document.createElement('div');

    const dropdown = document.createElement('select');
    pointTypes.forEach(pt => {
        const opt = document.createElement('option');
        opt.value = pt;
        opt.textContent = pt;
        dropdown.appendChild(opt);
    });

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.placeholder = 'e.g., 3';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => costRow.remove();

    costRow.appendChild(dropdown);
    costRow.appendChild(valueInput);
    costRow.appendChild(removeBtn);
    container.appendChild(costRow);
}

function updateAutoId(input) {
    const label = input.value.trim();
    const id = toId(label);
    const autoIdSpan = input.parentElement.parentElement.querySelector('.auto-id');
    autoIdSpan.textContent = id;
    refreshAllSelectMenus();
}

function refreshAllSelectMenus() {
    optionRegistry = Array.from(document.querySelectorAll('.option')).map(opt => {
        const label = opt.querySelector('input').value.trim();
        const id = toId(label);
        return { label, id, element: opt };
    });

    document.querySelectorAll('.category').forEach(categoryEl => {
        const thisOptions = Array.from(categoryEl.querySelectorAll('.option')).map(opt =>
            toId(opt.querySelector('input').value.trim())
        );
        const select = categoryEl.querySelector('.requiresSelect');
        const selected = Array.from(select.selectedOptions).map(opt => opt.value);

        select.innerHTML = '';
        optionRegistry.forEach(({ label, id }) => {
            if (!thisOptions.includes(id)) {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = label;
                if (selected.includes(id)) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });

    optionRegistry.forEach(({ label: currentLabel, id: currentId, element: currentElement }) => {
        const prereqSelect = currentElement.querySelector('.prereqSelect');
        const conflictSelect = currentElement.querySelector('.conflictSelect');

        const selectedPrereq = Array.from(prereqSelect.selectedOptions).map(opt => opt.value);
        const selectedConflict = Array.from(conflictSelect.selectedOptions).map(opt => opt.value);

        [prereqSelect, conflictSelect].forEach(select => {
            select.innerHTML = '';
            optionRegistry.forEach(({ label, id }) => {
                if (id !== currentId) {
                    const opt = document.createElement('option');
                    opt.value = id;
                    opt.textContent = label;
                    if ((select === prereqSelect && selectedPrereq.includes(id)) ||
                        (select === conflictSelect && selectedConflict.includes(id))) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                }
            });
        });
    });
}

function exportJson() {
    const result = [];

    const title = document.getElementById('titleInput').value;
    if (title) result.push({ type: "title", text: title });

    const desc = document.getElementById('descriptionInput').value;
    if (desc) result.push({ type: "description", text: desc });

    const headerImage = document.getElementById('headerImageInput').value;
    if (headerImage) result.push({ type: "headerImage", url: headerImage });

    const pointEntries = document.querySelectorAll('#pointsContainer > div');
    const points = {};
    pointEntries.forEach(entry => {
        const [keyInput, valInput] = entry.querySelectorAll('input');
        const key = keyInput.value.trim();
        const val = parseInt(valInput.value, 10);
        if (key && !isNaN(val)) points[key] = val;
    });
    if (Object.keys(points).length) result.push({ type: "points", values: points });

    document.querySelectorAll('.category').forEach(catDiv => {
        const catName = catDiv.querySelector('.category-header input').value.trim();
        const requiresSelect = catDiv.querySelector('.requiresSelect');
        const requires = Array.from(requiresSelect.selectedOptions).map(opt => opt.value);

        const options = [];
        catDiv.querySelectorAll('.option').forEach(optDiv => {
            const inputs = optDiv.querySelectorAll('input, textarea');
            const label = inputs[0].value.trim();
            const id = toId(label);

            const costRows = optDiv.querySelectorAll('.costsContainer > div');
            const cost = {};
            costRows.forEach(row => {
                const [typeSel, valInput] = row.querySelectorAll('select, input');
                const type = typeSel.value;
                const val = parseInt(valInput.value, 10);
                if (type && !isNaN(val)) cost[type] = val;
            });

            const img = inputs[1].value.trim();
            const description = inputs[2].value.trim();
            const prerequisites = Array.from(optDiv.querySelector('.prereqSelect').selectedOptions).map(opt => opt.value);
            const conflictsWith = Array.from(optDiv.querySelector('.conflictSelect').selectedOptions).map(opt => opt.value);
            const maxSelections = parseInt(inputs[3].value, 10);

            const opt = { id, label, cost, img, description };
            if (prerequisites.length) opt.prerequisites = prerequisites;
            if (conflictsWith.length) opt.conflictsWith = conflictsWith;
            if (!isNaN(maxSelections)) opt.maxSelections = maxSelections;

            options.push(opt);
        });

        const catEntry = { name: catName, options };
        if (requires.length) catEntry.requiresOption = requires;
        result.push(catEntry);
    });

    document.getElementById('outputJson').value = JSON.stringify(result, null, 2);
}
