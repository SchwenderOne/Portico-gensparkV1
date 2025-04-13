/**
 * main.js - Core functionality for Portico Form Builder
 * Handles initialization, UI interactions, and form management
 */

// Global state
const state = {
    currentForm: {
        id: generateId(),
        title: 'Untitled Form',
        description: 'This is a description of your form. Click to edit.',
        fields: []
    },
    selectedField: null,
    isDragging: false,
    formChanged: false
};

// DOM elements
const elements = {
    // Main sections
    formTitle: document.getElementById('formTitle'),
    formDescription: document.getElementById('formDescription'),
    formFields: document.getElementById('formFields'),
    dropZone: document.getElementById('dropZone'),
    
    // Buttons
    saveBtn: document.getElementById('saveBtn'),
    previewBtn: document.getElementById('previewBtn'),
    shareBtn: document.getElementById('shareBtn'),
    browseTemplatesBtn: document.getElementById('browseTemplatesBtn'),
    addLogicBtn: document.getElementById('addLogicBtn'),
    
    // Property panels
    fieldLabelInput: document.getElementById('fieldLabelInput'),
    descriptionInput: document.getElementById('descriptionInput'),
    fontSelect: document.getElementById('fontSelect'),
    sizeSelect: document.getElementById('sizeSelect'),
    requiredField: document.getElementById('requiredField'),
    showErrorMessage: document.getElementById('showErrorMessage'),
    
    // Tabs
    categoryTabs: document.querySelectorAll('.category-tab'),
    propertyTabs: document.querySelectorAll('.property-tab'),
    
    // Modals
    previewModal: document.getElementById('previewModal'),
    shareModal: document.getElementById('shareModal'),
    templatesModal: document.getElementById('templatesModal'),
    logicModal: document.getElementById('logicModal'),
    
    // Other elements
    colorOptions: document.querySelectorAll('.color-option'),
    alignmentBtns: document.querySelectorAll('.alignment-btn')
};

// Initialize the application
function init() {
    // Load form data from local storage if available
    loadFormData();
    
    // Initialize UI
    renderForm();
    setupEventListeners();
    
    // Show welcome message
    console.log('Portico Form Builder initialized');
}

// Setup all event listeners
function setupEventListeners() {
    // Tab switching
    elements.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => switchCategoryTab(tab));
    });
    
    elements.propertyTabs.forEach(tab => {
        tab.addEventListener('click', () => switchPropertyTab(tab));
    });
    
    // Form header editing
    elements.formTitle.addEventListener('input', updateFormTitle);
    elements.formDescription.addEventListener('input', updateFormDescription);
    
    // Button click handlers
    elements.saveBtn.addEventListener('click', saveForm);
    elements.previewBtn.addEventListener('click', previewForm);
    elements.shareBtn.addEventListener('click', shareForm);
    elements.browseTemplatesBtn.addEventListener('click', openTemplatesModal);
    elements.addLogicBtn.addEventListener('click', openLogicModal);
    
    // Property panel interactions
    elements.fieldLabelInput.addEventListener('input', updateFieldLabel);
    elements.descriptionInput.addEventListener('input', updateFieldDescription);
    elements.fontSelect.addEventListener('change', updateFieldFont);
    elements.sizeSelect.addEventListener('change', updateFieldSize);
    elements.requiredField.addEventListener('change', updateFieldRequired);
    elements.showErrorMessage.addEventListener('change', updateErrorMessage);
    
    // Color and alignment options
    elements.colorOptions.forEach(option => {
        option.addEventListener('click', () => setFieldColor(option.dataset.color));
    });
    
    elements.alignmentBtns.forEach(btn => {
        btn.addEventListener('click', () => setFieldAlignment(btn.dataset.align));
    });
    
    // Close modals when clicking the X or outside the modal
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Select field when clicked
    elements.formFields.addEventListener('click', handleFieldSelection);
    
    // Template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => applyTemplate(card.dataset.template));
    });
    
    // Copy share link
    document.getElementById('copyLinkBtn')?.addEventListener('click', copyShareLink);
    
    // Save logic rules
    document.getElementById('saveLogicBtn')?.addEventListener('click', saveLogicRules);
    document.getElementById('cancelLogicBtn')?.addEventListener('click', closeModals);
    document.getElementById('addConditionBtn')?.addEventListener('click', addLogicCondition);
}

