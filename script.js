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

function createSelectList(container, labelText, registry, selectedIds, onChange) {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.textContent = labelText;

    const select = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select --';
    select.appendChild(defaultOption);

    registry.forEach(({ id, label }) => {
        if (!selectedIds.includes(id)) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = label;
            select.appendChild(opt);
        }
    });

    select.onchange = () => {
        if (select.value) {
            onChange(select.value);
            select.selectedIndex = 0;
        }
    };

    const list = document.createElement('ul');
    list.classList.add('select-list');

    selectedIds.forEach(id => {
        const item = document.createElement('li');
        const obj = registry.find(r => r.id === id);
        item.textContent = obj ? obj.label : id;
        const remove = document.createElement('button');
        remove.textContent = '❌';
        remove.onclick = () => {
            selectedIds.splice(selectedIds.indexOf(id), 1);
            wrapper.replaceWith(createSelectList(container, labelText, registry, selectedIds, onChange));
        };
        item.appendChild(remove);
        list.appendChild(item);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    wrapper.appendChild(list);
    return wrapper;
}

function addCategory() {
    const container = document.getElementById('categoriesContainer');
    const div = document.createElement('div');
    div.classList.add('category');

    const header = document.createElement('div');
    header.classList.add('category-header');
    header.innerHTML = `<label>Category Name: <input placeholder="e.g., Abilities" /></label>`;

    const body = document.createElement('div');
    body.classList.add('category-body');

    const requires = [];
    const requiresContainer = document.createElement('div');

    body.appendChild(requiresContainer);

    const subcategoriesDiv = document.createElement('div');
    subcategoriesDiv.classList.add('subcategories');

    const addSubBtn = document.createElement('button');
    addSubBtn.textContent = "+ Add Subcategory";
    addSubBtn.onclick = () => addSubcategory(subcategoriesDiv);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = "Remove Category";
    removeBtn.onclick = () => div.remove();

    body.appendChild(subcategoriesDiv);
    body.appendChild(addSubBtn);
    body.appendChild(removeBtn);

    div.appendChild(header);
    div.appendChild(body);
    container.appendChild(div);

    header.style.cursor = "pointer";
    header.onclick = (e) => {
        if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    div._requires = requires;
    div._requiresContainer = requiresContainer;
    div._subcategoriesDiv = subcategoriesDiv;

    refreshAllSelectMenus();
}

function addSubcategory(container) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('subcategory');

    const header = document.createElement('div');
    header.classList.add('subcategory-header');
    header.innerHTML = `<label>Subcategory Name: <input placeholder="e.g., Species" /></label>`;

    const body = document.createElement('div');
    body.classList.add('subcategory-body');

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    const maxSel = document.createElement('label');
    maxSel.innerHTML = `Max Options Selectable: <input type="number" class="max-options" placeholder="e.g., 2" />`;

    const addBtn = document.createElement('button');
    addBtn.textContent = "+ Add Option";
    addBtn.onclick = () => addOption(optionsDiv);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = "Remove Subcategory";
    removeBtn.onclick = () => wrapper.remove();

    body.appendChild(maxSel);
    body.appendChild(optionsDiv);
    body.appendChild(addBtn);
    body.appendChild(removeBtn);

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    wrapper._optionsDiv = optionsDiv;

    header.style.cursor = "pointer";
    header.onclick = (e) => {
        if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    container.appendChild(wrapper);
    refreshAllSelectMenus();
}

function addOption(optionsDiv) {
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

    const costDiv = document.createElement('div');
    costDiv.className = "costsContainer";

    const addCostBtn = document.createElement('button');
    addCostBtn.textContent = "+ Add Cost";
    addCostBtn.onclick = () => addCostRow(costDiv);

    const img = document.createElement('label');
    img.innerHTML = `Image URL: <input />`;

    const desc = document.createElement('label');
    desc.innerHTML = `Description: <textarea></textarea>`;

    const prerequisites = [];
    const conflicts = [];

    const prereqContainer = document.createElement('div');
    const conflictContainer = document.createElement('div');

    const maxSel = document.createElement('label');
    maxSel.innerHTML = `Max Selections: <input type="number" placeholder="1" />`;

    const remove = document.createElement('button');
    remove.textContent = "Remove Option";
    remove.onclick = () => wrapper.remove();

    body.appendChild(costDiv);
    body.appendChild(addCostBtn);
    body.appendChild(img);
    body.appendChild(desc);
    body.appendChild(prereqContainer);
    body.appendChild(conflictContainer);
    body.appendChild(maxSel);
    body.appendChild(remove);

    header.onclick = (e) => {
        if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    wrapper._prereq = prerequisites;
    wrapper._conflict = conflicts;
    wrapper._prereqContainer = prereqContainer;
    wrapper._conflictContainer = conflictContainer;

    optionsDiv.appendChild(wrapper);
    refreshAllSelectMenus();
}

function addCostRow(container) {
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

    document.querySelectorAll('.category').forEach(catDiv => {
        const registry = optionRegistry;

        const list = catDiv._requires || [];
        const container = catDiv._requiresContainer;
        container.innerHTML = '';
        container.appendChild(createSelectList(catDiv, "Requires Option(s):", registry, list, id => {
            list.push(id);
            refreshAllSelectMenus();
        }));
    });

    optionRegistry.forEach(({ id: currentId, element: currentElement }) => {
        const registry = optionRegistry.filter(o => o.id !== currentId);
        const prereq = currentElement._prereq || [];
        const conflict = currentElement._conflict || [];
        const prereqContainer = currentElement._prereqContainer;
        const conflictContainer = currentElement._conflictContainer;
        prereqContainer.innerHTML = '';
        conflictContainer.innerHTML = '';
        prereqContainer.appendChild(createSelectList(currentElement, "Prerequisites:", registry, prereq, id => {
            prereq.push(id);
            refreshAllSelectMenus();
        }));
        conflictContainer.appendChild(createSelectList(currentElement, "Conflicts With:", registry, conflict, id => {
            conflict.push(id);
            refreshAllSelectMenus();
        }));
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
        const requires = catDiv._requires || [];

        const subcategories = [];
        catDiv._subcategoriesDiv?.querySelectorAll('.subcategory').forEach(subDiv => {
            const subName = subDiv.querySelector('input').value.trim();
            const options = [];

            subDiv.querySelectorAll('.option').forEach(optDiv => {
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
                const maxSelections = parseInt(inputs[3].value, 10);
                const prerequisites = optDiv._prereq || [];
                const conflictsWith = optDiv._conflict || [];

                const opt = { id, label, cost, img, description };
                if (prerequisites.length) opt.prerequisites = prerequisites;
                if (conflictsWith.length) opt.conflictsWith = conflictsWith;
                if (!isNaN(maxSelections)) opt.maxSelections = maxSelections;

                options.push(opt);
            });

            const maxOptionsInput = subDiv.querySelector('.max-options');
            const maxOptions = parseInt(maxOptionsInput?.value, 10);

            if (subName) {
                const subObj = { name: subName, options };
                if (!isNaN(maxOptions)) subObj.maxSelections = maxOptions;
                subcategories.push(subObj);
            }
        });

        const catEntry = { name: catName };
        if (requires.length) catEntry.requiresOption = requires;
        if (subcategories.length) catEntry.subcategories = subcategories;
        result.push(catEntry);
    });

    document.getElementById('outputJson').value = JSON.stringify(result, null, 2);
}

function handleImport() {
    const input = document.getElementById('modalTextarea').value;
    let data;
    try {
        data = JSON.parse(input);
    } catch (e) {
        alert(`Invalid JSON format:\n\n${e.message}`);
        return;
    }

    let isValid = true;
    const allOptionIds = new Set();
    const errors = [];

    // 🔍 Pre-validation loop
    data.forEach(entry => {
        if (entry.name && entry.subcategories) {
            const catName = entry.name;
            const catOptionIds = new Set();

            entry.subcategories.forEach(sub => {
                sub.options?.forEach(opt => {
                    const { id, label, prerequisites = [], conflictsWith = [] } = opt;

                    if (!id) return;

                    if (catOptionIds.has(id)) {
                        errors.push(`❌ Duplicate option ID "${id}" in category "${catName}".`);
                        isValid = false;
                    }

                    if (prerequisites.includes(id)) {
                        errors.push(`❌ Option "${label}" in "${catName}" cannot be a prerequisite of itself.`);
                        isValid = false;
                    }

                    if (conflictsWith.includes(id)) {
                        errors.push(`❌ Option "${label}" in "${catName}" cannot conflict with itself.`);
                        isValid = false;
                    }

                    catOptionIds.add(id);
                    allOptionIds.add(id);
                });
            });

            // Category can't be locked by one of its own options
            if (entry.requiresOption) {
                entry.requiresOption.forEach(lockId => {
                    if (catOptionIds.has(lockId)) {
                        errors.push(`❌ Category "${catName}" cannot be locked by its own option ("${lockId}").`);
                        isValid = false;
                    }
                });
            }
        }
    });

    if (!isValid) {
        alert(`Import aborted due to the following error(s):\n\n${errors.join('\n')}`);
        return;
    }

    // ✅ Clear UI
    document.getElementById('titleInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('headerImageInput').value = '';
    document.getElementById('pointsContainer').innerHTML = '';
    document.getElementById('categoriesContainer').innerHTML = '';
    pointTypes = [];
    optionRegistry = [];

    // 🧱 Rebuild UI
    data.forEach(entry => {
        if (entry.type === "title") {
            document.getElementById('titleInput').value = entry.text;
        } else if (entry.type === "description") {
            document.getElementById('descriptionInput').value = entry.text;
        } else if (entry.type === "headerImage") {
            document.getElementById('headerImageInput').value = entry.url;
        } else if (entry.type === "points") {
            Object.entries(entry.values).forEach(([pt, val]) => {
                addPointType();
                const div = [...document.querySelectorAll('#pointsContainer > div')].pop();
                const inputs = div.querySelectorAll('input');
                inputs[0].value = pt;
                inputs[1].value = val;
            });
            updatePointTypes();
        } else if (entry.name) {
            addCategory();
            const div = [...document.querySelectorAll('.category')].pop();
            div.querySelector('.category-header input').value = entry.name;
            if (entry.requiresOption?.length) div._requires.push(...entry.requiresOption);

            entry.subcategories?.forEach(sub => {
                addSubcategory(div._subcategoriesDiv);
                const subDiv = [...div._subcategoriesDiv.querySelectorAll('.subcategory')].pop();
                subDiv.querySelector('input').value = sub.name;
                if (!isNaN(sub.maxSelections)) {
                    subDiv.querySelector('.max-options').value = sub.maxSelections;
                }

                sub.options?.forEach(opt => {
                    addOption(subDiv._optionsDiv);
                    const optDiv = [...subDiv._optionsDiv.querySelectorAll('.option')].pop();
                    const inputs = optDiv.querySelectorAll('input, textarea');
                    inputs[0].value = opt.label;
                    updateAutoId(inputs[0]);

                    if (opt.cost) {
                        Object.entries(opt.cost).forEach(([pt, val]) => {
                            addCostRow(optDiv.querySelector('.costsContainer'));
                            const row = [...optDiv.querySelectorAll('.costsContainer > div')].pop();
                            const [sel, input] = row.querySelectorAll('select, input');
                            sel.value = pt;
                            input.value = val;
                        });
                    }

                    inputs[1].value = opt.img || '';
                    inputs[2].value = opt.description || '';
                    inputs[3].value = opt.maxSelections || '';

                    if (opt.prerequisites) optDiv._prereq.push(...opt.prerequisites);
                    if (opt.conflictsWith) optDiv._conflict.push(...opt.conflictsWith);
                });
            });
        }
    });

    refreshAllSelectMenus();
    document.getElementById('modal').style.display = 'none';
}



document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('importBtn').onclick = () => {
        document.getElementById('modalTitle').textContent = "Import Configuration";
        document.getElementById('modalTextarea').value = '';
        document.getElementById('modalConfirmBtn').onclick = handleImport;
        document.getElementById('modal').style.display = 'block';
    };

    document.getElementById('modalClose').onclick = () => {
        document.getElementById('modal').style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === document.getElementById('modal')) {
            document.getElementById('modal').style.display = 'none';
        }
    };
});
