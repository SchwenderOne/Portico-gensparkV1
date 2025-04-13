/**
 * form-logic.js - Conditional Logic functionality for Portico Form Builder
 * Handles creation and application of logical conditions for form fields
 */

// State for conditional logic
const logicState = {
    currentFieldId: null,
    conditions: {},  // Stores conditions for each field
    activeField: null
};

// DOM elements for logic functionality
const logicElements = {
    logicModal: document.getElementById('logicModal'),
    logicAction: document.getElementById('logicAction'),
    logicMatchType: document.getElementById('logicMatchType'),
    conditionContainer: document.querySelector('.logic-conditions'),
    addConditionBtn: document.getElementById('addConditionBtn'),
    saveLogicBtn: document.getElementById('saveLogicBtn'),
    cancelLogicBtn: document.getElementById('cancelLogicBtn')
};

// Initialize logic functionality
function initLogic() {
    // Set up event listeners
    document.getElementById('addLogicBtn').addEventListener('click', openLogicModal);
    
    if (logicElements.addConditionBtn) {
        logicElements.addConditionBtn.addEventListener('click', addLogicCondition);
    }
    
    if (logicElements.saveLogicBtn) {
        logicElements.saveLogicBtn.addEventListener('click', saveLogicRules);
    }
    
    if (logicElements.cancelLogicBtn) {
        logicElements.cancelLogicBtn.addEventListener('click', closeLogicModal);
    }
    
    // Load existing logic rules if any
    loadLogicRules();
}

// Open logic modal for the selected field
function openLogicModal() {
    if (!state.selectedField) {
        showNotification('Please select a field first');
        return;
    }
    
    // Store the current field ID
    logicState.currentFieldId = state.selectedField;
    logicState.activeField = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    
    // Clear previous conditions
    if (logicElements.conditionContainer) {
        logicElements.conditionContainer.innerHTML = '';
    }
    
    // Add initial condition
    addLogicCondition();
    
    // Populate field dropdown with all other fields
    populateFieldDropdowns();
    
    // Load existing conditions for this field if any
    loadFieldConditions();
    
    // Show the modal
    logicElements.logicModal.style.display = 'block';
}

// Add a new condition row to the logic modal
function addLogicCondition() {
    if (!logicElements.conditionContainer) return;
    
    const conditionRow = document.createElement('div');
    conditionRow.className = 'logic-condition';
    
    // Create field selector
    const fieldSelect = document.createElement('select');
    fieldSelect.className = 'condition-field';
    fieldSelect.innerHTML = '<option value="">Select a field</option>';
    
    // Create operator selector
    const operatorSelect = document.createElement('select');
    operatorSelect.className = 'condition-operator';
    operatorSelect.innerHTML = `
        <option value="equals">equals</option>
        <option value="not_equals">does not equal</option>
        <option value="contains">contains</option>
        <option value="not_contains">does not contain</option>
        <option value="greater_than">is greater than</option>
        <option value="less_than">is less than</option>
    `;
    
    // Create value input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'condition-value';
    valueInput.placeholder = 'Value';
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-condition-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => {
        conditionRow.remove();
    });
    
    // Add everything to the condition row
    conditionRow.appendChild(fieldSelect);
    conditionRow.appendChild(operatorSelect);
    conditionRow.appendChild(valueInput);
    conditionRow.appendChild(removeBtn);
    
    // Add to container
    logicElements.conditionContainer.appendChild(conditionRow);
    
    // Populate the field dropdown
    populateFieldSelect(fieldSelect);
}

// Populate all field selectors with available fields
function populateFieldDropdowns() {
    const fieldSelects = document.querySelectorAll('.condition-field');
    fieldSelects.forEach(select => {
        populateFieldSelect(select);
    });
}

// Populate a single field select with options
function populateFieldSelect(select) {
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.options.remove(1);
    }
    
    // Get all form fields except the current one
    const fields = Array.from(document.querySelectorAll('.form-field')).filter(field => {
        return field.dataset.fieldId !== logicState.currentFieldId;
    });
    
    // Add each field as an option
    fields.forEach(field => {
        const label = field.querySelector('label')?.innerText || 'Unnamed Field';
        const option = document.createElement('option');
        option.value = field.dataset.fieldId;
        option.innerText = label;
        select.appendChild(option);
    });
}