// Switch between category tabs in the left sidebar
function switchCategoryTab(selectedTab) {
    // Remove active class from all tabs
    elements.categoryTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to selected tab
    selectedTab.classList.add('active');
    
    // Filter elements based on category
    const category = selectedTab.dataset.category;
    const formElements = document.querySelectorAll('.form-element');
    
    formElements.forEach(element => {
        if (category === 'all' || element.dataset.category === category) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

// Switch between property tabs in the right sidebar
function switchPropertyTab(selectedTab) {
    // Remove active class from all tabs
    elements.propertyTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to selected tab
    selectedTab.classList.add('active');
    
    // Hide all property panels
    document.querySelectorAll('.property-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected property panel
    const tabName = selectedTab.dataset.tab;
    const panelId = tabName + 'Panel';
    document.getElementById(panelId).classList.add('active');
}

// Handle form field selection
function handleFieldSelection(e) {
    const fieldElement = e.target.closest('.form-field');
    if (!fieldElement) return;
    
    // Deselect all fields
    document.querySelectorAll('.form-field').forEach(field => {
        field.classList.remove('selected');
    });
    
    // Select clicked field
    fieldElement.classList.add('selected');
    
    // Update state
    state.selectedField = fieldElement.dataset.fieldId;
    
    // Update properties panel
    updatePropertiesPanel(fieldElement);
}

// Update properties panel with selected field values
function updatePropertiesPanel(fieldElement) {
    // Get field values
    const label = fieldElement.querySelector('label')?.innerText || '';
    const description = fieldElement.querySelector('.field-description')?.innerText || '';
    
    // Update inputs
    elements.fieldLabelInput.value = label;
    elements.descriptionInput.value = description;
    
    // Update font and size if set
    const font = fieldElement.style.fontFamily || 'Inter';
    const size = fieldElement.dataset.size || 'normal';
    
    elements.fontSelect.value = font;
    elements.sizeSelect.value = size;
    
    // Update required checkbox
    elements.requiredField.checked = fieldElement.dataset.required === 'true';
    
    // Update show error message checkbox
    elements.showErrorMessage.checked = fieldElement.dataset.showError === 'true';
    
    // Update color selection
    const fieldColor = fieldElement.dataset.color || '#1e88e5';
    elements.colorOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === fieldColor) {
            option.classList.add('selected');
        }
    });
    
    // Update alignment
    const alignment = fieldElement.dataset.alignment || 'left';
    elements.alignmentBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.align === alignment) {
            btn.classList.add('active');
        }
    });
}

// Update field label when changed in properties panel
function updateFieldLabel() {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    const label = elements.fieldLabelInput.value;
    fieldElement.querySelector('label').innerText = label;
    
    state.formChanged = true;
}

// Update field description when changed in properties panel
function updateFieldDescription() {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    const description = elements.descriptionInput.value;
    
    // Find or create description element
    let descElement = fieldElement.querySelector('.field-description');
    if (!descElement && description) {
        descElement = document.createElement('div');
        descElement.className = 'field-description';
        fieldElement.querySelector('.field-header').appendChild(descElement);
    }
    
    if (descElement) {
        if (description) {
            descElement.innerText = description;
        } else {
            descElement.remove();
        }
    }
    
    state.formChanged = true;
}

// Update field font when changed in properties panel
function updateFieldFont() {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    const font = elements.fontSelect.value;
    fieldElement.style.fontFamily = font;
    fieldElement.dataset.font = font;
    
    state.formChanged = true;
}

// Update field size when changed in properties panel
function updateFieldSize() {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    const size = elements.sizeSelect.value;
    const label = fieldElement.querySelector('label');
    
    // Remove existing size classes
    label.classList.remove('size-small', 'size-normal', 'size-large', 'size-xlarge');
    
    // Add new size class
    label.classList.add(`size-${size}`);
    fieldElement.dataset.size = size;
    
    state.formChanged = true;
}

