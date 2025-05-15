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
    header.innerHTML = `<label>Category Name: <input placeholder="e.g., Abilities" /></label>`;

    const body = document.createElement('div');
    body.classList.add('category-body');

    const requires = [];
    const requiresContainer = document.createElement('div');

    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.classList.add('subcategories');

    const addSubcategoryBtn = document.createElement('button');
    addSubcategoryBtn.textContent = "+ Add Subcategory";
    addSubcategoryBtn.onclick = () => addSubcategory(subcategoriesContainer);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = "Remove Category";
    removeBtn.onclick = () => div.remove();

    header.style.cursor = "pointer";
    header.onclick = (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    body.appendChild(requiresContainer);
    body.appendChild(subcategoriesContainer);
    body.appendChild(addSubcategoryBtn);
    body.appendChild(removeBtn);

    div.appendChild(header);
    div.appendChild(body);
    container.appendChild(div);

    div._requires = requires;
    div._requiresContainer = requiresContainer;
    div._subcategoriesContainer = subcategoriesContainer;

    refreshAllSelectMenus();
}

function addSubcategory(container) {
    const div = document.createElement('div');
    div.classList.add('subcategory');

    const header = document.createElement('div');
    header.classList.add('subcategory-header');
    header.innerHTML = '<label>Subcategory Name: <input placeholder="e.g., Species" /></label>';

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    const addBtn = document.createElement('button');
    addBtn.textContent = "+ Add Option";
    addBtn.onclick = () => addOption(optionsDiv);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = "Remove Subcategory";
    removeBtn.onclick = () => div.remove();

    header.style.cursor = "pointer";
    header.onclick = (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
        optionsDiv.style.display = optionsDiv.style.display === "none" ? "block" : "none";
    };

    div.appendChild(header);
    div.appendChild(optionsDiv);
    div.appendChild(addBtn);
    div.appendChild(removeBtn);

    container.appendChild(div);
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
        if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
        body.style.display = body.style.display === "none" ? "block" : "none";
    };

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    optionsDiv.appendChild(wrapper);

    wrapper._prereq = prerequisites;
    wrapper._conflict = conflicts;
    wrapper._prereqContainer = prereqContainer;
    wrapper._conflictContainer = conflictContainer;

    refreshAllSelectMenus();
    updatePointTypes();
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

    // Subcategory-specific filtering can be applied here in the future
}