// Load existing conditions for the selected field
function loadFieldConditions() {
    if (!logicState.currentFieldId) return;
    
    // Get conditions for this field
    const fieldConditions = logicState.conditions[logicState.currentFieldId];
    if (!fieldConditions) return;
    
    // Set action
    if (logicElements.logicAction) {
        logicElements.logicAction.value = fieldConditions.action || 'show';
    }
    
    // Set match type
    if (logicElements.logicMatchType) {
        logicElements.logicMatchType.value = fieldConditions.matchType || 'all';
    }
    
    // Clear existing condition rows
    if (logicElements.conditionContainer) {
        logicElements.conditionContainer.innerHTML = '';
    }
    
    // Add each condition
    if (fieldConditions.conditions && fieldConditions.conditions.length > 0) {
        fieldConditions.conditions.forEach(condition => {
            addConditionRow(condition);
        });
    } else {
        // Add a default empty condition
        addLogicCondition();
    }
}

// Add a condition row with pre-filled values
function addConditionRow(condition) {
    if (!logicElements.conditionContainer) return;
    
    const conditionRow = document.createElement('div');
    conditionRow.className = 'logic-condition';
    
    // Create field selector
    const fieldSelect = document.createElement('select');
    fieldSelect.className = 'condition-field';
    fieldSelect.innerHTML = '<option value="">Select a field</option>';
    
    // Create operator selector
    const operatorSelect = document.createElement('select');
    operatorSelect.className = 'condition-operator';
    operatorSelect.innerHTML = `
        <option value="equals">equals</option>
        <option value="not_equals">does not equal</option>
        <option value="contains">contains</option>
        <option value="not_contains">does not contain</option>
        <option value="greater_than">is greater than</option>
        <option value="less_than">is less than</option>
    `;
    
    // Create value input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'condition-value';
    valueInput.placeholder = 'Value';
    
    // Set values from condition
    if (condition.field) {
        fieldSelect.value = condition.field;
    }
    
    if (condition.operator) {
        operatorSelect.value = condition.operator;
    }
    
    if (condition.value) {
        valueInput.value = condition.value;
    }
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-condition-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => {
        conditionRow.remove();
    });
    
    // Add everything to the condition row
    conditionRow.appendChild(fieldSelect);
    conditionRow.appendChild(operatorSelect);
    conditionRow.appendChild(valueInput);
    conditionRow.appendChild(removeBtn);
    
    // Add to container
    logicElements.conditionContainer.appendChild(conditionRow);
    
    // Populate the field dropdown
    populateFieldSelect(fieldSelect);
    
    // Set the selected field
    if (condition.field) {
        fieldSelect.value = condition.field;
    }
}