// Set field as required/not required
function updateFieldRequired() {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    const required = elements.requiredField.checked;
    fieldElement.dataset.required = required;
    
    // Add/remove required indicator
    const label = fieldElement.querySelector('label');
    if (required) {
        // Add required indicator if not already present
        if (!label.querySelector('.required-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator';
            indicator.innerText = ' *';
            indicator.style.color = 'red';
            label.appendChild(indicator);
        }
    } else {
        // Remove required indicator if present
        const indicator = label.querySelector('.required-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    state.formChanged = true;
}

// Toggle error message display
function updateErrorMessage() {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    const showError = elements.showErrorMessage.checked;
    fieldElement.dataset.showError = showError;
    
    // Add/remove error message container
    if (showError) {
        // Add error message if not already present
        if (!fieldElement.querySelector('.error-message')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerText = 'This field is required';
            errorDiv.style.color = 'red';
            errorDiv.style.fontSize = '0.75rem';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.style.display = 'none';
            fieldElement.appendChild(errorDiv);
        }
    } else {
        // Remove error message if present
        const errorMessage = fieldElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    state.formChanged = true;
}

// Set field text color
function setFieldColor(color) {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    // Update color selection in UI
    elements.colorOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === color) {
            option.classList.add('selected');
        }
    });
    
    // Set color on field elements
    const label = fieldElement.querySelector('label');
    if (label) {
        label.style.color = color;
    }
    
    fieldElement.dataset.color = color;
    state.formChanged = true;
}

// Set field text alignment
function setFieldAlignment(alignment) {
    if (!state.selectedField) return;
    
    const fieldElement = document.querySelector(`.form-field[data-field-id="${state.selectedField}"]`);
    if (!fieldElement) return;
    
    // Update alignment selection in UI
    elements.alignmentBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.align === alignment) {
            btn.classList.add('active');
        }
    });
    
    // Set alignment on field elements
    fieldElement.style.textAlign = alignment;
    fieldElement.dataset.alignment = alignment;
    
    state.formChanged = true;
}

// Update form title
function updateFormTitle() {
    state.currentForm.title = elements.formTitle.innerText;
    state.formChanged = true;
}

// Update form description
function updateFormDescription() {
    state.currentForm.description = elements.formDescription.innerText;
    state.formChanged = true;
}

// Save form data
function saveForm() {
    // Update form data in state
    updateFormData();
    
    // Save to localStorage
    localStorage.setItem('portico_current_form', JSON.stringify(state.currentForm));
    
    // Show success message
    showNotification('Form saved successfully');
    
    state.formChanged = false;
}

// Update form data from current UI state
function updateFormData() {
    const fields = [];
    
    document.querySelectorAll('.form-field').forEach(fieldElement => {
        const field = {
            id: fieldElement.dataset.fieldId,
            type: fieldElement.dataset.type || 'text',
            label: fieldElement.querySelector('label')?.innerText || '',
            description: fieldElement.querySelector('.field-description')?.innerText || '',
            required: fieldElement.dataset.required === 'true',
            showError: fieldElement.dataset.showError === 'true',
            font: fieldElement.dataset.font || 'Inter',
            size: fieldElement.dataset.size || 'normal',
            color: fieldElement.dataset.color || '#1e88e5',
            alignment: fieldElement.dataset.alignment || 'left',
            placeholder: fieldElement.querySelector('input, textarea, select')?.placeholder || '',
            options: getFieldOptions(fieldElement)
        };
        
        fields.push(field);
    });
    
    state.currentForm.fields = fields;
}

// Get options for select/radio/checkbox fields
function getFieldOptions(fieldElement) {
    const options = [];
    
    if (fieldElement.dataset.type === 'dropdown') {
        const selectElement = fieldElement.querySelector('select');
        if (selectElement) {
            Array.from(selectElement.options).forEach(option => {
                if (!option.disabled) {
                    options.push({
                        value: option.value,
                        label: option.innerText
                    });
                }
            });
        }
    } else if (fieldElement.dataset.type === 'radio-button') {
        fieldElement.querySelectorAll('input[type="radio"]').forEach(radio => {
            options.push({
                value: radio.value,
                label: radio.nextElementSibling.innerText
            });
        });
    }
    
    return options;
}

// Load form data from localStorage
function loadFormData() {
    const savedForm = localStorage.getItem('portico_current_form');
    if (savedForm) {
        try {
            state.currentForm = JSON.parse(savedForm);
        } catch (error) {
            console.error('Error loading saved form:', error);
        }
    }
}

// Render form from state
function renderForm() {
    // Update form title and description
    elements.formTitle.innerText = state.currentForm.title;
    elements.formDescription.innerText = state.currentForm.description;
    
    // Clear existing fields
    // We're not clearing fields in this implementation because they're already in the HTML
    // In a real app, you'd clear and re-render based on state
}

// Open preview modal
function previewForm() {
    // Update form data
    updateFormData();
    
    // Get preview form container
    const previewForm = document.getElementById('previewForm');
    previewForm.innerHTML = '';
    
    // Add form header
    const formHeader = document.createElement('div');
    formHeader.className = 'preview-form-header';
    
    const formTitle = document.createElement('h2');
    formTitle.innerText = state.currentForm.title;
    
    const formDescription = document.createElement('p');
    formDescription.innerText = state.currentForm.description;
    
    formHeader.appendChild(formTitle);
    formHeader.appendChild(formDescription);
    previewForm.appendChild(formHeader);
    
    // Add form fields
    state.currentForm.fields.forEach(field => {
        const fieldElement = createPreviewField(field);
        previewForm.appendChild(fieldElement);
    });
    
    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'preview-submit-btn';
    submitButton.innerText = 'Submit';
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Form submitted successfully! (This is a preview)');
    });
    
    previewForm.appendChild(submitButton);
    
    // Show modal
    elements.previewModal.style.display = 'block';
}

// Create field element for preview
function createPreviewField(field) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'preview-field';
    
    // Add label
    const label = document.createElement('label');
    label.innerText = field.label;
    label.style.fontFamily = field.font;
    label.style.color = field.color;
    label.style.textAlign = field.alignment;
    
    // Add required indicator if needed
    if (field.required) {
        const indicator = document.createElement('span');
        indicator.className = 'required-indicator';
        indicator.innerText = ' *';
        indicator.style.color = 'red';
        label.appendChild(indicator);
    }
    
    fieldElement.appendChild(label);
    
    // Add description if exists
    if (field.description) {
        const description = document.createElement('div');
        description.className = 'field-description';
        description.innerText = field.description;
        fieldElement.appendChild(description);
    }
    
    // Add input based on field type
    switch (field.type) {
        case 'text-input':
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'preview-input';
            textInput.placeholder = field.placeholder;
            textInput.required = field.required;
            fieldElement.appendChild(textInput);
            break;
            
        case 'text-area':
            const textarea = document.createElement('textarea');
            textarea.className = 'preview-textarea';
            textarea.placeholder = field.placeholder;
            textarea.required = field.required;
            textarea.rows = 4;
            fieldElement.appendChild(textarea);
            break;
            
        case 'email':
            const email = document.createElement('input');
            email.type = 'email';
            email.className = 'preview-input';
            email.placeholder = field.placeholder || 'example@email.com';
            email.required = field.required;
            fieldElement.appendChild(email);
            break;
            
        case 'phone':
            const phone = document.createElement('input');
            phone.type = 'tel';
            phone.className = 'preview-input';
            phone.placeholder = field.placeholder || '+1 (555) 123-4567';
            phone.required = field.required;
            fieldElement.appendChild(phone);
            break;
            
        case 'dropdown':
            const select = document.createElement('select');
            select.className = 'preview-select';
            select.required = field.required;
            
            // Add placeholder option
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.innerText = field.placeholder || 'Select an option';
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            select.appendChild(placeholderOption);
            
            // Add options
            if (field.options && field.options.length > 0) {
                field.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.innerText = option.label;
                    select.appendChild(optionElement);
                });
            } else {
                // Default options if none provided
                const options = ['Option 1', 'Option 2', 'Option 3'];
                options.forEach((option, index) => {
                    const optionElement = document.createElement('option');
                    optionElement.value = 'option-' + (index + 1);
                    optionElement.innerText = option;
                    select.appendChild(optionElement);
                });
            }
            
            fieldElement.appendChild(select);
            break;
            
        case 'checkbox':
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'preview-' + field.id;
            checkbox.required = field.required;
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = 'preview-' + field.id;
            checkboxLabel.innerText = field.label;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            
            // Replace the previously added label
            fieldElement.innerHTML = '';
            fieldElement.appendChild(checkboxContainer);
            break;
            
        case 'date':
            const date = document.createElement('input');
            date.type = 'date';
            date.className = 'preview-input';
            date.required = field.required;
            fieldElement.appendChild(date);
            break;
            
        case 'file-upload':
            const file = document.createElement('input');
            file.type = 'file';
            file.className = 'preview-file-input';
            file.required = field.required;
            fieldElement.appendChild(file);
            break;
            
        default:
            const defaultInput = document.createElement('input');
            defaultInput.type = 'text';
            defaultInput.className = 'preview-input';
            defaultInput.placeholder = field.placeholder;
            defaultInput.required = field.required;
            fieldElement.appendChild(defaultInput);
    }
    
    // Add error message if enabled
    if (field.showError && field.required) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'preview-error-message';
        errorMessage.innerText = 'This field is required';
        errorMessage.style.color = 'red';
        errorMessage.style