// Save logic rules when clicking Save button
function saveLogicRules() {
    if (!logicState.currentFieldId) return;
    
    // Get all conditions
    const conditionRows = document.querySelectorAll('.logic-condition');
    const conditions = [];
    
    // Extract data from each condition row
    conditionRows.forEach(row => {
        const fieldSelect = row.querySelector('.condition-field');
        const operatorSelect = row.querySelector('.condition-operator');
        const valueInput = row.querySelector('.condition-value');
        
        if (fieldSelect && fieldSelect.value && operatorSelect && valueInput) {
            conditions.push({
                field: fieldSelect.value,
                operator: operatorSelect.value,
                value: valueInput.value
            });
        }
    });
    
    // Get action and match type
    const action = logicElements.logicAction ? logicElements.logicAction.value : 'show';
    const matchType = logicElements.logicMatchType ? logicElements.logicMatchType.value : 'all';
    
    // Store conditions for this field
    logicState.conditions[logicState.currentFieldId] = {
        action,
        matchType,
        conditions
    };
    
    // Mark the field as having logic
    if (logicState.activeField) {
        logicState.activeField.dataset.hasLogic = 'true';
        
        // Add a visual indicator that the field has logic
        if (!logicState.activeField.querySelector('.logic-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'logic-indicator';
            indicator.innerHTML = '<i class="fas fa-code-branch"></i>';
            indicator.title = 'This field has conditional logic';
            indicator.style.position = 'absolute';
            indicator.style.top = '0.5rem';
            indicator.style.right = '0.5rem';
            indicator.style.color = '#1e88e5';
            logicState.activeField.style.position = 'relative';
            logicState.activeField.appendChild(indicator);
        }
    }
    
    // Save to localStorage
    saveLogicToStorage();
    
    // Close the modal
    closeLogicModal();
    
    // Show success message
    showNotification('Logic rules saved successfully');
    
    // Update form changed flag
    state.formChanged = true;
}

// Save logic rules to localStorage
function saveLogicToStorage() {
    localStorage.setItem('portico_form_logic', JSON.stringify(logicState.conditions));
}

// Load logic rules from localStorage
function loadLogicRules() {
    const savedLogic = localStorage.getItem('portico_form_logic');
    if (savedLogic) {
        try {
            logicState.conditions = JSON.parse(savedLogic);
            
            // Mark fields that have logic
            Object.keys(logicState.conditions).forEach(fieldId => {
                const field = document.querySelector(`.form-field[data-field-id="${fieldId}"]`);
                if (field) {
                    field.dataset.hasLogic = 'true';
                    
                    // Add visual indicator
                    if (!field.querySelector('.logic-indicator')) {
                        const indicator = document.createElement('div');
                        indicator.className = 'logic-indicator';
                        indicator.innerHTML = '<i class="fas fa-code-branch"></i>';
                        indicator.title = 'This field has conditional logic';
                        indicator.style.position = 'absolute';
                        indicator.style.top = '0.5rem';
                        indicator.style.right = '0.5rem';
                        indicator.style.color = '#1e88e5';
                        field.style.position = 'relative';
                        field.appendChild(indicator);
                    }
                }
            });
        } catch (error) {
            console.error('Error loading logic rules:', error);
        }
    }
}

// Close the logic modal
function closeLogicModal() {
    logicElements.logicModal.style.display = 'none';
    logicState.currentFieldId = null;
    logicState.activeField = null;
}

// Apply logic rules in preview mode
function applyLogicRules() {
    // This would be called when previewing the form
    // It evaluates all conditions and shows/hides fields accordingly
    Object.keys(logicState.conditions).forEach(fieldId => {
        const field = document.querySelector(`.preview-form .preview-field[data-field-id="${fieldId}"]`);
        if (!field) return;
        
        const logic = logicState.conditions[fieldId];
        if (!logic || !logic.conditions || logic.conditions.length === 0) return;
        
        // Evaluate conditions
        const results = logic.conditions.map(condition => {
            return evaluateCondition(condition);
        });
        
        // Check if conditions are met based on match type
        let conditionsMet = false;
        if (logic.matchType === 'all') {
            conditionsMet = results.every(result => result);
        } else {
            conditionsMet = results.some(result => result);
        }
        
        // Apply action
        if (logic.action === 'show') {
            field.style.display = conditionsMet ? 'block' : 'none';
        } else if (logic.action === 'hide') {
            field.style.display = conditionsMet ? 'none' : 'block';
        } else if (logic.action === 'require') {
            const input = field.querySelector('input, textarea, select');
            if (input) {
                input.required = conditionsMet;
            }
        }
    });
}

// Evaluate a single condition
function evaluateCondition(condition) {
    const field = document.querySelector(`.preview-form .preview-field[data-field-id="${condition.field}"]`);
    if (!field) return false;
    
    const input = field.querySelector('input, textarea, select');
    if (!input) return false;
    
    const fieldValue = input.value;
    const conditionValue = condition.value;
    
    switch (condition.operator) {
        case 'equals':
            return fieldValue === conditionValue;
        case 'not_equals':
            return fieldValue !== conditionValue;
        case 'contains':
            return fieldValue.includes(conditionValue);
        case 'not_contains':
            return !fieldValue.includes(conditionValue);
        case 'greater_than':
            return parseFloat(fieldValue) > parseFloat(conditionValue);
        case 'less_than':
            return parseFloat(fieldValue) < parseFloat(conditionValue);
        default:
            return false;
    }
}

// Initialize logic when DOM is loaded
document.addEventListener('DOMContentLoaded', initLogic);
